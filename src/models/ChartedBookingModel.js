// BookingModel.js
const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  tripType: { type: String, required: true },
  name: { type: String, required: true },
  mobile: { type: String, required: true },
  email: { type: String },
  bookingFrom: { type: String, required: true },
  dateOfJourney: { type: Date, required: true },
  dateOfReturn: { type: Date },
  noOfPax: { type: Number, default: 1 },
  cost: { type: Number, default: 0 },
});

// The key line: export the result of mongoose.model(...)
module.exports = mongoose.model("ChartedBooking", bookingSchema);
