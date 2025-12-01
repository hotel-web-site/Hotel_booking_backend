import axios from "axios";
import Payment from "./model.js";
import Booking from "../booking/model.js";
import createError from "http-errors";

// TOSS_SECRET_KEY 인코딩
const TOSS_SECRET_KEY = Buffer.from(
    process.env.TOSS_SECRET_KEY + ":",
    "utf8"
).toString("base64");

const PaymentService = {
    // ----------------------------------------------------
    // 결제 준비: booking.totalPrice를 사용
    // ----------------------------------------------------
    preparePayment: async ({ userId, bookingId }) => {
        const booking = await Booking.findById(bookingId);
        if (!booking) throw createError(404, "예약을 찾을 수 없습니다.");

        // ⭐ 중요: booking.totalPrice를 사용
        const amount = booking.totalPrice ?? 0;
        if (amount <= 0) throw createError(400, "결제 금액이 유효하지 않습니다.");

        if (booking.user.toString() !== userId) throw createError(403, "결제 권한이 없습니다.");

        const orderId = `ORDER_${bookingId}_${Date.now()}`;

        const payment = await Payment.create({
            user: userId,
            booking: bookingId,
            orderId,
            amount,
            status: "pending",
        });

        return { payment, amount, orderId };
    },

    // ----------------------------------------------------
    // 결제 승인: PG사 최종 확인 및 예약 확정 (상태: 'confirmed')
    // ----------------------------------------------------
    confirmPayment: async ({ orderId, paymentKey, amount }) => {
        const url = "https://api.tosspayments.com/v1/payments/confirm";

        try {
            // 1. Toss API에 승인 요청
            const response = await axios.post(
                url,
                { orderId, paymentKey, amount },
                {
                    headers: {
                        Authorization: `Basic ${TOSS_SECRET_KEY}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const tossData = response.data;

            // 2. Payment DB 상태 업데이트
            const payment = await Payment.findOneAndUpdate(
                { orderId },
                {
                    paymentKey,
                    status: "paid",
                    raw: tossData,
                    paymentType: tossData.method
                },
                { new: true }
            );
            if (!payment) throw createError(404, "결제 내역을 찾을 수 없습니다.");

            // 3. Booking DB 상태 업데이트 (⭐ 상태명: confirmed)
            await Booking.findByIdAndUpdate(payment.booking, { status: "confirmed", paymentId: payment._id });

            return payment;

        } catch (error) {
            const status = error.response?.status || 500;
            const message = error.response?.data?.message || '결제 승인 중 알 수 없는 오류가 발생했습니다.';
            throw createError(status, message);
        }
    },

    // ----------------------------------------------------
    // 결제 취소: 환불 요청 및 DB 상태 업데이트
    // ----------------------------------------------------
    cancelPayment: async ({ bookingId }) => {
        const payment = await Payment.findOne({ booking: bookingId });
        if (!payment) throw createError(404, "결제 내역이 존재하지 않습니다.");
        if (payment.status !== "paid")
            throw createError(400, "결제 완료 상태만 취소할 수 있습니다.");

        const url = `https://api.tosspayments.com/v1/payments/${payment.paymentKey}/cancel`;

        try {
            // 1. Toss 환불 요청
            const response = await axios.post(
                url,
                { cancelReason: "User Request" },
                {
                    headers: {
                        Authorization: `Basic ${TOSS_SECRET_KEY}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            // 2. Payment 상태 업데이트
            payment.status = "cancelled";
            payment.raw = response.data;
            await payment.save();

            // 3. Booking 상태 업데이트
            const booking = await Booking.findById(bookingId);
            if (!booking) throw createError(404, "예약을 찾을 수 없습니다.");
            booking.status = "cancelled";
            booking.refunded = true;
            await booking.save();

            return { payment, booking };

        } catch (error) {
            const status = error.response?.status || 500;
            const message = error.response?.data?.message || '환불 처리 중 알 수 없는 오류가 발생했습니다.';
            throw createError(status, message);
        }
    },
};

export default PaymentService;