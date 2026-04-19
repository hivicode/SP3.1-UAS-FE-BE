const fs = require("fs");
const path = require("path");
const { pool } = require("./pool");

async function runMigrations() {
  const migrationFile = path.resolve(__dirname, "../../migrations/001_init.sql");
  const sql = fs.readFileSync(migrationFile, "utf8");
  const statements = sql
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await pool.query(statement);
  }
}

if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log("Migrations completed.");
      return pool.end();
    })
    .catch((error) => {
      console.error("Migration failed:", error);
      process.exitCode = 1;
    });
}

module.exports = { runMigrations };
