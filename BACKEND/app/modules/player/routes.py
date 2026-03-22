from fastapi import APIRouter

from app.modules.player.models import (
    PlayerResponse,
    SavePlayerRequest,
    SavePlayerResponse,
    WalletConnectRequest,
    WalletConnectResponse,
)
from app.modules.player.service import connect_wallet_player, get_player_profile, save_user_data


router = APIRouter()


@router.post("/wallet-connect", response_model=WalletConnectResponse)
def wallet_connect(payload: WalletConnectRequest) -> dict:
    return connect_wallet_player(payload.wallet_address)


@router.post("/save", response_model=SavePlayerResponse)
def save_player(payload: SavePlayerRequest) -> dict:
    player = save_user_data(
        payload.wallet_address,
        health=payload.health,
        max_health=payload.max_health,
        tokens=payload.tokens,
        reputation=payload.reputation,
        contract=payload.contract,
        contract_level=payload.contract_level,
        contract_progress=payload.contract_progress,
        contract_requirements={
            contract_id: [requirement.model_dump() for requirement in requirements]
            for contract_id, requirements in payload.contract_requirements.items()
        },
        metrics=payload.metrics.model_dump(),
        contract_history=[entry.model_dump(by_alias=True) for entry in payload.contract_history],
    )
    return {
        "message": "Player state saved",
        "player": player,
    }


@router.get("/wallet/{wallet_address}", response_model=PlayerResponse)
def read_player(wallet_address: str) -> dict:
    return get_player_profile(wallet_address)
