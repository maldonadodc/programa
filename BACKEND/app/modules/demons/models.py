from pydantic import BaseModel


class DemonStatsResponse(BaseModel):
    hp: int
    attack: int
    defense: int


class DemonResponse(BaseModel):
    id: int
    name: str
    type: str
    stats: DemonStatsResponse
    zone_id: int
