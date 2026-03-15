import { AppError } from "../errors/AppError";
import { TransactionPayload, TransactionType } from "../types/transaction";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function isValidType(value: unknown): value is TransactionType {
  return value === "income" || value === "expense";
}

export function isValidDate(value: unknown): value is string {
  return typeof value === "string" && DATE_REGEX.test(value);
}

export function parsePositiveId(value: string): number {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(400, "id must be a positive integer");
  }

  return id;
}

export function parseDateFilterValue(
  value: unknown,
  fieldName: string,
): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (!isValidDate(value)) {
    throw new AppError(400, `${fieldName} must use YYYY-MM-DD format`);
  }

  return value;
}

export function parseTransactionPayload(payload: unknown): TransactionPayload {
  if (typeof payload !== "object" || payload === null) {
    throw new AppError(400, "invalid request body");
  }

  const { type, amount, note, date } = payload as Record<string, unknown>;

  if (!isValidType(type)) {
    throw new AppError(400, "type must be income or expense");
  }

  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
    throw new AppError(400, "amount must be a number greater than 0");
  }

  if (typeof note !== "string" || note.trim().length === 0) {
    throw new AppError(400, "note is required");
  }

  if (!isValidDate(date)) {
    throw new AppError(400, "date must use YYYY-MM-DD format");
  }

  return {
    type,
    amount,
    note: note.trim(),
    date,
  };
}
