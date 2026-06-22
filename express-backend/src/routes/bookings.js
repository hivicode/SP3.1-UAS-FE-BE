const express = require("express");
const {
  listBookings,
  createBooking,
  checkInquiryStatus,
  cancelInquiry,
  updateBookingStatus,
} = require("../controllers/bookingsController");
const { authRequired } = require("../middleware/auth");

const router = express.Router();

router.get("/", authRequired, listBookings);
router.post("/", createBooking);
router.post("/status", checkInquiryStatus);
router.post("/cancel", cancelInquiry);
router.patch("/:bookingId/status", authRequired, updateBookingStatus);

module.exports = router;
