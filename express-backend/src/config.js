const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

const rootDir = path.resolve(__dirname, "..");
const uploadDir =
  process.env.VERCEL === "1"
    ? path.resolve("/tmp/uploads")
    : path.resolve(rootDir, process.env.UPLOAD_DIR || "static/uploads");

module.exports = {
  rootDir,
  port: Number(process.env.PORT || 5000),
  databaseUrl: process.env.DATABASE_URL || "",
  corsOrigin: process.env.CORS_ORIGIN || "*",
  jwtSecret: process.env.JWT_SECRET || "secret123",
  uploadDir,
};
