// models/CustomerBooking.js
const mongoose = require('mongoose');

const CustomerBookingSchema = new mongoose.Schema({
  tripType: {
    type: String,
    enum: ['oneWay', 'roundTrip'],
    required: true,
  },
  from: { type: String, required: true },
  to: { type: String, required: true },
  departureDate: { type: String, required: true },
  returnDate: { type: String }, 
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
      identityCardType: { type: String, required: true },
      identityCardImageUrl: { type: String, required: true },
    },
  ],

  selectedFlight: { type: Object },
  selectedFlightOutbound: { type: Object },
  selectedFlightReturn: { type: Object },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('CustomerBooking', CustomerBookingSchema);
