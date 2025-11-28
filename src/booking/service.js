// src/booking/service.js
// ----------------------------------------------------------
// Booking 비즈니스 로직 계층
// - 날짜 중복 체크
// - 예약 생성
// - 예약 취소
// - 결제 연동 후 예약 확정(confirm)
// ----------------------------------------------------------

import createError from 'http-errors';
import Booking from './model.js';
import { Room } from '../room/model.js';
import Hotel from '../hotel/model.js';
import PaymentService from '../payment/service.js'; // 추가

// 특정 객실에 대해 날짜 중복 예약 여부 체크
async function isRoomBooked(roomId, checkIn, checkOut) {
    return await Booking.findOne({
        room: roomId,
        status: { $ne: 'cancelled' },
        checkIn: { $lt: checkOut },
        checkOut: { $gt: checkIn },
    });
}

export const BookingService = {
    // 예약 생성
    async create(data) {
        const { hotel, room, checkIn, checkOut } = data;

        if (new Date(checkIn) >= new Date(checkOut)) {
            throw createError(400, '체크인 날짜는 체크아웃보다 이전이어야 합니다.');
        }

        const roomDoc = await Room.findById(room);
        if (!roomDoc) throw createError(404, '존재하지 않는 객실입니다.');

        const hotelDoc = await Hotel.findById(hotel);
        if (!hotelDoc) throw createError(404, '존재하지 않는 호텔입니다.');

        const conflict = await isRoomBooked(room, checkIn, checkOut);
        if (conflict) throw createError(409, '해당 기간에 이미 예약이 존재합니다.');

        const nights =
            Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));

        const price = roomDoc.price || 0;
        const totalPrice = price * nights;

        return await Booking.create({
            ...data,
            price,
            nights,
            totalPrice,
        });
    },

    // 유저별 예약 조회
    async findByUser(userId) {
        return await Booking.find({ user: userId })
            .populate('hotel')
            .populate('room')
            .sort({ createdAt: -1 });
    },

    // 예약 ID로 조회
    async findById(id) {
        return await Booking.findById(id).populate('hotel').populate('room');
    },

    // 결제 완료 → 예약 확정
    async confirm(bookingId, paymentInfo) {
        const booking = await Booking.findById(bookingId);
        if (!booking) throw createError(404, '예약을 찾을 수 없습니다.');

        booking.status = 'confirmed';
        booking.paymentProvider = paymentInfo.provider;
        booking.paymentId = paymentInfo.paymentId;

        return await booking.save();
    },

    // 예약 취소
    async cancel(bookingId) {
        const booking = await Booking.findById(bookingId);
        if (!booking) throw createError(404, '예약을 찾을 수 없습니다.');

        // 결제 완료 상태면 PaymentService 호출
        if (booking.status === 'confirmed' || booking.status === 'booked') {
            const { payment, booking: updatedBooking } = await PaymentService.cancelPayment({
                bookingId,
            });
            return updatedBooking; // 상태 업데이트된 booking 반환
        }

        // 결제 없는 예약이면 단순 취소
        booking.status = 'cancelled';
        return await booking.save();
    },

    // 객실 가용 여부 체크
    async checkAvailability(roomId, checkIn, checkOut) {
        const conflict = await isRoomBooked(roomId, checkIn, checkOut);
        return !conflict;
    },
};
