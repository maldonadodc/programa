from pydantic import BaseModel

from app.modules.combat.models import CombatStartResponse


class ZoneResponse(BaseModel):
    id: int
    name: str
    danger_level: int
    demon_ids: list[int]


class ZoneEnterRequest(BaseModel):
    player_id: int


class ZoneEnterResponse(BaseModel):
    zone: ZoneResponse
    combat: CombatStartResponse
