const Booking = require("../models/Booking");

async function createBooking(req, res) {
    try {
        const booking = await Booking.create(req.body);
        res.status(201).json({ message: "예약 완료", booking });
    } catch (error) {
        res.status(500).json({ message: "예약 실패", error: error.message });
    }
}

async function getBookings(req, res) {
    try {
        const bookings = await Booking.find({ user: req.user.id }).populate("hotel room");
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: "예약 조회 실패", error: error.message });
    }
}

module.exports = { createBooking, getBookings };