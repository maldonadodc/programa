from __future__ import annotations

import random
from copy import deepcopy
from typing import Any

from fastapi import HTTPException, status

from app.data.store import demons
from app.modules.payment.service import process_payment


AGENT_ACTIONS = ("attack", "defend", "ability")
DEFAULT_BEHAVIOR_BY_TYPE = {
    "fire": "aggressive",
    "abyss": "defensive",
    "shadow": "chaotic",
    "gold": "defensive",
}
DEFAULT_ABILITY_BY_TYPE = {
    "fire": "Flame Burst",
    "abyss": "Abyssal Ward",
    "shadow": "Night Rift",
    "gold": "Gilded Judgment",
}
DEFAULT_ABILITY_COST_BY_TYPE = {
    "fire": 15,
    "abyss": 20,
    "shadow": 18,
    "gold": 25,
}
BEHAVIOR_WEIGHTS = {
    "aggressive": {"attack": 0.6, "defend": 0.1, "ability": 0.3},
    "defensive": {"attack": 0.2, "defend": 0.55, "ability": 0.25},
    "chaotic": {"attack": 0.34, "defend": 0.33, "ability": 0.33},
}


def initialize_agents() -> list[dict]:
    hydrated_agents: list[dict] = []
    for demon in demons.values():
        hydrated_agents.append(deepcopy(_hydrate_agent(demon)))
    return hydrated_agents


def list_agents() -> list[dict]:
    return initialize_agents()


def get_agent(agent_id: int) -> dict:
    initialize_agents()
    agent = demons.get(agent_id)
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found",
        )
    return deepcopy(agent)


def decide_action(state: dict[str, Any], agent: dict) -> str:
    hydrated_agent = _hydrate_agent(agent)
    behavior_profile = state.get("behavior_profile") or hydrated_agent["behavior_profile"]
    weights = dict(BEHAVIOR_WEIGHTS.get(behavior_profile, BEHAVIOR_WEIGHTS["chaotic"]))

    if not state.get("ability_available", True):
        weights["ability"] = 0.0

    if state.get("target_exposed"):
        weights["attack"] += 0.15

    if state.get("under_pressure") or _get_health_ratio(state, hydrated_agent) <= 0.35:
        weights["defend"] += 0.2

    return _weighted_choice(weights)


def execute_action(agent_id: int, player_id: int, state: dict[str, Any] | None = None) -> dict:
    current_state = state or {}
    agent = get_agent(agent_id)
    action = decide_action(current_state, agent)
    payment_status = "not_required"
    transaction_id: str | None = None

    if action == "ability":
        payment_amount = int(current_state.get("ability_cost", agent["ability_cost"]))
        payment_result = process_payment(
            player_id=player_id,
            amount=payment_amount,
            action_type=action,
        )
        payment_status = payment_result["payment"]
        transaction_id = payment_result["transaction_id"]

        if not payment_result["success"]:
            return {
                "agent_id": agent["id"],
                "action": action,
                "payment": payment_status,
                "transaction_id": transaction_id,
                "log": (
                    f"{agent['name']} attempted {agent['ability_name']}, "
                    "but the x402 payment authorization failed."
                ),
            }

    return {
        "agent_id": agent["id"],
        "action": action,
        "payment": payment_status,
        "transaction_id": transaction_id,
        "log": _build_action_log(agent, action),
    }


def _hydrate_agent(agent: dict) -> dict:
    demon_type = agent.get("type", "shadow")
    stats = agent.setdefault("stats", {})
    stats.setdefault("hp", 0)
    stats.setdefault("attack", 0)
    stats.setdefault("defense", 0)
    agent.setdefault("behavior_profile", DEFAULT_BEHAVIOR_BY_TYPE.get(demon_type, "chaotic"))
    agent.setdefault("ability_name", DEFAULT_ABILITY_BY_TYPE.get(demon_type, "Chaos Pulse"))
    agent.setdefault("ability_cost", DEFAULT_ABILITY_COST_BY_TYPE.get(demon_type, 20))
    agent.setdefault("max_health", stats["hp"] or 1)
    return agent


def _get_health_ratio(state: dict[str, Any], agent: dict) -> float:
    hp = state.get("hp", agent.get("stats", {}).get("hp", 0))
    max_hp = state.get("max_hp", agent.get("max_health", hp or 1))
    if not max_hp:
        return 0.0
    return hp / max_hp


def _weighted_choice(weights: dict[str, float]) -> str:
    actions = [action for action in AGENT_ACTIONS if weights.get(action, 0) > 0]
    if not actions:
        return "attack"

    normalized_weights = [weights[action] for action in actions]
    return random.choices(actions, weights=normalized_weights, k=1)[0]


def _build_action_log(agent: dict, action: str) -> str:
    if action == "attack":
        return f"{agent['name']} lunges forward with a brutal strike."
    if action == "defend":
        return f"{agent['name']} fortifies its stance and waits for an opening."
    return f"{agent['name']} unleashes {agent['ability_name']}."
