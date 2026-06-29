const { Pool } = require("pg");
const { databaseUrl } = require("../config");

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required.");
}

const pool = new Pool({
  connectionString: databaseUrl,
  max: 2,
  ssl: process.env.DATABASE_SSL === "false" ? false : { rejectUnauthorized: false },
});

async function query(text, params = []) {
  const result = await pool.query(text, params);
  return result.rows;
}

module.exports = {
  pool,
  query,
};
