import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";

import authRoutes from "./user/route.js";
import bookingRoutes from "./booking/route.js";
import reviewRoutes from "./review/route.js";
import paymentRoutes from "./payment/route.js";
import hotelRoutes from "./hotel/route.js"
import roomRoutes from './room/route.js';

import { errorResponse } from "./common/response.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors({ origin: process.env.FRONT_ORIGIN, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

app.get("/", (_req, res) => res.json({ message: "Hotel Booking API OK" }));

// ----------------------------------------------------
// ✨ 라우터 마운팅 수정 (경로 충돌 및 불일치 해결) ✨
// ----------------------------------------------------

app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);

// 🚨 수정 1: roomRoutes와 충돌하는 것을 방지하기 위해 hotelRoutes를 먼저 마운트합니다.
app.use("/api/hotels", hotelRoutes);

// 🚨 수정 2: roomRoutes를 /api/hotels와 분리하여 /api/rooms 경로에 등록합니다.
// (프론트엔드 App.jsx의 요청 URL도 /api/rooms에 맞게 수정해야 함)
app.use('/api/rooms', roomRoutes);

// 🚨 수정 3: reviewRoutes 경로를 단순화합니다.
// 기존 '/api/hotels/review' 대신 /api/reviews에 마운트합니다.
app.use("/api/reviews", reviewRoutes);

app.use("/api/payment", paymentRoutes);


// ----------------------------------------------------

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