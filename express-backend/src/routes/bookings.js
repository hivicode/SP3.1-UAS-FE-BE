const express = require("express");
const {
  listBookings,
  createBooking,
  updateBookingStatus,
} = require("../controllers/bookingsController");
const { authRequired } = require("../middleware/auth");

const router = express.Router();

router.get("/", authRequired, listBookings);
router.post("/", createBooking);
router.patch("/:bookingId/status", authRequired, updateBookingStatus);

module.exports = router;
