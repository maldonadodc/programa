from fastapi import APIRouter

from app.modules.combat.models import (
    CombatActionRequest,
    CombatActionResponse,
    CombatStartRequest,
    CombatStartResponse,
)
from app.modules.combat.service import perform_action, start_combat


router = APIRouter()


@router.post("/start", response_model=CombatStartResponse)
def create_combat(payload: CombatStartRequest) -> dict:
    return start_combat(payload.player_id, payload.demon_id)


@router.post("/action", response_model=CombatActionResponse)
def make_combat_action(payload: CombatActionRequest) -> dict:
    return perform_action(payload.combat_id, payload.action)
