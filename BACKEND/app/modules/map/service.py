from fastapi import HTTPException, status

from app.data.store import zones
from app.modules.combat.service import start_combat


def list_zones() -> list[dict]:
    return zones


def get_zone(zone_id: int) -> dict:
    for zone in zones:
        if zone["id"] == zone_id:
            return zone

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Zone not found",
    )


def enter_zone(zone_id: int, player_id: int) -> dict:
    zone = get_zone(zone_id)
    demon_ids = zone.get("demon_ids", [])
    if not demon_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This zone has no combat encounters",
        )

    combat = start_combat(player_id=player_id, demon_id=demon_ids[0], zone_id=zone_id)
    return {"zone": zone, "combat": combat}
