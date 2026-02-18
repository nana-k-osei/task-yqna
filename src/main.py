from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
import json
import os
import uuid

app = FastAPI(title="SimplePOS API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = "db.json"


def read_db():
    with open(DB_PATH, "r") as f:
        return json.load(f)


def write_db(data):
    with open(DB_PATH, "w") as f:
        json.dump(data, f, indent=2)


def generate_reference(transactions):
    next_number = len(transactions) + 1
    return f"TXN-{str(next_number).zfill(5)}"


# --- Models ---


class PaymentRequest(BaseModel):
    amount: float
    payment_method: str  # "debit-card" or "qr"
    failure_reason: str | None = None


# --- API Endpoints ---


@app.get("/api/merchant")
def get_merchant():
    db = read_db()
    return db["merchant"]


@app.post("/api/payments")
def create_payment(payment: PaymentRequest):
    db = read_db()

    # If failure_reason is provided, record as failed transaction immediately
    if payment.failure_reason:
        failure_reason = payment.failure_reason
        status = "failed"
    # Validation constraints
    elif payment.amount <= 0:
        failure_reason = "Invalid amount. Must be greater than 0."
        status = "failed"
    elif payment.amount > 5000:
        failure_reason = "Transaction limit exceeded. Maximum allowed is £5000."
        status = "failed"
    else:
        failure_reason = None
        status = "success"

    reference = generate_reference(db["transactions"])

    transaction = {
        "id": str(uuid.uuid4()),
        "reference": reference,
        "amount": payment.amount,
        "payment_method": payment.payment_method,
        "status": status,
        "timestamp": datetime.utcnow().isoformat(),
        "refunded": False,
        "failure_reason": failure_reason,
    }

    db["transactions"].append(transaction)
    write_db(db)

    return transaction


@app.get("/api/payments/{payment_id}")
def get_payment(payment_id: str):
    db = read_db()
    transaction = next((t for t in db["transactions"] if t["id"] == payment_id), None)
    if not transaction:
        raise HTTPException(status_code=404, detail="Payment not found")
    return transaction


@app.get("/api/transactions")
def get_transactions():
    db = read_db()
    return sorted(db["transactions"], key=lambda t: t["timestamp"], reverse=True)


@app.get("/api/transactions/{transaction_id}")
def get_transaction(transaction_id: str):
    db = read_db()
    transaction = next(
        (t for t in db["transactions"] if t["id"] == transaction_id), None
    )
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return transaction


@app.patch("/api/transactions/{transaction_id}/refund")
def refund_transaction(transaction_id: str):
    db = read_db()
    transaction = next(
        (t for t in db["transactions"] if t["id"] == transaction_id), None
    )
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    if transaction["refunded"]:
        raise HTTPException(status_code=400, detail="Transaction already refunded")

    if transaction["status"] != "success":
        raise HTTPException(
            status_code=400, detail="Only successful transactions can be refunded"
        )

    transaction["refunded"] = True
    transaction["status"] = "refunded"
    write_db(db)

    return transaction
