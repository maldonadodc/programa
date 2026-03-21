from typing import Literal

from pydantic import BaseModel, Field


class CombatStartRequest(BaseModel):
    player_id: int
    demon_id: int


class CombatStartResponse(BaseModel):
    combat_id: int
    status: str
    turn: int
    next_turn: str
    player_hp: int
    enemy_hp: int
    action: str
    log: str


class CombatActionRequest(BaseModel):
    combat_id: int
    action: Literal["attack", "defend", "ability"] = Field(
        ...,
        description="Available actions: attack, defend, ability.",
    )


class CombatActionResponse(BaseModel):
    combat_id: int
    status: str
    turn: int
    next_turn: str
    player_hp: int
    enemy_hp: int
    action: str
    log: str
