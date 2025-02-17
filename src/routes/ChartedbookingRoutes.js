const express = require("express");
const router = express.Router();
const {
  createBooking,
  getAllBookings,
  getBookingById,
  deleteBookingById,
  confirmBooking, // New controller function
} = require("../controllers/ChartedBookingController");

// POST: Create new booking
router.post("/", createBooking);

// GET: All bookings
router.get("/", getAllBookings);

// GET: Single booking
router.get("/:id", getBookingById);

// DELETE: Single booking
router.delete("/:id", deleteBookingById);

// PATCH: Confirm a booking
router.patch("/:id/confirm", confirmBooking);

module.exports = router;