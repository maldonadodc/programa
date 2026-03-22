from __future__ import annotations

import hashlib
import json
import re
from copy import deepcopy
from itertools import count
from pathlib import Path
from typing import Any


BASE_DIR = Path(__file__).resolve().parent
PLAYERS_FILE = BASE_DIR / "players.json"
WALLET_ADDRESS_PATTERN = re.compile(r"^0x[a-fA-F0-9]{40}$")


def _default_players() -> dict[str, dict[str, Any]]:
    return {
        "0x1111111111111111111111111111111111111111": {
            "id": 1,
            "wallet_address": "0x1111111111111111111111111111111111111111",
            "username": "0x1111111111111111111111111111111111111111",
            "level": 3,
            "health": 82,
            "max_health": 82,
            "attack": 31,
            "defense": 14,
            "tokens": 250,
            "remanent": 250,
            "reputation": 40,
            "contract": "pyrrhus",
            "contract_level": 3,
            "contract_progress": {"pyrrhus": 4, "thalassos": 0, "maliki": 0, "valerius": 0},
            "contract_requirements": {},
            "metrics": {
                "battlesWon": 4,
                "attackCount": 6,
                "defendCount": 1,
                "abilityCount": 2,
                "tokenUsage": 1,
            },
            "contract_history": [],
        },
        "0x2222222222222222222222222222222222222222": {
            "id": 2,
            "wallet_address": "0x2222222222222222222222222222222222222222",
            "username": "0x2222222222222222222222222222222222222222",
            "level": 2,
            "health": 82,
            "max_health": 82,
            "attack": 24,
            "defense": 22,
            "tokens": 120,
            "remanent": 120,
            "reputation": 18,
            "contract": "valerius",
            "contract_level": 2,
            "contract_progress": {"pyrrhus": 0, "thalassos": 0, "maliki": 0, "valerius": 2},
            "contract_requirements": {},
            "metrics": {
                "battlesWon": 2,
                "attackCount": 2,
                "defendCount": 3,
                "abilityCount": 1,
                "tokenUsage": 0,
            },
            "contract_history": [],
        },
    }


def _normalize_wallet_address(raw_wallet_address: Any, fallback_seed: str) -> str:
    candidate = str(raw_wallet_address or "").strip()
    if WALLET_ADDRESS_PATTERN.fullmatch(candidate):
        return candidate.lower()

    digest = hashlib.sha1(fallback_seed.encode("utf-8")).hexdigest()[:40]
    return f"0x{digest}"


def _normalize_metrics(raw_metrics: Any) -> dict[str, int]:
    metrics = raw_metrics if isinstance(raw_metrics, dict) else {}
    return {
        "battlesWon": int(metrics.get("battlesWon", 0) or 0),
        "attackCount": int(metrics.get("attackCount", metrics.get("attack", 0)) or 0),
        "defendCount": int(metrics.get("defendCount", metrics.get("defensivePlays", 0)) or 0),
        "abilityCount": int(metrics.get("abilityCount", metrics.get("abilityUses", 0)) or 0),
        "tokenUsage": int(metrics.get("tokenUsage", 0) or 0),
    }


def _normalize_contract_requirements(raw_requirements: Any) -> dict[str, list[dict[str, Any]]]:
    if not isinstance(raw_requirements, dict):
        return {}

    normalized: dict[str, list[dict[str, Any]]] = {}

    for contract_id, requirements in raw_requirements.items():
        if not isinstance(requirements, list):
            continue

        entries: list[dict[str, Any]] = []
        for requirement in requirements:
            if not isinstance(requirement, dict):
                continue

            requirement_type = requirement.get("type")
            if requirement_type == "abilityUses":
                requirement_type = "abilityCount"
            elif requirement_type == "defensivePlays":
                requirement_type = "defendCount"

            if requirement_type not in {
                "reputation",
                "battlesWon",
                "attackCount",
                "defendCount",
                "abilityCount",
                "tokenUsage",
            }:
                continue

            entries.append(
                {
                    "type": requirement_type,
                    "required": max(0, int(requirement.get("required", 0) or 0)),
                }
            )

        normalized[str(contract_id)] = entries

    return normalized


def _normalize_contract_history(raw_history: Any) -> list[dict[str, Any]]:
    if not isinstance(raw_history, list):
        return []

    normalized: list[dict[str, Any]] = []

    for entry in raw_history:
        if not isinstance(entry, dict):
            continue

        outcome = entry.get("outcome")
        dominant_behavior = entry.get("dominantBehavior", entry.get("dominant_behavior", "unproven"))
        if outcome not in {"accepted", "rejected"}:
            continue
        if dominant_behavior not in {"attackCount", "defendCount", "abilityCount", "tokenUsage", "unproven"}:
            dominant_behavior = "unproven"

        normalized.append(
            {
                "contractId": str(entry.get("contractId", entry.get("contract_id", ""))).strip(),
                "outcome": outcome,
                "reason": str(entry.get("reason", "")).strip(),
                "reputation": max(0, int(entry.get("reputation", 0) or 0)),
                "dominantBehavior": dominant_behavior,
                "timestamp": str(entry.get("timestamp", "")).strip(),
            }
        )

    return [entry for entry in normalized if entry["contractId"] and entry["reason"] and entry["timestamp"]]


def _normalize_player(raw_player: dict[str, Any]) -> dict[str, Any]:
    player = deepcopy(raw_player)
    tokens = int(player.get("tokens", player.get("remanent", 0)) or 0)
    health = int(player.get("health", 82) or 82)
    max_health = max(1, int(player.get("max_health", player.get("maxHealth", 82)) or 82))
    contract = player.get("contract")
    contract_level = int(player.get("contract_level", player.get("contractLevel", player.get("level", 0))) or 0)

    fallback_seed = (
        str(player.get("wallet_address") or player.get("walletAddress") or player.get("username") or player.get("id") or "legacy")
    )
    wallet_address = _normalize_wallet_address(
        player.get("wallet_address", player.get("walletAddress")),
        fallback_seed=fallback_seed,
    )

    return {
        "id": int(player.get("id", 0) or 0),
        "wallet_address": wallet_address,
        "username": wallet_address,
        "level": max(1, int(player.get("level", max(contract_level, 1)) or 1)),
        "health": max(0, min(health, max_health)),
        "max_health": max_health,
        "attack": max(0, int(player.get("attack", 10) or 10)),
        "defense": max(0, int(player.get("defense", 3) or 3)),
        "tokens": max(0, tokens),
        "remanent": max(0, tokens),
        "reputation": max(0, int(player.get("reputation", 0) or 0)),
        "contract": contract if contract else None,
        "contract_level": max(0, contract_level),
        "contract_progress": player.get("contract_progress", player.get("contractProgress", {}))
        if isinstance(player.get("contract_progress", player.get("contractProgress", {})), dict)
        else {},
        "contract_requirements": _normalize_contract_requirements(
            player.get("contract_requirements", player.get("contractRequirements"))
        ),
        "metrics": _normalize_metrics(player.get("metrics", player.get("behaviorStats"))),
        "contract_history": _normalize_contract_history(
            player.get("contract_history", player.get("contractHistory"))
        ),
    }


def _serialize_players(players_by_wallet: dict[str, dict[str, Any]]) -> list[dict[str, Any]]:
    serialized_players: list[dict[str, Any]] = []

    for player in sorted(players_by_wallet.values(), key=lambda entry: entry["id"]):
        serialized_players.append(
            {
                "id": player["id"],
                "wallet_address": player["wallet_address"],
                "level": player["level"],
                "health": player["health"],
                "max_health": player["max_health"],
                "attack": player["attack"],
                "defense": player["defense"],
                "tokens": player["tokens"],
                "remanent": player["remanent"],
                "reputation": player["reputation"],
                "contract": player["contract"],
                "contract_level": player["contract_level"],
                "contract_progress": deepcopy(player["contract_progress"]),
                "contract_requirements": deepcopy(player["contract_requirements"]),
                "metrics": deepcopy(player["metrics"]),
                "contract_history": deepcopy(player["contract_history"]),
            }
        )

    return serialized_players


def _persist_players(players_by_wallet: dict[str, dict[str, Any]]) -> None:
    PLAYERS_FILE.parent.mkdir(parents=True, exist_ok=True)
    PLAYERS_FILE.write_text(
        json.dumps(_serialize_players(players_by_wallet), indent=2),
        encoding="utf-8",
    )


def _load_players() -> dict[str, dict[str, Any]]:
    if not PLAYERS_FILE.exists():
        players_by_wallet = _default_players()
        _persist_players(players_by_wallet)
        return players_by_wallet

    try:
        raw_data = json.loads(PLAYERS_FILE.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        players_by_wallet = _default_players()
        _persist_players(players_by_wallet)
        return players_by_wallet

    raw_players = raw_data if isinstance(raw_data, list) else []
    players_by_wallet: dict[str, dict[str, Any]] = {}

    for raw_player in raw_players:
        if not isinstance(raw_player, dict):
            continue

        player = _normalize_player(raw_player)
        players_by_wallet[player["wallet_address"]] = player

    if not players_by_wallet:
        players_by_wallet = _default_players()

    _persist_players(players_by_wallet)
    return players_by_wallet


players_by_wallet = _load_players()
player_id_sequence = count(
    start=max((player["id"] for player in players_by_wallet.values()), default=0) + 1
)

demons: dict[int, dict] = {
    1: {
        "id": 1,
        "name": "Cinder Hound",
        "type": "fire",
        "behavior_profile": "aggressive",
        "ability_name": "Flame Burst",
        "ability_cost": 15,
        "stats": {
            "hp": 60,
            "attack": 10,
            "defense": 3,
        },
        "zone_id": 1,
        "rewards": {
            "remanent": 20,
            "reputation": 5,
        },
    },
    2: {
        "id": 2,
        "name": "Ash Wraith",
        "type": "abyss",
        "behavior_profile": "defensive",
        "ability_name": "Void Veil",
        "ability_cost": 20,
        "stats": {
            "hp": 85,
            "attack": 14,
            "defense": 5,
        },
        "zone_id": 2,
        "rewards": {
            "remanent": 35,
            "reputation": 8,
        },
    },
    3: {
        "id": 3,
        "name": "Molten Behemoth",
        "type": "fire",
        "behavior_profile": "chaotic",
        "ability_name": "Magma Collapse",
        "ability_cost": 25,
        "stats": {
            "hp": 140,
            "attack": 20,
            "defense": 8,
        },
        "zone_id": 3,
        "rewards": {
            "remanent": 60,
            "reputation": 15,
        },
    },
}

zones: list[dict] = [
    {
        "id": 1,
        "name": "Scorched Path",
        "danger_level": 1,
        "demon_ids": [1],
    },
    {
        "id": 2,
        "name": "Ember Hollow",
        "danger_level": 2,
        "demon_ids": [2],
    },
    {
        "id": 3,
        "name": "Obsidian Gate",
        "danger_level": 4,
        "demon_ids": [3],
    },
]

active_combats: dict[int, dict] = {}
combat_id_sequence = count(start=1)


def persist_players() -> None:
    _persist_players(players_by_wallet)
