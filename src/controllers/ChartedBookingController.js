// backend/controllers/bookingController.js
const ChartedBooking = require("../models/ChartedBookingModel");

// Base price map (in Lacs) for Round Trip from each city
const basePrices = {
  Bhopal: 15,
  Jabalpur: 10,
  Indore: 15,
  Gwalior: 11,
  Raipur: 12,
  Ranchi: 10,
  Patna: 10,
  Jaipur: 15,
  Chandigarh: 23,
  Delhi: 15,
  Lucknow: 6,
  Varanasi: 6,
  Nagpur: 15,
  "Chennai (MAA)": 25,
  "Hyderabad (HYD)": 23,
  "Trivandrum (TRV)": 30,
  "Tirupati (TIR)": 25,
  Bangalore: 25,
  Mumbai: 25,
  Pune: 25,
  Ahmedabad: 23,
  Surat: 23,
  Kolkata: 15,
  Guwahati: 23,
  Dehradun: 15,
  Jammu: 23,
  Rajkot: 23,
  Putapatti: 25,
};

/**
 * Calculate cost in Lacs (float) based on the given booking info.
 */
function calculateCost(booking) {
  let price = basePrices[booking.bookingFrom] || 0; // base round trip price in Lacs

  if (booking.tripType === "oneway") {
    // One-way is 75% of round trip
    price *= 0.75;
  } else {
    // Round trip: check date gap
    if (booking.dateOfJourney && booking.dateOfReturn) {
      const start = new Date(booking.dateOfJourney);
      const end = new Date(booking.dateOfReturn);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // If gap > 2 days, add 5 Lacs per extra day
      if (diffDays > 2) {
        const extraDays = diffDays - 2;
        price += 5 * extraDays;
      }
    }
  }

  // Add 18% GST
  const totalWithGst = price + price * 0.18;
  return parseFloat(totalWithGst.toFixed(2)); // round to 2 decimals
}

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Public

exports.createBooking = async (req, res) => {
  try {
    const {
      tripType,
      name,
      mobile,
      email,
      bookingFrom,
      dateOfJourney,
      dateOfReturn,
      noOfPax,
    } = req.body;

    // Build the booking object
    // Rename 'Booking' to 'ChartedBooking'
    const newBooking = new ChartedBooking({
      tripType,
      name,
      mobile,
      email,
      bookingFrom,
      dateOfJourney,
      dateOfReturn,
      noOfPax,
    });

    // Calculate cost (if you keep that function, that’s fine)
    newBooking.cost = calculateCost(newBooking);

    // Save to DB
    const savedBooking = await newBooking.save();
    return res.status(201).json(savedBooking);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

// ...
// Now use 'ChartedBooking' instead of 'Booking'
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await ChartedBooking.find();
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const booking = await ChartedBooking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.deleteBookingById = async (req, res) => {
  try {
    const booking = await ChartedBooking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.json({ message: "Booking deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};