from __future__ import annotations

from uuid import uuid4

from app.modules.player.service import get_player, normalize_wallet_address, update_player_progress


def process_transaction(wallet_address: str, amount: int, action: str) -> dict:
    normalized_wallet_address = normalize_wallet_address(wallet_address)
    player = get_player(normalized_wallet_address)
    simulation_log = f"Simulated $SOUL transaction via API x402 for {action}."

    if amount <= 0:
        return {
            "success": True,
            "payment": "success",
            "transactionId": _generate_transaction_id(),
            "walletAddress": normalized_wallet_address,
            "amount": amount,
            "action": action,
            "balanceRemaining": player["remanent"],
            "log": simulation_log,
            "failureReason": None,
        }

    if player["remanent"] < amount:
        return {
            "success": False,
            "payment": "failure",
            "transactionId": None,
            "walletAddress": normalized_wallet_address,
            "amount": amount,
            "action": action,
            "balanceRemaining": player["remanent"],
            "log": simulation_log,
            "failureReason": "Insufficient $SOUL balance",
        }

    update_player_progress(player["id"], remanent_delta=-amount)
    updated_player = get_player(player["id"])
    return {
        "success": True,
        "payment": "success",
        "transactionId": _generate_transaction_id(),
        "walletAddress": normalized_wallet_address,
        "amount": amount,
        "action": action,
        "balanceRemaining": updated_player["remanent"],
        "log": simulation_log,
        "failureReason": None,
    }


def process_payment(player_id: int, amount: int, action_type: str) -> dict:
    player = get_player(player_id)
    result = process_transaction(player["wallet_address"], amount, action_type)
    return {
        "success": result["success"],
        "payment": result["payment"],
        "transaction_id": result["transactionId"],
        "player_id": player_id,
        "amount": result["amount"],
        "action_type": action_type,
        "balance_remaining": result["balanceRemaining"],
        "failure_reason": result["failureReason"],
    }


def _generate_transaction_id() -> str:
    return f"0x{uuid4().hex[:12].upper()}"
