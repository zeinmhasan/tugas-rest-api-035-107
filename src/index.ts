import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { query, waitForDatabase } from "./db";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3000);

type TransactionType = "income" | "expense";

type TransactionRow = {
  id: number;
  type: TransactionType;
  amount: string;
  note: string;
  tx_date: string;
  created_at: string;
};

function isValidDate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isValidType(value: unknown): value is TransactionType {
  return value === "income" || value === "expense";
}

function toTransactionResponse(row: TransactionRow) {
  return {
    id: row.id,
    type: row.type,
    amount: Number(row.amount),
    note: row.note,
    date: row.tx_date,
    createdAt: row.created_at,
  };
}

app.use(express.json());

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ message: "API is running" });
});

app.get("/transactions", async (req: Request, res: Response) => {
  try {
    const { type, startDate, endDate } = req.query;
    const params: unknown[] = [];
    const conditions: string[] = [];

    if (type !== undefined) {
      if (!isValidType(type)) {
        return res
          .status(400)
          .json({ message: "type must be income or expense" });
      }
      params.push(type);
      conditions.push(`type = $${params.length}`);
    }

    if (startDate !== undefined) {
      if (!isValidDate(startDate)) {
        return res
          .status(400)
          .json({ message: "startDate must use YYYY-MM-DD format" });
      }
      params.push(startDate);
      conditions.push(`tx_date >= $${params.length}`);
    }

    if (endDate !== undefined) {
      if (!isValidDate(endDate)) {
        return res
          .status(400)
          .json({ message: "endDate must use YYYY-MM-DD format" });
      }
      params.push(endDate);
      conditions.push(`tx_date <= $${params.length}`);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const result = await query<TransactionRow>(
      `SELECT id, type, amount, note, tx_date, created_at
       FROM transactions
       ${whereClause}
       ORDER BY tx_date DESC, id DESC`,
      params,
    );

    return res
      .status(200)
      .json({ data: result.rows.map(toTransactionResponse) });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch transactions", error });
  }
});

app.get("/transactions/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "id must be a positive integer" });
    }

    const result = await query<TransactionRow>(
      `SELECT id, type, amount, note, tx_date, created_at
       FROM transactions
       WHERE id = $1`,
      [id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    return res
      .status(200)
      .json({ data: toTransactionResponse(result.rows[0]) });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch transaction", error });
  }
});

app.post("/transactions", async (req: Request, res: Response) => {
  try {
    const { type, amount, note, date } = req.body;

    if (!isValidType(type)) {
      return res
        .status(400)
        .json({ message: "type must be income or expense" });
    }
    if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
      return res
        .status(400)
        .json({ message: "amount must be a number greater than 0" });
    }
    if (typeof note !== "string" || note.trim().length === 0) {
      return res.status(400).json({ message: "note is required" });
    }
    if (!isValidDate(date)) {
      return res
        .status(400)
        .json({ message: "date must use YYYY-MM-DD format" });
    }

    const result = await query<TransactionRow>(
      `INSERT INTO transactions (type, amount, note, tx_date)
       VALUES ($1, $2, $3, $4)
       RETURNING id, type, amount, note, tx_date, created_at`,
      [type, amount, note.trim(), date],
    );

    return res
      .status(201)
      .json({
        message: "Transaction created",
        data: toTransactionResponse(result.rows[0]),
      });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to create transaction", error });
  }
});

app.put("/transactions/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "id must be a positive integer" });
    }

    const { type, amount, note, date } = req.body;

    if (!isValidType(type)) {
      return res
        .status(400)
        .json({ message: "type must be income or expense" });
    }
    if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
      return res
        .status(400)
        .json({ message: "amount must be a number greater than 0" });
    }
    if (typeof note !== "string" || note.trim().length === 0) {
      return res.status(400).json({ message: "note is required" });
    }
    if (!isValidDate(date)) {
      return res
        .status(400)
        .json({ message: "date must use YYYY-MM-DD format" });
    }

    const result = await query<TransactionRow>(
      `UPDATE transactions
       SET type = $1,
           amount = $2,
           note = $3,
           tx_date = $4
       WHERE id = $5
       RETURNING id, type, amount, note, tx_date, created_at`,
      [type, amount, note.trim(), date, id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    return res
      .status(200)
      .json({
        message: "Transaction updated",
        data: toTransactionResponse(result.rows[0]),
      });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to update transaction", error });
  }
});

app.delete("/transactions/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "id must be a positive integer" });
    }

    const result = await query(
      `DELETE FROM transactions
       WHERE id = $1`,
      [id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    return res.status(200).json({ message: "Transaction deleted" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to delete transaction", error });
  }
});

app.get("/summary", async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const params: unknown[] = [];
    const conditions: string[] = [];

    if (startDate !== undefined) {
      if (!isValidDate(startDate)) {
        return res
          .status(400)
          .json({ message: "startDate must use YYYY-MM-DD format" });
      }
      params.push(startDate);
      conditions.push(`tx_date >= $${params.length}`);
    }

    if (endDate !== undefined) {
      if (!isValidDate(endDate)) {
        return res
          .status(400)
          .json({ message: "endDate must use YYYY-MM-DD format" });
      }
      params.push(endDate);
      conditions.push(`tx_date <= $${params.length}`);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const result = await query<{ income: string; expense: string }>(
      `SELECT
         COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS income,
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expense
       FROM transactions
       ${whereClause}`,
      params,
    );

    const income = Number(result.rows[0].income);
    const expense = Number(result.rows[0].expense);

    return res.status(200).json({
      data: {
        income,
        expense,
        balance: income - expense,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to get summary", error });
  }
});

async function startServer() {
  try {
    await waitForDatabase();
    app.listen(port, () => {
      console.log(`API running on port ${port}`);
    });
  } catch (error) {
    console.error("Cannot connect to database", error);
    process.exit(1);
  }
}

startServer();
