const express = require("express");
const {
  listBookings,
  createBooking,
  checkInquiryStatus,
  cancelInquiry,
  confirmInquiryPayment,
  updateBookingStatus,
  getPublicBookingById,
} = require("../controllers/bookingsController");
const { authRequired } = require("../middleware/auth");

const router = express.Router();

router.get("/", authRequired, listBookings);
router.post("/", createBooking);
router.post("/status", checkInquiryStatus);
router.post("/cancel", cancelInquiry);
router.post("/confirm-payment", confirmInquiryPayment);
router.get("/public/:bookingId", getPublicBookingById);
router.patch("/:bookingId/status", authRequired, updateBookingStatus);

module.exports = router;
