const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const bookingController = require("../controllers/bookingController");

// 예약 생성
router.post("/", auth, bookingController.createBooking);

// 내 예약 전체 조회
router.get("/", auth, bookingController.getBookings);

// 특정 예약 조회
router.get("/:id", auth, bookingController.getBookingById);

// 특정 호텔 예약 조회 (관리자/업주)
router.get("/hotel/:hotelId", auth, bookingController.getBookingsByHotel);

// 특정 방 예약 조회
router.get("/room/:roomId", auth, bookingController.getBookingsByRoom);

// 예약 취소
router.delete("/:id", auth, bookingController.cancelBooking);

module.exports = router;
