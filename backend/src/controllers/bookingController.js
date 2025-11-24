import { Booking } from '../models/Booking.js';

// 예약 생성
export async function createBooking(req, res) {
    try {
        const { hotel, room, checkIn, checkOut } = req.body;
        const booking = await Booking.create({
            user: req.user.id,
            hotel,
            room,
            checkIn,
            checkOut,
        });
        res.status(201).json({ message: '예약 생성 완료', booking });
    } catch (error) {
        res.status(500).json({ message: '예약 생성 실패', error: error.message });
    }
}

// 내 전체 예약 조회
export async function getBookings(req, res) {
    try {
        const bookings = await Booking.find({ user: req.user.id })
            .populate('hotel')
            .populate('room');
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: '예약 조회 실패', error: error.message });
    }
}

// 특정 예약 조회
export async function getBookingById(req, res) {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('hotel')
            .populate('room');
        if (!booking) return res.status(404).json({ message: '예약 없음' });
        if (booking.user.toString() !== req.user.id)
            return res.status(403).json({ message: '조회 권한 없음' });
        res.status(200).json(booking);
    } catch (error) {
        res.status(500).json({ message: '특정 예약 조회 실패', error: error.message });
    }
}

// 예약 취소
export async function cancelBooking(req, res) {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: '예약 없음' });
        if (booking.user.toString() !== req.user.id)
            return res.status(403).json({ message: '취소 권한 없음' });

        booking.status = 'cancelled';
        await booking.save();
        res.status(200).json({ message: '예약 취소 완료' });
    } catch (error) {
        res.status(500).json({ message: '예약 취소 실패', error: error.message });
    }
}
