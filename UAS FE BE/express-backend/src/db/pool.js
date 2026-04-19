const mysql = require("mysql2/promise");
const { databaseUrl } = require("../config");

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required.");
}

const pool = mysql.createPool({
  uri: databaseUrl,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function query(text, params = []) {
  const [rows] = await pool.execute(text, params);
  return rows;
}

module.exports = {
  pool,
  query,
};
