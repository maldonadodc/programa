from fastapi import APIRouter

from app.modules.map.models import ZoneEnterRequest, ZoneEnterResponse, ZoneResponse
from app.modules.map.service import enter_zone, list_zones


router = APIRouter()


@router.get("/zones", response_model=list[ZoneResponse])
def read_zones() -> list[dict]:
    return list_zones()


@router.post("/zones/{zone_id}/enter", response_model=ZoneEnterResponse)
def enter_map_zone(zone_id: int, payload: ZoneEnterRequest) -> dict:
    return enter_zone(zone_id, payload.player_id)
