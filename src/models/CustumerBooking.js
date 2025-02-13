const mongoose = require('mongoose');

const CustomerBookingSchema = new mongoose.Schema({
  tripType: {
    type: String,
    enum: ['oneWay', 'roundTrip'],
    required: true,
  },
  from: { type: String, required: true },
  to: { type: String, required: true },
  departureDate: { type: String, required: true }, // e.g., "2025-02-12"
  returnDate: { type: String }, // optional for one-way bookings
  packageOption: { type: String },
  passengers: { type: Number, required: true },
  baseFare: { type: Number, required: true },
  overweightFees: { type: Number, default: 0 },
  finalTotal: { type: Number, required: true },
  passengerDetails: [
    {
      name: { type: String, required: true },
      age: { type: Number, required: true },
      gender: { type: String, required: true },
      email: { type: String, required: true },
      mobile: { type: String, required: true },
      nationality: { type: String, required: true },
      weight: { type: Number, required: true },
    },
  ],

  selectedFlight: { type: Object },
  selectedFlightOutbound: { type: Object },
  selectedFlightReturn: { type: Object },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('CustomerBooking', CustomerBookingSchema);
