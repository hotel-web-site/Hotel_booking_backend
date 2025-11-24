const express = require("express");
const { createBooking, getBookings, getBookingById, cancelBooking } = require("../controllers/bookingController");
const auth = require("../middlewares/auth");

const router = express.Router();

// 예약 생성
router.post("/", auth, createBooking);

// 내 전체 예약 조회
router.get("/", auth, getBookings);

// 특정 예약 조회
router.get("/:id", auth, getBookingById);

// 예약 취소
router.delete("/:id", auth, cancelBooking);

module.exports = router;
