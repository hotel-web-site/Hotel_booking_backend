const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");

dotenv.config();
connectDB();

const app = express();
app.use(cors({ origin: process.env.FRONT_ORIGIN, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

app.get("/", (_req, res) => res.send("Hotel Booking API OK"));

app.use("/api/auth", authRoutes);

// 404 처리
app.use((req, res) => res.status(404).json({ message: "API endpoint not found" }));

// 글로벌 에러 처리
app.use((err, req, res, next) => {
    console.error("서버 에러:", err);
    res.status(500).json({ message: "서버 오류 발생" });
});

module.exports = app;