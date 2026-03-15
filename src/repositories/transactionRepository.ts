import { query } from "../db";
import {
  DateFilter,
  SummaryRow,
  TransactionFilter,
  TransactionPayload,
  TransactionRow,
} from "../types/transaction";

function buildDateConditions(filter: DateFilter): {
  conditions: string[];
  params: unknown[];
} {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (filter.startDate !== undefined) {
    params.push(filter.startDate);
    conditions.push(`tx_date >= $${params.length}`);
  }

  if (filter.endDate !== undefined) {
    params.push(filter.endDate);
    conditions.push(`tx_date <= $${params.length}`);
  }

  return { conditions, params };
}

export async function findTransactions(
  filter: TransactionFilter,
): Promise<TransactionRow[]> {
  const { conditions, params } = buildDateConditions(filter);

  if (filter.type !== undefined) {
    params.push(filter.type);
    conditions.push(`type = $${params.length}`);
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

  return result.rows;
}

export async function findTransactionById(
  id: number,
): Promise<TransactionRow | null> {
  const result = await query<TransactionRow>(
    `SELECT id, type, amount, note, tx_date, created_at
     FROM transactions
     WHERE id = $1`,
    [id],
  );

  return result.rowCount === 0 ? null : result.rows[0];
}

export async function createTransaction(
  payload: TransactionPayload,
): Promise<TransactionRow> {
  const result = await query<TransactionRow>(
    `INSERT INTO transactions (type, amount, note, tx_date)
     VALUES ($1, $2, $3, $4)
     RETURNING id, type, amount, note, tx_date, created_at`,
    [payload.type, payload.amount, payload.note, payload.date],
  );

  return result.rows[0];
}

export async function updateTransaction(
  id: number,
  payload: TransactionPayload,
): Promise<TransactionRow | null> {
  const result = await query<TransactionRow>(
    `UPDATE transactions
     SET type = $1,
         amount = $2,
         note = $3,
         tx_date = $4
     WHERE id = $5
     RETURNING id, type, amount, note, tx_date, created_at`,
    [payload.type, payload.amount, payload.note, payload.date, id],
  );

  return result.rowCount === 0 ? null : result.rows[0];
}

export async function deleteTransaction(id: number): Promise<boolean> {
  const result = await query(
    `DELETE FROM transactions
     WHERE id = $1`,
    [id],
  );

  return (result.rowCount ?? 0) > 0;
}

export async function getSummary(filter: DateFilter): Promise<SummaryRow> {
  const { conditions, params } = buildDateConditions(filter);
  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const result = await query<SummaryRow>(
    `SELECT
       COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS income,
       COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expense
     FROM transactions
     ${whereClause}`,
    params,
  );

  return result.rows[0];
}
