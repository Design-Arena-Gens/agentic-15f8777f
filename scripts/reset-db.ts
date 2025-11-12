import fs from "node:fs";
import path from "node:path";

const dbPath = process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "agent.db");

if (fs.existsSync(dbPath)) {
  fs.rmSync(dbPath);
}

console.log(`Reset database at ${dbPath}`);
