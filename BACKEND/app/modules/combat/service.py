from __future__ import annotations

from copy import deepcopy

from fastapi import HTTPException, status

from app.data.store import active_combats, combat_id_sequence
from app.modules.agents.service import decide_action, get_agent
from app.modules.payment.service import process_payment
from app.modules.player.service import get_player, update_player_progress


DEFEND_BONUS = 5
ABILITY_BONUS = 6
PLAYER_ABILITY_PAYMENT_COST = 20


def start_combat(player_id: int, demon_id: int, zone_id: int | None = None) -> dict:
    player = deepcopy(get_player(player_id))
    demon = deepcopy(get_agent(demon_id))
    demon["max_health"] = demon["stats"]["hp"]

    if player["health"] <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Player has no health and cannot enter combat",
        )

    combat_id = next(combat_id_sequence)
    combat = {
        "combat_id": combat_id,
        "status": "in_progress",
        "turn": 1,
        "current_turn": "player",
        "zone_id": zone_id,
        "player_id": player_id,
        "player": player,
        "player_defending": False,
        "demon": demon,
        "demon_defending": False,
    }
    active_combats[combat_id] = combat

    return {
        "combat_id": combat_id,
        "status": combat["status"],
        "turn": combat["turn"],
        "next_turn": combat["current_turn"],
        "player_hp": player["health"],
        "enemy_hp": demon["stats"]["hp"],
        "action": "start",
        "log": f"Combat started against {demon['name']}.",
    }


def perform_action(combat_id: int, action: str) -> dict:
    combat = active_combats.get(combat_id)
    if not combat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Combat not found",
        )

    if combat["status"] != "in_progress":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Combat is already finished",
        )

    if action not in {"attack", "defend", "ability"}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported combat action",
        )

    player = combat["player"]
    demon = combat["demon"]
    demon_stats = demon["stats"]
    battle_log: list[str] = []
    payment_result: dict | None = None

    if action == "attack":
        demon_defense = demon_stats["defense"] + (
            DEFEND_BONUS if combat["demon_defending"] else 0
        )
        damage = _calculate_damage(player["attack"], demon_defense)
        demon_stats["hp"] = max(demon_stats["hp"] - damage, 0)
        combat["demon_defending"] = False
        battle_log.append(
            f"{player['username']} attacked {demon['name']} for {damage} damage."
        )
    elif action == "defend":
        combat["player_defending"] = True
        battle_log.append(
            f"{player['username']} takes a defensive stance and prepares for the next hit."
        )
    else:
        payment_result = process_payment(
            player_id=combat["player_id"],
            amount=PLAYER_ABILITY_PAYMENT_COST,
            action_type=action,
        )
        if not payment_result["success"]:
            battle_log.append(
                f"{player['username']} failed to authorize the x402 payment. Ability denied."
            )
            return _build_action_response(combat, battle_log, action, payment_result)

        ability_attack = player["attack"] + ABILITY_BONUS
        demon_defense = demon_stats["defense"] + (
            DEFEND_BONUS if combat["demon_defending"] else 0
        )
        damage = _calculate_damage(ability_attack, demon_defense)
        demon_stats["hp"] = max(demon_stats["hp"] - damage, 0)
        combat["demon_defending"] = False
        battle_log.append(
            f"{player['username']} used an ability and dealt {damage} damage to {demon['name']}."
        )

    if demon_stats["hp"] == 0:
        combat["status"] = "victory"
        combat["current_turn"] = "finished"
        battle_log.append(f"{demon['name']} was defeated.")
        _grant_victory_rewards(combat)
        return _build_action_response(combat, battle_log, action, payment_result)

    combat["current_turn"] = "demon"

    demon_action = decide_action(
        {
            "hp": demon_stats["hp"],
            "max_hp": demon["max_health"],
            "under_pressure": demon_stats["hp"] <= max(1, demon["max_health"] // 3),
        },
        demon,
    )
    _apply_demon_action(combat, demon_action, battle_log)
    combat["player_defending"] = False

    if player["health"] == 0:
        combat["status"] = "defeat"
        combat["current_turn"] = "finished"
        battle_log.append(f"{player['username']} has fallen in combat.")
    else:
        combat["turn"] += 1
        combat["current_turn"] = "player"
    return _build_action_response(combat, battle_log, action, payment_result)


def _build_action_response(
    combat: dict,
    battle_log: list[str],
    action: str,
    payment_result: dict | None = None,
) -> dict:
    return {
        "combat_id": combat["combat_id"],
        "status": combat["status"],
        "turn": combat["turn"],
        "next_turn": combat["current_turn"],
        "player_hp": combat["player"]["health"],
        "enemy_hp": combat["demon"]["stats"]["hp"],
        "action": action,
        "payment": payment_result["payment"] if payment_result else "not_required",
        "transaction_id": payment_result["transaction_id"] if payment_result else None,
        "log": _format_log(battle_log),
    }


def _calculate_damage(attack: int, defense: int) -> int:
    return max(0, attack - defense)


def _apply_demon_action(combat: dict, action: str, battle_log: list[str]) -> None:
    player = combat["player"]
    demon = combat["demon"]
    demon_stats = demon["stats"]

    if action == "defend":
        combat["demon_defending"] = True
        battle_log.append(f"{demon['name']} braces for the next attack.")
        return

    player_defense = player["defense"] + (DEFEND_BONUS if combat["player_defending"] else 0)
    demon_attack = demon_stats["attack"]

    if action == "ability":
        demon_attack += ABILITY_BONUS
        battle_log.append(f"{demon['name']} unleashed a special ability.")
    else:
        battle_log.append(f"{demon['name']} chose to attack.")

    incoming_damage = _calculate_damage(demon_attack, player_defense)
    player["health"] = max(player["health"] - incoming_damage, 0)
    update_player_progress(combat["player_id"], health=player["health"])
    battle_log.append(
        f"{demon['name']} dealt {incoming_damage} damage to {player['username']}."
    )


def _grant_victory_rewards(combat: dict) -> None:
    rewards = combat["demon"].get("rewards", {})
    update_player_progress(
        combat["player_id"],
        health=combat["player"]["health"],
        remanent_delta=rewards.get("remanent", 0),
        reputation_delta=rewards.get("reputation", 0),
    )


def _format_log(entries: list[str]) -> str:
    return " ".join(entries)
