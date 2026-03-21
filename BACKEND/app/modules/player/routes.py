from fastapi import APIRouter

from app.modules.player.models import LoginRequest, LoginResponse, PlayerResponse
from app.modules.player.service import get_player, login_player


router = APIRouter()


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest) -> dict:
    return login_player(payload.username)


@router.get("/{player_id}", response_model=PlayerResponse)
def read_player(player_id: int) -> dict:
    return get_player(player_id)
