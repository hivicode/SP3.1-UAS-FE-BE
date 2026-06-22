const express = require("express");
const { authRequired } = require("../middleware/auth");
const {
  getFinanceReport,
  createFinanceTransaction,
  deleteFinanceTransaction,
  upsertOperationalCost,
} = require("../controllers/financeController");

const router = express.Router();

router.get("/report", authRequired, getFinanceReport);
router.post("/transactions", authRequired, createFinanceTransaction);
router.delete("/transactions/:transactionId", authRequired, deleteFinanceTransaction);
router.post("/operasional", authRequired, upsertOperationalCost);

module.exports = router;
