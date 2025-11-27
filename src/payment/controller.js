// -------------------------------
// Payment Controller (ESM)
// -------------------------------

import PaymentService from "./service.js";
import { successResponse, errorResponse } from "../common/response.js";

// 결제 준비
export const preparePayment = async (req, res) => {
    try {
        const { bookingId } = req.body;

        const { payment, orderId, amount } = await PaymentService.preparePayment({
            userId: req.user.id,
            bookingId,
        });

        return res.status(200).json(
            successResponse(
                { paymentId: payment._id, orderId, amount },
                "결제 준비 완료"
            )
        );
    } catch (err) {
        return res
            .status(500)
            .json(errorResponse("결제 준비 실패", 500, err.message));
    }
};

// 결제 승인
export const confirmPayment = async (req, res) => {
    try {
        const { orderId, paymentKey, amount } = req.body;

        const payment = await PaymentService.confirmPayment({
            orderId,
            paymentKey,
            amount,
        });

        return res.status(200).json(successResponse(payment, "결제 승인 완료"));
    } catch (err) {
        return res
            .status(500)
            .json(errorResponse("결제 승인 실패", 500, err.message));
    }
};

// 결제 취소
export const cancelPayment = async (req, res) => {
    try {
        const bookingId = req.params.bookingId;

        const payment = await PaymentService.cancelPayment({ bookingId });

        return res.status(200).json(successResponse(payment, "결제 취소 완료"));
    } catch (err) {
        return res
            .status(500)
            .json(errorResponse("환불 실패", 500, err.message));
    }
};
