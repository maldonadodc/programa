from fastapi import APIRouter

from app.modules.agents.routes import router as agents_router
from app.modules.combat.routes import router as combat_router
from app.modules.demons.routes import router as demons_router
from app.modules.map.routes import router as map_router
from app.modules.payment.routes import router as payment_router
from app.modules.player.routes import router as player_router


api_router = APIRouter()
api_router.include_router(player_router, prefix="/player", tags=["player"])
api_router.include_router(demons_router, prefix="/demons", tags=["demons"])
api_router.include_router(agents_router, prefix="/agents", tags=["agents"])
api_router.include_router(map_router, prefix="/map", tags=["map"])
api_router.include_router(combat_router, prefix="/combat", tags=["combat"])
api_router.include_router(payment_router, prefix="/payment", tags=["payment"])
