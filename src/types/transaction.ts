export type TransactionType = "income" | "expense";

export type TransactionRow = {
  id: number;
  type: TransactionType;
  amount: string;
  note: string;
  tx_date: string;
  created_at: string;
};

export type TransactionResponse = {
  id: number;
  type: TransactionType;
  amount: number;
  note: string;
  date: string;
  createdAt: string;
};

export type TransactionPayload = {
  type: TransactionType;
  amount: number;
  note: string;
  date: string;
};

export type DateFilter = {
  startDate?: string;
  endDate?: string;
};

export type TransactionFilter = DateFilter & {
  type?: TransactionType;
};

export type SummaryRow = {
  income: string;
  expense: string;
};
