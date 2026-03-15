import { Pool, QueryResult, QueryResultRow } from "pg";

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "finance_db",
});

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<QueryResult<T>> {
  return pool.query<T>(text, params);
}

export async function waitForDatabase(
  maxRetries = 10,
  delayMs = 2000,
): Promise<void> {
  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      await query("SELECT 1");
      return;
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}
