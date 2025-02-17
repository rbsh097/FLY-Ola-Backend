const mongoose = require("mongoose");

const ChartedBookingSchema = new mongoose.Schema({
  tripType: {
    type: String,
    enum: ["oneway", "roundTrip"],
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  bookingFrom: {
    type: String,
    required: true,
  },
  dateOfJourney: {
    type: Date,
    required: true,
  },
  dateOfReturn: {
    type: Date,
  },
  noOfPax: {
    type: Number,
    required: true,
  },
  cost: {
    type: Number,
    required: true,
  },
  confirmed: { // New field for confirmation status
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("ChartedBooking", ChartedBookingSchema);