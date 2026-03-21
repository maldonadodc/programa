from fastapi import APIRouter

from app.modules.demons.models import DemonResponse
from app.modules.demons.service import get_demon, list_demons


router = APIRouter()


@router.get("", response_model=list[DemonResponse])
def read_demons() -> list[dict]:
    return list_demons()


@router.get("/{demon_id}", response_model=DemonResponse)
def read_demon(demon_id: int) -> dict:
    return get_demon(demon_id)
