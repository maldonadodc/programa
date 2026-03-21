from fastapi import HTTPException, status

from app.data.store import demons


def list_demons() -> list[dict]:
    return list(demons.values())


def get_demon(demon_id: int) -> dict:
    demon = demons.get(demon_id)
    if not demon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Demon not found",
        )
    return demon
