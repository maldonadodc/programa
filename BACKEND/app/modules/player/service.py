from fastapi import HTTPException, status

from app.data.store import player_id_sequence, players


def login_player(username: str) -> dict:
    normalized_username = username.strip().lower()

    for player in players.values():
        if player["username"].lower() == normalized_username:
            return {"message": "Login successful", "player": player}

    new_player_id = next(player_id_sequence)
    new_player = {
        "id": new_player_id,
        "username": username.strip(),
        "level": 1,
        "health": 100,
        "max_health": 100,
        "attack": 10,
        "defense": 3,
        "remanent": 0,
        "reputation": 0,
    }
    players[new_player_id] = new_player
    return {"message": "Mock player created and logged in", "player": new_player}


def get_player(player_id: int) -> dict:
    player = players.get(player_id)
    if not player:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Player not found",
        )
    return player


def update_player_progress(
    player_id: int,
    *,
    health: int | None = None,
    remanent_delta: int = 0,
    reputation_delta: int = 0,
) -> dict:
    player = get_player(player_id)

    if health is not None:
        player["health"] = max(0, min(health, player["max_health"]))

    player["remanent"] += remanent_delta
    player["reputation"] += reputation_delta
    return player
