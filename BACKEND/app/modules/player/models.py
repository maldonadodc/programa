from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=30)


class PlayerResponse(BaseModel):
    id: int
    username: str
    level: int
    health: int
    max_health: int
    attack: int
    defense: int
    remanent: int
    reputation: int


class LoginResponse(BaseModel):
    message: str
    player: PlayerResponse
