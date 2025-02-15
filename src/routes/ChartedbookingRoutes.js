// backend/routes/bookingRoutes.js
const express = require("express");
const router = express.Router();
const {
  createBooking,
  getAllBookings,
  getBookingById,
  deleteBookingById,
} = require("../controllers/ChartedBookingController");

// POST: Create new booking
router.post("/", createBooking);

// GET: All bookings
router.get("/", getAllBookings);

// GET: Single booking
router.get("/:id", getBookingById);

// DELETE: Single booking
router.delete("/:id", deleteBookingById);

module.exports = router;
