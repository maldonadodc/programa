from typing import Any, Literal

from pydantic import BaseModel, Field


ActionType = Literal["attack", "defend", "ability"]
DemonType = Literal["fire", "abyss", "shadow", "gold"]
BehaviorProfile = Literal["aggressive", "defensive", "chaotic"]


class AgentStatsResponse(BaseModel):
    hp: int
    attack: int
    defense: int


class AgentResponse(BaseModel):
    id: int
    name: str
    type: DemonType
    stats: AgentStatsResponse
    behavior_profile: BehaviorProfile
    ability_name: str
    ability_cost: int


class AgentActionRequest(BaseModel):
    player_id: int
    state: dict[str, Any] = Field(default_factory=dict)


class AgentActionResponse(BaseModel):
    agent_id: int
    action: ActionType
    payment: str
    transaction_id: str | None = None
    log: str
