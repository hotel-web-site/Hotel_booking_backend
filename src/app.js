const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");

// 라우트 import
const authRoutes = require("./user/route");       // user/route.js
const bookingRoutes = require("./booking/route"); // booking/route.js
const reviewRoutes = require("./review/route");   // review/route.js

// 공통 응답 유틸
const { errorResponse } = require("./common/response");

dotenv.config();
connectDB();

const app = express();

// 미들웨어
app.use(cors({ origin: process.env.FRONT_ORIGIN, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

// 기본 API 상태 확인
app.get("/", (_req, res) => res.json({ message: "Hotel Booking API OK" }));

// 라우트 등록
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/review", reviewRoutes);

// 404 처리
app.use((req, res) => res.status(404).json(errorResponse("API endpoint not found", 404)));

// 글로벌 에러 처리
app.use((err, req, res, next) => {
    console.error("서버 에러:", err);
    res.status(500).json(errorResponse("서버 오류 발생", 500));
});

module.exports = app;
