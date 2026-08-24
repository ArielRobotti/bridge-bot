import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

export type TransactionType = 
  | "CONVERT_NXT_TO_POINTS"
  | "CONVERT_POINTS_TO_NXT"
  | "P2P_TRANSFER";

export interface TransactionRecord {
  id?: number;
  userId: string;
  targetUserId?: string;
  type: TransactionType;
  amountNxt?: number;
  amountPoints?: number;
  blockIndex?: string;
  status: "SUCCESS" | "FAILED";
  details?: string;
  timestamp?: number;
}

const dataDir = path.resolve(process.cwd(), "data");
const dbPath = path.join(dataDir, "transactions.db");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT NOT NULL,
    targetUserId TEXT,
    type TEXT NOT NULL,
    amountNxt REAL,
    amountPoints INTEGER,
    blockIndex TEXT,
    status TEXT NOT NULL,
    details TEXT,
    timestamp INTEGER NOT NULL
  )
`);

export function getAllTransactionsAsCSV(): string {
  const stmt = db.prepare(`SELECT * FROM transactions ORDER BY timestamp DESC`);
  const rows = stmt.all() as TransactionRecord[];

  if (rows.length === 0) {
    return "";
  }

  // Encabezados del CSV
  const headers = ["ID", "Fecha_Hora", "Discord_User_ID", "Target_User_ID", "Tipo", "Monto_NXT", "Monto_Puntos", "Estado", "Bloque_ICP", "Detalles"];

  const csvLines = rows.map((row) => {
    const dateStr = new Date(row.timestamp!).toISOString();
    return [
      row.id ?? "",
      `"${dateStr}"`,
      `"${row.userId}"`,
      `"${row.targetUserId || ""}"`,
      `"${row.type}"`,
      row.amountNxt ?? 0,
      row.amountPoints ?? 0,
      `"${row.status}"`,
      `"${row.blockIndex || ""}"`,
      `"${(row.details || "").replace(/"/g, '""')}"`, // Escape de comillas dobles
    ].join(",");
  });

  return [headers.join(","), ...csvLines].join("\n");
}

export function logTransaction(tx: TransactionRecord): void {
  const stmt = db.prepare(`
    INSERT INTO transactions (userId, targetUserId, type, amountNxt, amountPoints, blockIndex, status, details, timestamp)
    VALUES (@userId, @targetUserId, @type, @amountNxt, @amountPoints, @blockIndex, @status, @details, @timestamp)
  `);

  stmt.run({
    userId: tx.userId,
    targetUserId: tx.targetUserId ?? null,
    type: tx.type,
    amountNxt: tx.amountNxt ?? null,
    amountPoints: tx.amountPoints ?? null,
    blockIndex: tx.blockIndex ?? null,
    status: tx.status,
    details: tx.details ?? null,
    timestamp: tx.timestamp || Date.now(),
  });
}

export function getUserTransactions(userId: string, limit: number = 10): TransactionRecord[] {
  const stmt = db.prepare(`
    SELECT * FROM transactions 
    WHERE userId = ? OR targetUserId = ? 
    ORDER BY timestamp DESC 
    LIMIT ?
  `);
  return stmt.all(userId, userId, limit) as TransactionRecord[];
}