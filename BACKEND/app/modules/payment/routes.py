from fastapi import APIRouter

from app.modules.payment.models import TransactionProcessRequest, TransactionProcessResponse
from app.modules.payment.service import process_transaction


router = APIRouter()


@router.post("/transaction", response_model=TransactionProcessResponse)
def process_transaction_request(payload: TransactionProcessRequest) -> dict:
    return process_transaction(payload.wallet_address, payload.amount, payload.action)
