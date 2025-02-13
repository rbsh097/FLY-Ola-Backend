// routes/bookingRoutes.js
const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");

// Create a new flight slot (admin only)
router.post("/", async (req, res) => {
  try {
    const booking = await Booking.create(req.body); // seatsAvailable must be set
    res.status(201).json({ message: "Booking (flight slot) created", booking });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// GET all flight slots
router.get("/", async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get flight slot by ID
router.get("/:id", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.json({ booking });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Delete flight slot by ID
router.delete("/:id", async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.json({ message: "Booking deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
