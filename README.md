# Personal Finance API (Simple)

REST API sederhana untuk transaksi keuangan pribadi dengan fitur:

- GET all transaksi
- GET transaksi by id
- POST transaksi
- PUT transaksi
- DELETE transaksi
- GET summary (income, expense, balance)

## Stack

- Node.js + Express
- TypeScript
- PostgreSQL
- Docker + Docker Compose

## Menjalankan dengan Docker

```bash
docker compose up --build
```

API berjalan di:

- `http://localhost:3000`

## Dokumentasi API

- Apidog: https://y48pil2w70.apidog.io

## Endpoint

### 1) Health Check

- `GET /health`

### 2) Transactions

- `GET /transactions`
- `GET /transactions/:id`
- `POST /transactions`
- `PUT /transactions/:id`
- `DELETE /transactions/:id`

Query params opsional untuk list:

- `type=income|expense`
- `startDate=YYYY-MM-DD`
- `endDate=YYYY-MM-DD`

Body untuk POST/PUT:

```json
{
  "type": "income",
  "amount": 1500000,
  "note": "Gaji part-time",
  "date": "2026-03-15"
}
```

### 3) Summary

- `GET /summary`
- `GET /summary?startDate=2026-03-01&endDate=2026-03-31`

Response:

```json
{
  "data": {
    "income": 1500000,
    "expense": 200000,
    "balance": 1300000
  }
}
```

## Menjalankan tanpa Docker (opsional, pastikan sudah memiliki postgresql di local)

1. Copy `.env.example` jadi `.env`
2. Install dependency
3. Jalankan mode development

```bash
npm install
npm run dev
```
