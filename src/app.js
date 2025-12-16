import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";

// 라우터 임포트
import userRoutes from "./user/route.js";
import authRoutes from "./auth/route.js";
import hotelRoutes from "./hotel/route.js";
import roomRoutes from './room/route.js';
import reviewRoutes from "./review/route.js";
import bookingRoutes from "./booking/route.js";
import paymentRoutes from "./payment/route.js";
import inquiryRoutes from "./inquiry/route.js";
import noticeRoutes from "./notice/route.js"; // ✨ 공지사항 라우터 추가

import { errorResponse } from "./common/response.js";

dotenv.config();
connectDB();

const app = express();

// 미들웨어 설정
app.use(cors({ origin: process.env.FRONT_ORIGIN, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

app.get("/", (_req, res) => res.json({ message: "Hotel Booking API OK" }));

/**
 * ✨ 라우터 마운팅 ✨
 */

// 1. 인증 및 사용자 (소셜 로그인 및 일반 인증)
app.use("/api/auth", authRoutes); // API 요청용 (/api/auth/me 등)
app.use("/", authRoutes);          // 소셜 콜백용 (/login/kakao 등)
app.use("/api/users", userRoutes);

// 2. 숙박 시설 및 객실
app.use("/api/hotels", hotelRoutes);
app.use("/api/rooms", roomRoutes);

// 3. 고객 소통 및 정보 (리뷰, 문의, 공지사항)
app.use("/api/reviews", reviewRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/notices", noticeRoutes);     // ✨ 공지사항 경로 추가 (/api/notices)

// 4. 예약 및 결제
app.use("/api/bookings", bookingRoutes);
app.use("/api/payment", paymentRoutes);

/**
 * ----------------------------------------------------
 */

// 404 처리
app.use((req, res) => {
    return res.status(404).json(errorResponse("요청하신 API 엔드포인트를 찾을 수 없습니다.", 404));
});

// 전역 에러 핸들러
app.use((err, req, res, next) => {
    console.error("🔥 서버 에러 발생:", err);
    res.status(err.status || 500).json(
        errorResponse(err.message || "서버 내부 오류가 발생했습니다.", err.status || 500)
    );
});

export default app;