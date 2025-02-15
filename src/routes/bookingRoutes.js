// routes/bookingRoutes.js
const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");

const CustomerBooking = require("../models/CustumerBooking"); 

router.post("/", async (req, res) => {
  try {
    const booking = await Booking.create(req.body); 
    res.status(201).json({ message: "Booking (flight slot) created", booking });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


router.get("/", async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


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


router.delete("/:id", async (req, res) => {
  try {
    const bookingSlot = await Booking.findByIdAndDelete(req.params.id);
    if (!bookingSlot) {
      return res.status(404).json({ message: "Booking slot not found" });
    }
    // Delete any customer bookings referencing this flight slot
    await CustomerBooking.deleteMany({
      $or: [
        { "selectedFlight._id": req.params.id },
        { "selectedFlightOutbound._id": req.params.id },
        { "selectedFlightReturn._id": req.params.id },
      ],
    });
    res.json({
      message:
        "Booking slot and all associated customer bookings have been deleted",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
