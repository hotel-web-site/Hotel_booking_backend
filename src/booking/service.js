// src/booking/service.js
import createError from 'http-errors';
import Booking from './model.js';
import { Room } from '../room/model.js';
import Hotel from '../hotel/model.js';
import PaymentService from '../payment/service.js'; // 결제 서비스와의 연동을 위해 임포트

// --- Helper Function ---
// 특정 객실에 대해 날짜 중복 예약 여부 체크
async function isRoomBooked(roomId, checkIn, checkOut) {
    // 취소되지 않은 예약 중, 요청된 기간과 겹치는 예약이 있는지 확인
    return await Booking.findOne({
        room: roomId,
        status: { $ne: 'cancelled' },
        checkIn: { $lt: checkOut }, // 기존 예약 체크아웃이 요청 체크인보다 늦어야 함
        checkOut: { $gt: checkIn }, // 기존 예약 체크인이 요청 체크아웃보다 일찍이어야 함
    });
}

export const BookingService = {
    // ----------------------------------------------------
    // 예약 생성
    // ----------------------------------------------------
    async create(data) {
        const { hotel, room, checkIn, checkOut } = data;

        if (new Date(checkIn) >= new Date(checkOut)) {
            throw createError(400, '체크인 날짜는 체크아웃보다 이전이어야 합니다.');
        }

        // 1. 객실 및 호텔 존재 유효성 검증
        const roomDoc = await Room.findById(room);
        if (!roomDoc) throw createError(404, '존재하지 않는 객실입니다.');

        const hotelDoc = await Hotel.findById(hotel);
        if (!hotelDoc) throw createError(404, '존재하지 않는 호텔입니다.');

        // 2. 예약 중복 여부 최종 체크
        const conflict = await isRoomBooked(room, checkIn, checkOut);
        if (conflict) throw createError(409, '해당 기간에 이미 예약이 존재합니다.');

        // 3. 가격 및 숙박 일수 계산
        const nights =
            Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));

        const price = roomDoc.price || 0;
        const totalPrice = price * nights;

        // 4. 예약 생성 (초기 상태는 'pending' 또는 'pendingPayment')
        return await Booking.create({
            ...data,
            price,
            nights,
            totalPrice,
            status: 'pendingPayment'
        });
    },

    // ----------------------------------------------------
    // 유저별 예약 조회
    // ----------------------------------------------------
    async findByUser(userId) {
        return await Booking.find({ user: userId })
            .populate('hotel')
            .populate('room')
            .sort({ createdAt: -1 });
    },

    // ----------------------------------------------------
    // 예약 ID로 조회
    // ----------------------------------------------------
    async findById(id) {
        return await Booking.findById(id).populate('hotel').populate('room').populate('user');
    },

    // ----------------------------------------------------
    // 결제 완료 → 예약 확정
    // ----------------------------------------------------
    async confirm(bookingId, paymentInfo) {
        const booking = await Booking.findById(bookingId);
        if (!booking) throw createError(404, '예약을 찾을 수 없습니다.');

        if (booking.status === 'confirmed') {
            throw createError(400, '이미 확정된 예약입니다.');
        }

        // 상태를 'confirmed'로 변경하고 결제 정보 업데이트
        booking.status = 'confirmed';
        booking.paymentProvider = paymentInfo.provider;
        booking.paymentId = paymentInfo.paymentId;
        booking.paidAt = new Date(); // 결제 시간 기록

        return await booking.save();
    },

    // ----------------------------------------------------
    // 예약 취소
    // ----------------------------------------------------
    async cancel(bookingId) {
        const booking = await Booking.findById(bookingId);
        if (!booking) throw createError(404, '예약을 찾을 수 없습니다.');

        if (booking.status === 'cancelled') {
            throw createError(400, '이미 취소된 예약입니다.');
        }

        // 결제 완료 상태면 환불 로직을 위해 PaymentService 호출
        if (booking.status === 'confirmed' || booking.status === 'pendingPayment') {

            // PaymentService.cancelPayment는 외부 PG사에 환불 요청 및 DB 상태를 업데이트해야 함
            const { updatedBooking } = await PaymentService.cancelPayment({
                bookingId: booking._id,
                paymentId: booking.paymentId, // 환불에 필요한 정보 전달
                totalPrice: booking.totalPrice, // 환불 금액
            });

            // PaymentService에서 이미 상태를 'cancelled'로 업데이트했다고 가정하고 반환
            return updatedBooking;
        }

        // 결제되지 않은 'pending' 예약은 단순 취소 처리
        booking.status = 'cancelled';
        return await booking.save();
    },

    // ----------------------------------------------------
    // 객실 가용 여부 체크 (프론트엔드 사전 체크용)
    // ----------------------------------------------------
    async checkAvailability(roomId, checkIn, checkOut) {
        const conflict = await isRoomBooked(roomId, checkIn, checkOut);
        return !conflict;
    },
};