import { BookingService } from './service.js';
import { successResponse, errorResponse } from '../common/response.js';

export async function createBooking(req, res) {
    try {
        const booking = await BookingService.create({
            user: req.user.id,
            ...req.body,
        });

        return res.status(201).json(
            successResponse(booking, "예약 생성 완료", 201)
        );
    } catch (error) {
        return res.status(500).json(
            errorResponse("예약 생성 실패", 500, error.message)
        );
    }
}

export async function getBookings(req, res) {
    try {
        const bookings = await BookingService.findByUser(req.user.id);
        return res.status(200).json(
            successResponse(bookings, "예약 조회 완료")
        );
    } catch (error) {
        return res.status(500).json(
            errorResponse("예약 조회 실패", 500, error.message)
        );
    }
}

export async function getBookingById(req, res) {
    try {
        const booking = await BookingService.findById(req.params.id);

        if (!booking)
            return res.status(404).json(
                errorResponse("예약 없음", 404)
            );

        if (booking.user._id.toString() !== req.user.id)
            return res.status(403).json(
                errorResponse("조회 권한 없음", 403)
            );

        return res.status(200).json(
            successResponse(booking, "예약 조회 완료")
        );
    } catch (error) {
        return res.status(500).json(
            errorResponse("특정 예약 조회 실패", 500, error.message)
        );
    }
}

export async function cancelBooking(req, res) {
    try {
        const booking = await BookingService.findById(req.params.id);

        if (!booking)
            return res.status(404).json(
                errorResponse("예약 없음", 404)
            );

        if (booking.user._id.toString() !== req.user.id)
            return res.status(403).json(
                errorResponse("취소 권한 없음", 403)
            );

        await BookingService.cancel(booking);

        return res.status(200).json(
            successResponse(null, "예약 취소 완료")
        );
    } catch (error) {
        return res.status(500).json(
            errorResponse("예약 취소 실패", 500, error.message)
        );
    }
}
