const express = require("express");
const { authRequired } = require("../middleware/auth");
const {
  getFinanceReport,
  upsertOperationalCost,
} = require("../controllers/financeController");

const router = express.Router();

router.get("/report", authRequired, getFinanceReport);
router.post("/operasional", authRequired, upsertOperationalCost);

module.exports = router;
