from __future__ import annotations

from copy import deepcopy
from typing import Any

from fastapi import HTTPException, status

from app.data.store import persist_players, player_id_sequence, players_by_wallet


DEFAULT_PLAYER_STATE = {
    "health": 82,
    "max_health": 82,
    "attack": 10,
    "defense": 3,
    "tokens": 120,
    "reputation": 0,
    "contract": None,
    "contract_level": 0,
    "contract_progress": {},
    "contract_requirements": {},
    "metrics": {
        "battlesWon": 0,
        "attackCount": 0,
        "defendCount": 0,
        "abilityCount": 0,
        "tokenUsage": 0,
    },
    "contract_history": [],
}


def normalize_wallet_address(wallet_address: str) -> str:
    clean_wallet_address = wallet_address.strip().lower()
    if not clean_wallet_address.startswith("0x") or len(clean_wallet_address) != 42:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid wallet address",
        )
    return clean_wallet_address


def _persist_user_state(player: dict[str, Any]) -> None:
    player["remanent"] = player["tokens"]
    player["level"] = max(player.get("level", 1), player.get("contract_level", 0), 1)
    print("Writing player decisions to blockchain...", player["wallet_address"])
    persist_players()


def _find_player_by_id(player_id: int) -> dict[str, Any] | None:
    for player in players_by_wallet.values():
        if player["id"] == player_id:
            return player
    return None


def _build_response(player: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": player["id"],
        "walletAddress": player["wallet_address"],
        "health": player["health"],
        "maxHealth": player["max_health"],
        "tokens": player["tokens"],
        "reputation": player["reputation"],
        "contract": player.get("contract"),
        "contractLevel": player.get("contract_level", 0),
        "contractProgress": deepcopy(player.get("contract_progress", {})),
        "contractRequirements": deepcopy(player.get("contract_requirements", {})),
        "metrics": deepcopy(player.get("metrics", DEFAULT_PLAYER_STATE["metrics"])),
        "contractHistory": deepcopy(player.get("contract_history", DEFAULT_PLAYER_STATE["contract_history"])),
    }


def connect_wallet_player(wallet_address: str) -> dict[str, Any]:
    normalized_wallet_address = normalize_wallet_address(wallet_address)
    existing_player = players_by_wallet.get(normalized_wallet_address)

    if existing_player:
        _persist_user_state(existing_player)
        return {
            "message": "Wallet connected",
            "created": False,
            "player": _build_response(existing_player),
        }

    new_player_id = next(player_id_sequence)
    new_player = {
        "id": new_player_id,
        "wallet_address": normalized_wallet_address,
        "username": normalized_wallet_address,
        "level": 1,
        "health": DEFAULT_PLAYER_STATE["health"],
        "max_health": DEFAULT_PLAYER_STATE["max_health"],
        "attack": DEFAULT_PLAYER_STATE["attack"],
        "defense": DEFAULT_PLAYER_STATE["defense"],
        "tokens": DEFAULT_PLAYER_STATE["tokens"],
        "remanent": DEFAULT_PLAYER_STATE["tokens"],
        "reputation": DEFAULT_PLAYER_STATE["reputation"],
        "contract": DEFAULT_PLAYER_STATE["contract"],
        "contract_level": DEFAULT_PLAYER_STATE["contract_level"],
        "contract_progress": deepcopy(DEFAULT_PLAYER_STATE["contract_progress"]),
        "contract_requirements": deepcopy(DEFAULT_PLAYER_STATE["contract_requirements"]),
        "metrics": deepcopy(DEFAULT_PLAYER_STATE["metrics"]),
        "contract_history": deepcopy(DEFAULT_PLAYER_STATE["contract_history"]),
    }
    players_by_wallet[normalized_wallet_address] = new_player
    _persist_user_state(new_player)

    return {
        "message": "Wallet registered",
        "created": True,
        "player": _build_response(new_player),
    }


def get_player(identifier: int | str) -> dict[str, Any]:
    if isinstance(identifier, int):
        player = _find_player_by_id(identifier)
    else:
        player = players_by_wallet.get(normalize_wallet_address(identifier))

    if not player:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Player not found",
        )

    return player


def get_player_profile(wallet_address: str) -> dict[str, Any]:
    player = get_player(wallet_address)
    return _build_response(player)


def save_user_data(
    wallet_address: str,
    *,
    health: int | None,
    max_health: int | None,
    tokens: int,
    reputation: int,
    contract: str | None,
    contract_level: int,
    contract_progress: dict[str, int],
    contract_requirements: dict[str, list[dict[str, Any]]],
    metrics: dict[str, int],
    contract_history: list[dict[str, Any]],
) -> dict[str, Any]:
    player = get_player(wallet_address)

    if health is not None:
        player["health"] = max(0, min(health, max_health or player["max_health"]))
    if max_health is not None:
        player["max_health"] = max(1, max_health)
        player["health"] = min(player["health"], player["max_health"])

    player["tokens"] = max(0, tokens)
    player["remanent"] = player["tokens"]
    player["reputation"] = max(0, reputation)
    player["contract"] = contract or None
    player["contract_level"] = max(0, contract_level)
    player["level"] = max(player["level"], player["contract_level"], 1)
    player["contract_progress"] = deepcopy(contract_progress)
    player["contract_requirements"] = deepcopy(contract_requirements)
    player["metrics"] = {
        "battlesWon": max(0, int(metrics.get("battlesWon", 0))),
        "attackCount": max(0, int(metrics.get("attackCount", 0))),
        "defendCount": max(0, int(metrics.get("defendCount", metrics.get("defensivePlays", 0)))),
        "abilityCount": max(0, int(metrics.get("abilityCount", metrics.get("abilityUses", 0)))),
        "tokenUsage": max(0, int(metrics.get("tokenUsage", 0))),
    }
    player["contract_history"] = deepcopy(contract_history)

    _persist_user_state(player)
    return _build_response(player)


def update_player_progress(
    player_id: int,
    *,
    health: int | None = None,
    remanent_delta: int = 0,
    reputation_delta: int = 0,
) -> dict[str, Any]:
    player = get_player(player_id)

    if health is not None:
        player["health"] = max(0, min(health, player["max_health"]))

    player["tokens"] = max(0, player.get("tokens", player.get("remanent", 0)) + remanent_delta)
    player["remanent"] = player["tokens"]
    player["reputation"] = max(0, player.get("reputation", 0) + reputation_delta)
    _persist_user_state(player)
    return player
