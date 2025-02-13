// src/routes/customerBookingRoutes.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const CustomerBooking = require('../models/CustumerBooking'); // Note: spelling "CustumerBooking"
const Booking = require('../models/Booking'); // Flight slot model

// POST: Create a new customer booking
router.post('/', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { passengers, tripType, selectedFlight, selectedFlightOutbound, selectedFlightReturn } = req.body;
    console.log(`Processing booking for ${passengers} passengers.`);

    // For round-trip bookings, update seats on the outbound and return flights.
    if (tripType === 'roundTrip') {
      if (selectedFlightOutbound?._id && selectedFlightReturn?._id) {
        // If both flights are the same document, update once.
        if (selectedFlightOutbound._id === selectedFlightReturn._id) {
          const flightDoc = await Booking.findById(selectedFlightOutbound._id).session(session);
          console.log(`Single flight seats before: ${flightDoc.seatsAvailable}`);
          flightDoc.seatsAvailable -= passengers;
          console.log(`Single flight seats after: ${flightDoc.seatsAvailable}`);
          await flightDoc.save({ session });
        } else {
          const outboundDoc = await Booking.findById(selectedFlightOutbound._id).session(session);
          console.log(`Outbound seats before: ${outboundDoc.seatsAvailable}`);
          outboundDoc.seatsAvailable -= passengers;
          console.log(`Outbound seats after: ${outboundDoc.seatsAvailable}`);
          await outboundDoc.save({ session });

          const returnDoc = await Booking.findById(selectedFlightReturn._id).session(session);
          console.log(`Return seats before: ${returnDoc.seatsAvailable}`);
          returnDoc.seatsAvailable -= passengers;
          console.log(`Return seats after: ${returnDoc.seatsAvailable}`);
          await returnDoc.save({ session });
        }
      }
    }
    // For one-way bookings, update the single selected flight.
    else if (tripType === 'oneWay' && selectedFlight?._id) {
      const flightDoc = await Booking.findById(selectedFlight._id).session(session);
      console.log(`OneWay flight seats before: ${flightDoc.seatsAvailable}`);
      flightDoc.seatsAvailable -= passengers;
      console.log(`OneWay flight seats after: ${flightDoc.seatsAvailable}`);
      await flightDoc.save({ session });
    }

    // Create the customer booking record.
    const customerBooking = await CustomerBooking.create([req.body], { session });
    
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ booking: customerBooking[0] });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error processing booking:', error);
    res.status(500).json({ message: "Error processing booking", error: error.message });
  }
});

// GET: All customer bookings (optional)
router.get('/', async (req, res) => {
  try {
    const bookings = await CustomerBooking.find().sort({ createdAt: -1 });
    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
