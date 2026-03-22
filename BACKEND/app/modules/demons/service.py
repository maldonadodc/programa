from fastapi import HTTPException, status

from app.data.store import demons
from app.modules.agents.service import initialize_agents


def list_demons() -> list[dict]:
    initialize_agents()
    return list(demons.values())


def get_demon(demon_id: int) -> dict:
    initialize_agents()
    demon = demons.get(demon_id)
    if not demon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Demon not found",
        )
    return demon
