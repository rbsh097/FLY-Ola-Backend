// Backend/server.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
require('dotenv').config(); // Make sure this is near the top

dotenv.config();
require("./config/db")(); // Connect DB

const app = express();

// Middleware
app.use(helmet());


app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));



app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// Import your routes
const adminRoutes = require("./src/routes/adminRoutes");
const bookingRoutes = require("./src/routes/bookingRoutes");
const customerBookingRoutes = require("./src/routes/customerBookingRoutes");
const paymentRoutes = require("./src/routes/paymentRoutes");
const ChartedBookingRoutes = require("./src/routes/ChartedBookingRoutes"); 
// Use routes
app.use("/api/admin", adminRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/customer-bookings", customerBookingRoutes);
app.use("/api/payment", paymentRoutes); // Payment routes
app.use("/api/charted-bookings", ChartedBookingRoutes);
// Default route
app.get("/", (req, res) => {
  res.send("Welcome to the FlyOla Backend");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
