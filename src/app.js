import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";

import authRoutes from "./user/route.js";
import bookingRoutes from "./booking/route.js";
import reviewRoutes from "./review/route.js";
import paymentRoutes from "./payment/route.js";

import { errorResponse } from "./common/response.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors({ origin: process.env.FRONT_ORIGIN, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

app.get("/", (_req, res) => res.json({ message: "Hotel Booking API OK" }));

app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/payment", paymentRoutes);

// 404
app.use((req, res) => {
    return res.status(404).json(errorResponse("API endpoint not found", 404));
});

// Error handler
app.use((err, req, res, next) => {
    console.error("서버 에러:", err);
    res.status(500).json(errorResponse("서버 오류 발생", 500));
});

export default app;
