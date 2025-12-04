import PaymentService from "./service.js";
import { successResponse, errorResponse } from "../common/response.js";
import createError from "http-errors";
import Booking from "../booking/model.js"; // 권한 확인을 위해 Booking 모델 임포트

// 결제 준비 (POST /api/payment/prepare)
export const preparePayment = async (req, res) => {
    try {
        const { bookingId } = req.body;
        if (!bookingId) throw createError(400, "bookingId는 필수입니다.");

        // ⭐ 컨트롤러에서 예약 소유권 사전 확인
        const booking = await Booking.findById(bookingId);
        if (!booking || booking.user.toString() !== req.user.id) {
            throw createError(403, "결제 권한이 없거나 예약을 찾을 수 없습니다.");
        }

        const { payment, orderId, amount } = await PaymentService.preparePayment({
            userId: req.user.id,
            bookingId,
        });

        return res.status(200).json(
            successResponse(
                { paymentId: payment._id, orderId, amount, booking: payment.booking },
                "결제 준비 완료"
            )
        );
    } catch (err) {
        const status = err.status || 500;
        return res.status(status).json(errorResponse(err.message || "결제 준비 실패", status));
    }
};

// 결제 승인 (POST /api/payment/confirm)
export const confirmPayment = async (req, res) => {
    try {
        const { orderId, paymentKey, amount } = req.body;
        if (!orderId || !paymentKey || !amount) throw createError(400, "필수 결제 정보가 누락되었습니다.");

        const payment = await PaymentService.confirmPayment({
            orderId,
            paymentKey,
            amount,
        });

        return res.status(200).json(successResponse(payment, "결제 승인 완료"));
    } catch (err) {
        const status = err.status || 500;
        return res.status(status).json(errorResponse(err.message || "결제 승인 실패", status));
    }
};

// 결제 취소 (POST /api/payment/cancel/:bookingId)
export const cancelPayment = async (req, res) => {
    try {
        const { bookingId } = req.params;

        // ⭐ 컨트롤러에서 예약 소유권 사전 확인
        const booking = await Booking.findById(bookingId);
        if (!booking || booking.user.toString() !== req.user.id) {
            throw createError(403, "취소 권한이 없거나 예약을 찾을 수 없습니다.");
        }

        const { payment, booking: updatedBooking } = await PaymentService.cancelPayment({ bookingId });

        return res.status(200).json(successResponse({ payment, booking: updatedBooking }, "결제 취소 완료"));
    } catch (err) {
        const status = err.status || 500;
        return res.status(status).json(errorResponse(err.message || "환불 실패", status));
    }
};