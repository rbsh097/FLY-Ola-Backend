const mongoose = require('mongoose');

const CustomerBookingSchema = new mongoose.Schema({
  tripType: {
    type: String,
    enum: ['oneWay', 'roundTrip'],
    required: true,
  },
  from: { type: String },
  to: { type: String },
  departureDate: { type: String }, // e.g., "2025-02-12"
  returnDate: { type: String }, // optional for one-way bookings
  packageOption: { type: String },
  passengers: { type: Number  },
  baseFare: { type: Number },
  overweightFees: { type: Number },
  finalTotal: { type: Number },
  passengerDetails: [
    {
      name: { type: String },
      age: { type: Number},
      gender: { type: String },
      email: { type: String },
      mobile: { type: String },
      nationality: { type: String },
      weight: { type: Number },
    },
  ],

  selectedFlight: { type: Object },
  selectedFlightOutbound: { type: Object },
  selectedFlightReturn: { type: Object },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('CustomerBooking', CustomerBookingSchema);
