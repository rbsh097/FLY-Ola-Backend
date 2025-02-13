// Backend/controllers/paymentController.js
const crypto = require('crypto');
const axios = require('axios');
const mongoose = require('mongoose');

const getPhonePeConfig = require('./../../config/phonepeConfig');
const CustomerBooking = require('./../models/CustumerBooking');
const Booking = require('./../models/Booking');

// Load environment
require('dotenv').config();
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

// 1) Initiate Payment
exports.initiatePayment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      tripType,
      from,
      to,
      departureDate,
      returnDate,
      packageOption,
      passengers,
      baseFare,
      overweightFees,
      finalTotal,
      passengerDetails,
      selectedFlight,
      selectedFlightOutbound,
      selectedFlightReturn
    } = req.body;

    // (A) Create "pending" booking so we have a record
    const newBooking = await CustomerBooking.create([{
      tripType,
      from,
      to,
      departureDate,
      returnDate,
      packageOption,
      passengers,
      baseFare,
      overweightFees,
      finalTotal,
      passengerDetails,
      selectedFlight,
      selectedFlightOutbound,
      selectedFlightReturn,
      // Optionally add a status field: status: 'pending'
    }], { session });

    const bookingDoc = newBooking[0]; // array returned
    const bookingId = bookingDoc._id.toString();
    const orderId = `ORDER_${bookingId}`; // Unique transaction ID

    // (B) Build request body for PhonePe
    // Check docs: might require amount in paise => finalTotal * 100
    const { merchantId, apiKeyValue, apiKeyIndex, hostUrl } = getPhonePeConfig();
    const amountInPaise = finalTotal * 100; // if your finalTotal is in rupees

    const requestBody = {
      merchantId,
      transactionId: orderId,
      merchantOrderId: orderId,
      amount: amountInPaise,
      merchantUserId: 'someUserId',
      message: 'Payment for flight booking',
      callbackUrl: `${BACKEND_URL}/api/payment/callback`,
      // If your flow is redirect-based, also pass a redirectUrl
      // redirectUrl: `${FRONTEND_URL}/payment-success?orderId=${bookingId}`
    };

    // (C) Generate signature: X-VERIFY = "<apiKeyIndex>|<hmac>"
    const requestBodyString = JSON.stringify(requestBody);
    const hmac = crypto.createHmac('sha256', apiKeyValue)
                       .update(requestBodyString)
                       .digest('hex');
    const xVerify = `${apiKeyIndex}|${hmac}`;

    // (D) Call PhonePe initiate API
    // The path might differ. Example: `${hostUrl}/initiatePayment` or `/pg/v1/pay`.
    const phonepeUrl = `${hostUrl}/initiatePayment`;
    const phonePeResponse = await axios.post(phonepeUrl, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': xVerify
      },
      timeout: 10000
    });

    // (E) Check PhonePe response
    // The structure might vary. Adjust for real data from PhonePe.
    // If success, we expect some "redirectUrl" or "instrumentType"
    const { data } = phonePeResponse;
    if (data.success || data.code === 'SUCCESS') {
      await session.commitTransaction();
      session.endSession();

      // Return the needed info to the client
      return res.json({
        success: true,
        redirectUrl: data.data.redirectUrl || null, // or phonePeResponse.data.redirectUrl
        message: 'Payment initiation successful'
      });
    } else {
      // If PhonePe says "FAILED", revert the "pending" booking
      await CustomerBooking.findByIdAndDelete(bookingId).session(session);
      await session.abortTransaction();
      session.endSession();

      return res.status(400).json({
        success: false,
        message: data.message || 'PhonePe initiation failed',
        phonePeData: data
      });
    }
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('initiatePayment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while initiating payment',
      error: error.message
    });
  }
};

// 2) PhonePe Callback
exports.phonePeCallback = async (req, res) => {
  try {
    // Parse callback data
    // Real callback might have: { transactionId, merchantOrderId, status, ... }
    const { transactionId, status } = req.body;

    if (!transactionId) {
      return res.status(400).json({ success: false, message: 'No transactionId in callback' });
    }

    // Extract booking ID
    const bookingId = transactionId.replace('ORDER_', '');
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const bookingDoc = await CustomerBooking.findById(bookingId).session(session);
      if (!bookingDoc) {
        throw new Error('Booking not found in DB');
      }

      if (status === 'SUCCESS') {
        // 1) Update seats
        const { tripType, passengers, selectedFlight, selectedFlightOutbound, selectedFlightReturn } = bookingDoc;

        if (tripType === 'roundTrip') {
          // Deduct seats from outbound
          if (selectedFlightOutbound && selectedFlightOutbound._id) {
            const outboundDoc = await Booking.findById(selectedFlightOutbound._id).session(session);
            outboundDoc.seatsAvailable -= passengers;
            await outboundDoc.save({ session });
          }
          // Deduct seats from return
          if (selectedFlightReturn && selectedFlightReturn._id) {
            const returnDoc = await Booking.findById(selectedFlightReturn._id).session(session);
            returnDoc.seatsAvailable -= passengers;
            await returnDoc.save({ session });
          }
        } else if (tripType === 'oneWay' && selectedFlight && selectedFlight._id) {
          const flightDoc = await Booking.findById(selectedFlight._id).session(session);
          flightDoc.seatsAvailable -= passengers;
          await flightDoc.save({ session });
        }

        // 2) Mark booking as "paid" if you have a status field
        // bookingDoc.status = 'paid';
        await bookingDoc.save({ session });

        await session.commitTransaction();
        session.endSession();

        // PhonePe may require a specific response format
        return res.json({ success: true, message: 'Payment successful, booking confirmed' });
      } else {
        // Payment failed or canceled
        // Optionally remove booking or mark it as 'failed'
        // await bookingDoc.remove({ session });
        await session.commitTransaction();
        session.endSession();

        return res.json({ success: false, message: 'Payment failed or cancelled' });
      }
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      console.error('Callback transaction error:', err);
      return res.status(500).json({ success: false, message: err.message });
    }
  } catch (error) {
    console.error('phonePeCallback error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error handling payment callback',
      error: error.message
    });
  }
};
