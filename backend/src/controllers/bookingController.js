const Booking = require("../models/Booking");
const Room = require("../models/Room");
const Hotel = require("../models/Hotel");

// 0. 예약 생성
async function createBooking(req, res) {
    try {
        const { roomId, hotelId, checkIn, checkOut } = req.body;

        if (!roomId || !hotelId || !checkIn || !checkOut) {
            return res.status(400).json({ message: "필수 정보 누락" });
        }

        // 방 존재 확인
        const room = await Room.findById(roomId);
        if (!room) return res.status(404).json({ message: "방을 찾을 수 없음" });

        // 호텔 확인
        const hotel = await Hotel.findById(hotelId);
        if (!hotel) return res.status(404).json({ message: "호텔을 찾을 수 없음" });

        // 예약 생성
        const booking = await Booking.create({
            user: req.user.id,
            room: roomId,
            hotel: hotelId,
            checkIn,
            checkOut,
        });

        res.status(201).json({ message: "예약 생성 완료", booking });
    } catch (error) {
        res.status(500).json({ message: "예약 실패", error: error.message });
    }
}

// ① 내 전체 예약 조회 (기존 그대로)
async function getBookings(req, res) {
    try {
        const bookings = await Booking.find({ user: req.user.id })
            .populate("room")
            .populate("hotel");

        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: "예약 조회 실패", error: error.message });
    }
}

// ② 특정 예약 조회
async function getBookingById(req, res) {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate("room")
            .populate("hotel");

        if (!booking) return res.status(404).json({ message: "예약 없음" });

        if (booking.user.toString() !== req.user.id)
            return res.status(403).json({ message: "조회 권한 없음" });

        res.status(200).json(booking);
    } catch (error) {
        res.status(500).json({ message: "특정 예약 조회 실패", error: error.message });
    }
}

// ③ 호텔 기준 예약 조회 (관리자/업주)
async function getBookingsByHotel(req, res) {
    try {
        const bookings = await Booking.find({ hotel: req.params.hotelId })
            .populate("room")
            .populate("user");

        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: "호텔 예약 조회 실패", error: error.message });
    }
}

// ④ 특정 방(Room)의 예약 조회
async function getBookingsByRoom(req, res) {
    try {
        const bookings = await Booking.find({ room: req.params.roomId })
            .populate("user")
            .populate("hotel");

        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: "방 예약 조회 실패", error: error.message });
    }
}

// ⑤ 예약 취소
async function cancelBooking(req, res) {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) return res.status(404).json({ message: "예약 없음" });

        if (booking.user.toString() !== req.user.id)
            return res.status(403).json({ message: "취소 권한 없음" });

        booking.status = "cancelled";
        await booking.save();

        res.status(200).json({ message: "예약 취소 완료" });
    } catch (error) {
        res.status(500).json({ message: "예약 취소 실패", error: error.message });
    }
}

module.exports = {
    createBooking,
    getBookings,
    getBookingById,
    getBookingsByHotel,
    getBookingsByRoom,
    cancelBooking
};
