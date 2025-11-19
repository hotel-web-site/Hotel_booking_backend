const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 🟦 미들웨어 설정
app.use(cors({
    origin: process.env.FRONT_ORIGIN,
    credentials: true
}));
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

// 🟦 MongoDB 연결
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB 연결 성공"))
    .catch((err) => console.error("MongoDB 연결 실패:", err.message));

// 🟦 기본 라우트
app.get("/", (_req, res) => {
    res.send("Hotel Booking API OK");
});

// 🟦 라우터 연결
const authRoutes = require("./routes/authRoutes");

app.use("/api/auth", authRoutes);

// 🟥 404 처리
app.use((req, res) => {
    res.status(404).json({ message: "API endpoint not found" });
});

// 🟥 글로벌 에러 처리
app.use((err, req, res, next) => {
    console.error("서버 에러:", err);
    res.status(500).json({ message: "서버 오류 발생" });
});

// 🟦 서버 실행
app.listen(PORT, () => {
    console.log(`Server running: http://localhost:${PORT}`);
});
