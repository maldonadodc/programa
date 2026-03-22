from pydantic import BaseModel, Field

from app.modules.player.models import WALLET_ADDRESS_PATTERN


class TransactionProcessRequest(BaseModel):
    wallet_address: str = Field(
        ...,
        alias="walletAddress",
        min_length=42,
        max_length=42,
        pattern=WALLET_ADDRESS_PATTERN,
    )
    amount: int = Field(..., ge=0)
    action: str = Field(..., min_length=1)


class TransactionProcessResponse(BaseModel):
    success: bool
    payment: str
    transaction_id: str | None = Field(default=None, alias="transactionId")
    wallet_address: str = Field(..., alias="walletAddress")
    amount: int
    action: str
    balance_remaining: int = Field(..., alias="balanceRemaining")
    log: str
    failure_reason: str | None = Field(default=None, alias="failureReason")
