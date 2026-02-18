# SimplePOS

A merchant-friendly point-of-sale payment application prototype featuring real-time payment processing, transaction history, and refund management.

## Project Overview

SimplePOS is a lightweight POS system designed for merchants to quickly process payments via card or QR code. The application provides an intuitive interface for charge entry, payment method selection, transaction history with advanced filtering, and transaction management including refunds.

The system requires merchant authentication via 4-digit PIN before access to any payment operations.

## Tech Stack

**Frontend**
- HTML5, CSS3, Vanilla JavaScript (no frameworks)
- Mobile-first responsive design (480px max-width)
- Client-side session management via sessionStorage

**Backend**
- Python FastAPI
- CORS middleware for cross-origin requests
- JSON file-based data persistence (no database)
- Deployed on Render

**Deployment**
- Frontend: Netlify (static HTML/CSS/JS)
- Backend: Render (Python FastAPI application)

## Project Structure

```
.
├── index.html                 # Main checkout page
├── css/
│   └── style.css             # All application styling
├── js/
│   └── app.js                # Shared utilities and API client
├── pages/
│   ├── login.html            # PIN authentication page
│   ├── payment-method.html   # Card vs QR selection
│   ├── card-payment.html     # Card payment interface
│   ├── qr-payment.html       # QR code payment interface
│   ├── success.html          # Payment confirmation screen
│   ├── error.html            # Payment failure screen
│   ├── transactions.html     # Transaction history with filters
│   └── transaction-detail.html # Individual transaction details
├── src/
│   ├── main.py               # FastAPI application
│   └── db.json               # JSON database file
└── requirements.txt          # Python dependencies
```

## Running Locally

### Backend Setup

1. Install Python dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Start the FastAPI server:
   ```
   python src/main.py
   ```
   The server will run on `http://localhost:8000`

### Frontend Setup

1. Open `index.html` in a browser or serve via local HTTP server
2. Update API base URL in `js/app.js` if needed (defaults to deployed Render backend)

### Testing the Application

- Login PIN: `1234`
- Test payment amounts: £0.01 to £5000.00
- Payment methods: Card (instant) or QR code (30-second confirmation window)

## API Endpoints

All endpoints are JSON-based and include CORS headers. Base URL during development: `http://localhost:8000`

### GET /api/merchant
Returns merchant information including name and merchant ID.

Response:
```json
{
  "merchant_id": "MERCH001",
  "merchant_name": "Test Merchant"
}
```

### POST /api/payments
Process a payment transaction.

Request body:
```json
{
  "amount": 25.50,
  "payment_method": "card",
  "reference": "TXN-20260218-001"
}
```

Response:
```json
{
  "id": "txn_123abc",
  "amount": 25.50,
  "status": "success|failed",
  "message": "Success or failure reason"
}
```

### GET /api/payments/{id}
Retrieve a specific payment by ID.

### GET /api/transactions
Retrieve all transactions. Supports optional query parameters for filtering.

Response:
```json
[
  {
    "id": "txn_123abc",
    "reference": "TXN-20260218-001",
    "amount": 25.50,
    "payment_method": "card",
    "status": "success",
    "timestamp": "2026-02-18T14:30:00Z"
  }
]
```

### GET /api/transactions/{id}
Retrieve a specific transaction with full details.

### PATCH /api/transactions/{id}/refund
Refund a previously successful transaction.

Request body:
```json
{
  "reason": "Customer request"
}
```

Response:
```json
{
  "id": "txn_123abc",
  "status": "refunded",
  "refunded_at": "2026-02-18T14:35:00Z"
}
```

## Payment Failure Rules

The system implements the following payment failure scenarios:

- **Invalid Amount**: Amount of £0 or less returns "Invalid amount" error
- **Amount Limit**: Amount exceeding £5000 returns "Transaction limit exceeded" error
- **QR Timeout**: QR code not confirmed within 30 seconds returns "QR code expired" error
- **Network Failure**: Simulated connection issues return "Connection lost" error

These rules help validate merchant input and simulate realistic payment gateway responses.

## Known Limitations

- No real payment processing: All transactions are simulated
- JSON file database: Not suitable for production (no ACID guarantees, limited concurrency)
- Single merchant: System configured for one merchant account
- No transaction search by date range on backend: Filtering done client-side
- Session state in browser: No server-side session persistence
- No transaction encryption or PCI compliance
- No audit logging
- PIN is hardcoded in frontend (visible in source code)

## Production Differences

A production POS application would require:

- Real payment gateway integration (Stripe, Square, PayPal, etc.)
- Proper database (PostgreSQL, MongoDB) with transactions and backups
- Server-side session management with secure token storage
- HTTPS encryption for all communications
- PCI DSS compliance for payment data
- Audit logging for regulatory compliance
- Multi-merchant support with role-based access control
- Backend PIN validation (not exposed in frontend)
- Rate limiting and DDoS protection
- Comprehensive error handling and retry logic
- Payment reconciliation and settlement processes
- Admin dashboard for merchant management
- Transaction reporting and analytics
- Webhook support for real-time payment notifications
- Test and production environments
