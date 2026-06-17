# M-Pesa STK Push — Church Giving API

Production-ready Safaricom Daraja integration for tithes, offerings, and donations.

## Setup

1. Copy root `.env.example` to `.env` and fill Daraja credentials from [Safaricom Developer Portal](https://developer.safaricom.co.ke/).
2. Run the database migration (includes `transactions` table):

   ```bash
   mysql -u root -p < src/config/migrate.sql
   ```

3. Install dependencies and start the main server (serves site + M-Pesa API):

   ```bash
   npm install
   npm run dev
   ```

4. For local callbacks, expose your machine with ngrok and set:

   ```
   MPESA_CALLBACK_URL=https://xxxx.ngrok-free.app/api/mpesa/callback
   ```

## Payment channels

| Condition | Shortcode | Daraja `TransactionType` |
|-----------|-----------|---------------------------|
| `mode: "development"` or `paymentType: "test"` | `TILL_SHORTCODE` | `CustomerBuyGoodsOnline` |
| `mode: "production"` (tithe / offering / donation) | `PAYBILL_SHORTCODE` | `CustomerPayBillOnline` |

## API

### `POST /api/mpesa/stkpush`

```json
{
  "donorName": "Jane Donor",
  "phoneNumber": "254712345678",
  "amount": 100,
  "category": "tithe"
}
```

Supported donation categories are `tithe`, `offering`, `missions`, and `building_fund`.
The legacy `phone` and `paymentType` request fields remain supported.

### `POST /api/mpesa/callback`

Called by Safaricom only. Updates `transactions` status and receipt number.

### `GET /api/mpesa/status/:checkoutRequestID`

Returns the current donation status and receipt details after a successful callback.

### `POST /api/mpesa/verify/:checkoutRequestID`

Queries Daraja from the server for STK status without exposing credentials.

### `GET /api/mpesa/transactions`

Returns recent donation records (`?limit=50&offset=0`), with legacy transaction fallback.

## Test UI

Open `http://localhost:5000/backend/examples/payment-test.html` after `npm run dev`.

## Standalone server

```bash
npm run mpesa:dev
```

Runs `backend/server.js` on `MPESA_PORT` (default 5001).

## Project layout

```
backend/
  config/       db.js, mpesa.js (token cache)
  controllers/  mpesaController.js
  routes/       mpesaRoutes.js
  services/     stkService.js (OAuth + STK)
  models/       donationModel.js, transactionModel.js
  utils/        validators.js
  schema/       donations.sql, transactions.sql
  examples/     payment-test.html
  server.js
```

Future hooks: SMS receipts (read `transactions` on Success), admin dashboard (`GET /transactions`).
