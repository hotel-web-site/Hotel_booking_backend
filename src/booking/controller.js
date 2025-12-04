// src/booking/controller.js
import { BookingService } from './service.js';
import { successResponse, errorResponse } from '../common/response.js';

// 공통 예외 처리 헬퍼
const handleServiceError = (res, err) => {
    return res.status(err.status || 500).json(
        errorResponse(
            err.message || '요청 처리 실패',
            err.status || 500,
            null
        )
    );
};

// ----------------------------------------------------
// 예약 생성 (POST /api/bookings)
// ----------------------------------------------------
export async function createBooking(req, res) {
    try {
        const booking = await BookingService.create({
            ...req.body,
            user: req.user.id, // verifyToken 미들웨어에서 추가된 사용자 ID 사용
        });

        // ⭐ 예약 생성 성공 후, 결제 준비 단계 URL을 응답에 포함하여 프론트엔드의 흐름을 유도
        return res.status(201).json(
            successResponse(
                booking,
                '예약 생성 완료, 결제 대기 중',
                201,
                { nextStep: `/api/payment/prepare?bookingId=${booking._id}` }
            )
        );
    } catch (err) {
        return handleServiceError(res, err);
    }
}

// ----------------------------------------------------
// 내 예약 전체 조회 (GET /api/bookings)
// ----------------------------------------------------
export async function getBookings(req, res) {
    try {
        const result = await BookingService.findByUser(req.user.id);

        return res.json(successResponse(result, '예약 조회 완료', 200));
    } catch (err) {
        return handleServiceError(res, err);
    }
}

// ----------------------------------------------------
// 특정 예약 조회 (GET /api/bookings/:id)
// ----------------------------------------------------
export async function getBookingById(req, res) {
    try {
        const booking = await BookingService.findById(req.params.id);

        if (!booking) {
            return res.status(404).json(errorResponse('예약을 찾을 수 없습니다.', 404));
        }

        // 보안: 예약 소유권 확인 (populate된 user 객체의 _id와 요청자의 ID 비교)
        if (booking.user._id.toString() !== req.user.id) {
            return res.status(403).json(errorResponse('조회 권한 없음', 403));
        }

        return res.json(successResponse(booking, '예약 조회 완료', 200));
    } catch (err) {
        return handleServiceError(res, err);
    }
}

// ----------------------------------------------------
// 예약 확정 (POST /api/bookings/:id/confirm)
// ----------------------------------------------------
export async function confirmBooking(req, res) {
    try {
        const booking = await BookingService.confirm(req.params.id, {
            provider: req.body.paymentProvider,
            paymentId: req.body.paymentId,
        });

        return res.json(successResponse(booking, '예약 확정 완료', 200));
    } catch (err) {
        return handleServiceError(res, err);
    }
}

// ----------------------------------------------------
// 예약 취소 (DELETE /api/bookings/:id)
// ----------------------------------------------------
export async function cancelBooking(req, res) {
    try {
        const booking = await BookingService.findById(req.params.id);

        if (!booking) {
            return res.status(404).json(errorResponse('예약을 찾을 수 없습니다.', 404));
        }

        // 보안: 예약 소유권 확인
        if (booking.user._id.toString() !== req.user.id) {
            return res.status(403).json(errorResponse('취소 권한 없음', 403));
        }

        // 서비스에서 환불 및 취소 상태 업데이트 처리
        const cancelledBooking = await BookingService.cancel(req.params.id);

        return res.json(successResponse(cancelledBooking, '예약 취소 완료', 200));
    } catch (err) {
        return handleServiceError(res, err);
    }
}

// ----------------------------------------------------
// 객실 가용 여부 (GET /api/bookings/availability/:roomId)
// ----------------------------------------------------
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
        return handleServiceError(res, err);
    }
}