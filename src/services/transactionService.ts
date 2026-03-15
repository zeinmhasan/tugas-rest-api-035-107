import { AppError } from "../errors/AppError";
import {
  createTransaction,
  deleteTransaction,
  findTransactionById,
  findTransactions,
  getSummary,
  updateTransaction,
} from "../repositories/transactionRepository";
import {
  DateFilter,
  TransactionFilter,
  TransactionResponse,
  SummaryRow,
} from "../types/transaction";
import {
  isValidType,
  parseDateFilterValue,
  parsePositiveId,
  parseTransactionPayload,
} from "../utils/validators";

function toTransactionResponse(row: {
  id: number;
  type: "income" | "expense";
  amount: string;
  note: string;
  tx_date: string;
  created_at: string;
}): TransactionResponse {
  return {
    id: row.id,
    type: row.type,
    amount: Number(row.amount),
    note: row.note,
    date: row.tx_date,
    createdAt: row.created_at,
  };
}

function parseDateFilters(input: {
  startDate?: unknown;
  endDate?: unknown;
}): DateFilter {
  return {
    startDate: parseDateFilterValue(input.startDate, "startDate"),
    endDate: parseDateFilterValue(input.endDate, "endDate"),
  };
}

export async function getTransactions(input: {
  type?: unknown;
  startDate?: unknown;
  endDate?: unknown;
}): Promise<TransactionResponse[]> {
  const filter: TransactionFilter = {
    ...parseDateFilters(input),
  };

  if (input.type !== undefined) {
    if (!isValidType(input.type)) {
      throw new AppError(400, "type must be income or expense");
    }
    filter.type = input.type;
  }

  const rows = await findTransactions(filter);
  return rows.map(toTransactionResponse);
}

export async function getTransactionById(
  rawId: string,
): Promise<TransactionResponse> {
  const id = parsePositiveId(rawId);
  const row = await findTransactionById(id);

  if (!row) {
    throw new AppError(404, "Transaction not found");
  }

  return toTransactionResponse(row);
}

export async function createNewTransaction(
  payload: unknown,
): Promise<TransactionResponse> {
  const parsedPayload = parseTransactionPayload(payload);
  const row = await createTransaction(parsedPayload);
  return toTransactionResponse(row);
}

export async function editTransaction(
  rawId: string,
  payload: unknown,
): Promise<TransactionResponse> {
  const id = parsePositiveId(rawId);
  const parsedPayload = parseTransactionPayload(payload);

  const row = await updateTransaction(id, parsedPayload);

  if (!row) {
    throw new AppError(404, "Transaction not found");
  }

  return toTransactionResponse(row);
}

export async function removeTransaction(rawId: string): Promise<void> {
  const id = parsePositiveId(rawId);
  const deleted = await deleteTransaction(id);

  if (!deleted) {
    throw new AppError(404, "Transaction not found");
  }
}

export async function getTransactionSummary(input: {
  startDate?: unknown;
  endDate?: unknown;
}): Promise<{ income: number; expense: number; balance: number }> {
  const filters = parseDateFilters(input);
  const summary: SummaryRow = await getSummary(filters);

  const income = Number(summary.income);
  const expense = Number(summary.expense);

  return {
    income,
    expense,
    balance: income - expense,
  };
}
