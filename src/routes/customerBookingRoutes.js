// src/routes/customerBookingRoutes.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const CustomerBooking = require('../models/CustumerBooking'); // Note: spelling "CustumerBooking"
const Booking = require('../models/Booking'); // Flight slot model

// POST: Create a new customer booking
router.post('/', async (req, res) => {
  // Start a session for transactional updates
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Basic Manual Validation
    // (Adjust these checks as needed for your application's logic.)
    const {
      tripType,
      from,
      to,
      departureDate,
      returnDate,
      packageOption,
      passengers,
      baseFare,
      finalTotal,
      passengerDetails,
      selectedFlight,
      selectedFlightOutbound,
      selectedFlightReturn,
    } = req.body;

    // Check required top-level fields
    if (!tripType || !from || !to || !departureDate || !passengers || !baseFare || !finalTotal) {
      return res.status(400).json({
        message: 'Missing required booking fields: tripType, from, to, departureDate, passengers, baseFare, finalTotal',
      });
    }

    // If roundTrip, ensure returnDate is provided
    if (tripType === 'roundTrip' && !returnDate) {
      return res.status(400).json({
        message: 'Missing required field: returnDate for roundTrip',
      });
    }

    // Ensure passengerDetails array is present and not empty
    if (!Array.isArray(passengerDetails) || passengerDetails.length === 0) {
      return res.status(400).json({
        message: 'Missing passenger details or passengerDetails is empty',
      });
    }

    // 2. Update Flight Seats (as before)
    console.log(`Processing booking for ${passengers} passengers.`);

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
    } else if (tripType === 'oneWay' && selectedFlight?._id) {
      const flightDoc = await Booking.findById(selectedFlight._id).session(session);
      console.log(`OneWay flight seats before: ${flightDoc.seatsAvailable}`);
      flightDoc.seatsAvailable -= passengers;
      console.log(`OneWay flight seats after: ${flightDoc.seatsAvailable}`);
      await flightDoc.save({ session });
    }

    // 3. Create the Customer Booking record
    //    This will trigger Mongoose schema validation. If any required field
    //    is missing or invalid, a ValidationError is thrown.
    const customerBooking = await CustomerBooking.create([req.body], { session });

    // 4. Commit transaction & end session
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ booking: customerBooking[0] });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    // If it's a Mongoose validation error, respond with 422
    if (error.name === 'ValidationError') {
      return res.status(422).json({
        message: 'Validation failed. Check required fields or schema rules.',
        error: error.message,
      });
    }

    // Otherwise, return a generic 500
    console.error('Error processing booking:', error);
    res.status(500).json({ message: 'Error processing booking', error: error.message });
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



router.delete('/:id', async (req, res) => {
  try {
    const booking = await CustomerBooking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Customer Booking not found' });
    }
    res.json({ message: 'Customer Booking deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


module.exports = router;
