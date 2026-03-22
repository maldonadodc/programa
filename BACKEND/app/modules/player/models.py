from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


WALLET_ADDRESS_PATTERN = r"^0x[a-fA-F0-9]{40}$"
RequirementType = Literal[
    "reputation",
    "battlesWon",
    "attackCount",
    "defendCount",
    "abilityCount",
    "tokenUsage",
]
DominantBehavior = Literal[
    "attackCount",
    "defendCount",
    "abilityCount",
    "tokenUsage",
    "unproven",
]
ContractDecisionOutcome = Literal["accepted", "rejected"]


class ContractRequirement(BaseModel):
    type: RequirementType
    required: int = Field(..., ge=0)


class PlayerMetrics(BaseModel):
    battlesWon: int = Field(default=0, ge=0)
    attackCount: int = Field(default=0, ge=0)
    defendCount: int = Field(default=0, ge=0)
    abilityCount: int = Field(default=0, ge=0)
    tokenUsage: int = Field(default=0, ge=0)


class ContractHistoryEntry(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    contract_id: str = Field(..., alias="contractId", min_length=1)
    outcome: ContractDecisionOutcome
    reason: str = Field(..., min_length=1)
    reputation: int = Field(..., ge=0)
    dominant_behavior: DominantBehavior = Field(..., alias="dominantBehavior")
    timestamp: str = Field(..., min_length=1)


class WalletConnectRequest(BaseModel):
    wallet_address: str = Field(
        ...,
        alias="walletAddress",
        min_length=42,
        max_length=42,
        pattern=WALLET_ADDRESS_PATTERN,
    )


class PlayerResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: int
    wallet_address: str = Field(..., alias="walletAddress", pattern=WALLET_ADDRESS_PATTERN)
    health: int = Field(..., ge=0)
    max_health: int = Field(..., alias="maxHealth", ge=1)
    tokens: int = Field(..., ge=0)
    reputation: int = Field(..., ge=0)
    contract: str | None = None
    contract_level: int = Field(..., alias="contractLevel", ge=0)
    contract_progress: dict[str, int] = Field(default_factory=dict, alias="contractProgress")
    contract_requirements: dict[str, list[ContractRequirement]] = Field(
        default_factory=dict,
        alias="contractRequirements",
    )
    metrics: PlayerMetrics = Field(default_factory=PlayerMetrics)
    contract_history: list[ContractHistoryEntry] = Field(default_factory=list, alias="contractHistory")


class WalletConnectResponse(BaseModel):
    message: str
    created: bool
    player: PlayerResponse


class SavePlayerRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    wallet_address: str = Field(
        ...,
        alias="walletAddress",
        min_length=42,
        max_length=42,
        pattern=WALLET_ADDRESS_PATTERN,
    )
    health: int | None = Field(default=None, ge=0)
    max_health: int | None = Field(default=None, alias="maxHealth", ge=1)
    tokens: int = Field(..., ge=0)
    reputation: int = Field(..., ge=0)
    contract: str | None = None
    contract_level: int = Field(..., alias="contractLevel", ge=0)
    contract_progress: dict[str, int] = Field(default_factory=dict, alias="contractProgress")
    contract_requirements: dict[str, list[ContractRequirement]] = Field(
        default_factory=dict,
        alias="contractRequirements",
    )
    metrics: PlayerMetrics = Field(default_factory=PlayerMetrics)
    contract_history: list[ContractHistoryEntry] = Field(default_factory=list, alias="contractHistory")


class SavePlayerResponse(BaseModel):
    message: str
    player: PlayerResponse
