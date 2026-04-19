const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const propertiesRoutes = require("./routes/properties");
const bookingsRoutes = require("./routes/bookings");
const authRoutes = require("./routes/auth");
const financeRoutes = require("./routes/finance");
const { corsOrigin, uploadDir } = require("./config");
const { errorHandler, notFoundHandler } = require("./middleware/error");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const app = express();

app.use(
  cors({
    origin: corsOrigin === "*" ? true : corsOrigin,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.resolve(uploadDir)));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/properti", propertiesRoutes);
app.use("/api/booking", bookingsRoutes);
app.use("/api/finance", financeRoutes);

app.get("/", (_req, res) => {
  res.redirect("/health");
});

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
