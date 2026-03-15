import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { waitForDatabase } from "./db";
import { errorHandler } from "./middlewares/errorHandler";
import { transactionRoutes } from "./routes/transactionRoutes";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(express.json());

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ message: "API is running" });
});

app.use(transactionRoutes);
app.use(errorHandler);

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
