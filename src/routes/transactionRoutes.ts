import { Router } from "express";
import {
  createTransaction,
  deleteTransaction,
  getTransaction,
  listTransactions,
  summary,
  updateTransaction,
} from "../controllers/transactionController";
import { asyncHandler } from "../utils/asyncHandler";

const transactionRoutes = Router();

transactionRoutes.get("/transactions", asyncHandler(listTransactions));
transactionRoutes.get("/transactions/:id", asyncHandler(getTransaction));
transactionRoutes.post("/transactions", asyncHandler(createTransaction));
transactionRoutes.put("/transactions/:id", asyncHandler(updateTransaction));
transactionRoutes.delete("/transactions/:id", asyncHandler(deleteTransaction));
transactionRoutes.get("/summary", asyncHandler(summary));

export { transactionRoutes };
