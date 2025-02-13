// server.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const fetch = require("node-fetch").default; // Use .default for node-fetch v3+

dotenv.config();

const connectDB = require("./config/db");
connectDB();

const app = express();

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-VERIFY']
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));


app.post("/api/phonepe-initiate", async (req, res) => {
  const { requestBody, xVerify } = req.body;
  
  try {
    const phonePeResponse = await fetch("https://api-preprod.phonepe.com/apis/hermes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": xVerify,
      },
      body: requestBody,
    });
    
    // Handle non-OK responses first
    if (!phonePeResponse.ok) {
      const errorText = await phonePeResponse.text();
      console.error("PhonePe API error:", errorText);
      return res.status(phonePeResponse.status).json({
        error: "Payment gateway error",
        details: errorText
      });
    }

    const responseData = await phonePeResponse.json();
    res.json(responseData);
  } catch (error) {
    console.error("PhonePe API error:", error);
    res.status(500).json({ 
      error: "Payment gateway communication failed",
      details: error.message
    });
  }
});



// Import other routes
const adminRoutes = require("./src/routes/adminRoutes");
const bookingRoutes = require("./src/routes/bookingRoutes");
const customerBookingRoutes = require("./src/routes/CustomerBookingRoutes");

// Use routes
app.use("/api/admin", adminRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/customer-bookings", customerBookingRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("Welcome to the FlyOla Backend");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
