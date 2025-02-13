// models/Booking.js
const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
  tripType: {
    type: String,
    enum: ["oneWay", "roundTrip"],
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  from: {
    type: String,
    required: true,
  },
  to: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  duration: String,
  notes: String,
  price: {
    type: Number,
    required: true,
  },
  returnDate: String,
  returnTime: String,
  seatsAvailable: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Booking = mongoose.model("Booking", BookingSchema);
module.exports = Booking;
