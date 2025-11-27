// src/booking/controller.js
// ----------------------------------------------------------
// Booking Controller (라우터 → 서비스 연결)
// 모든 응답은 successResponse / errorResponse 포맷으로 반환
// ----------------------------------------------------------

import { BookingService } from './service.js';
import { successResponse, errorResponse } from '../common/response.js';

// 예약 생성
export async function createBooking(req, res) {
    try {
        const booking = await BookingService.create({
            ...req.body,
            user: req.user.id,
        });

        return res.status(201).json(
            successResponse(booking, '예약 생성 완료', 201)
        );
    } catch (err) {
        return res.status(err.status || 500).json(
            errorResponse(
                err.message || '예약 생성 실패',
                err.status || 500,
                null
            )
        );
    }
}

// 내 예약 전체 조회
export async function getBookings(req, res) {
    try {
        const result = await BookingService.findByUser(req.user.id);

        return res.json(successResponse(result, '예약 조회 완료', 200));
    } catch (err) {
        return res.status(err.status || 500).json(
            errorResponse(
                err.message || '예약 조회 실패',
                err.status || 500,
                null
            )
        );
    }
}

// 특정 예약 조회
export async function getBookingById(req, res) {
    try {
        const booking = await BookingService.findById(req.params.id);

        if (!booking) {
            return res.status(404).json(errorResponse('예약을 찾을 수 없습니다.', 404));
        }

        if (booking.user._id.toString() !== req.user.id) {
            return res.status(403).json(errorResponse('조회 권한 없음', 403));
        }

        return res.json(successResponse(booking, '예약 조회 완료', 200));
    } catch (err) {
        return res.status(err.status || 500).json(
            errorResponse(
                err.message || '예약 조회 실패',
                err.status || 500,
                null
            )
        );
    }
}

// 예약 확정 (결제 성공 후 호출)
export async function confirmBooking(req, res) {
    try {
        const booking = await BookingService.confirm(req.params.id, {
            provider: req.body.paymentProvider,
            paymentId: req.body.paymentId,
        });

        return res.json(successResponse(booking, '예약 확정 완료', 200));
    } catch (err) {
        return res.status(err.status || 500).json(
            errorResponse(err.message || '예약 확정 실패', err.status || 500)
        );
    }
}

// 예약 취소
export async function cancelBooking(req, res) {
    try {
        const booking = await BookingService.findById(req.params.id);

        if (!booking) {
            return res.status(404).json(errorResponse('예약을 찾을 수 없습니다.', 404));
        }

        if (booking.user._id.toString() !== req.user.id) {
            return res.status(403).json(errorResponse('취소 권한 없음', 403));
        }

        await BookingService.cancel(req.params.id);

        return res.json(successResponse(null, '예약 취소 완료', 200));
    } catch (err) {
        return res.status(err.status || 500).json(
            errorResponse(err.message || '예약 취소 실패', err.status || 500)
        );
    }
}

// 객실 가용 여부
export async function checkAvailability(req, res) {
    try {
        const { roomId } = req.params;
        const { checkIn, checkOut } = req.query;

        if (!checkIn || !checkOut) {
            return res.status(400).json(
                errorResponse('checkIn, checkOut 값은 필수입니다.', 400)
            );
        }

        const available = await BookingService.checkAvailability(roomId, checkIn, checkOut);

        return res.json(successResponse({ available }, '가용 여부 조회 완료', 200));
    } catch (err) {
        return res.status(err.status || 500).json(
            errorResponse(err.message || '가용 여부 조회 실패', err.status || 500)
        );
    }
}
