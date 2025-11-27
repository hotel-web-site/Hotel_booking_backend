// -------------------------------
// Payment Service (ESM)
// Toss API와 통신하여 결제 준비/승인/취소 수행
// -------------------------------

import axios from "axios";
import Payment from "./model.js";
import Booking from "../booking/model.js";

const TOSS_SECRET_KEY = Buffer.from(
    process.env.TOSS_SECRET_KEY + ":",
    "utf8"
).toString("base64");

const PaymentService = {
    // 결제 준비
    preparePayment: async ({ userId, bookingId }) => {
        const booking = await Booking.findById(bookingId).populate("room hotel");
        if (!booking) throw new Error("예약을 찾을 수 없습니다.");

        const amount = booking.room.price ?? 0;
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

    // 결제 승인
    confirmPayment: async ({ orderId, paymentKey, amount }) => {
        const url = "https://api.tosspayments.com/v1/payments/confirm";

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

        const payment = await Payment.findOneAndUpdate(
            { orderId },
            { paymentKey, status: "paid", raw: response.data },
            { new: true }
        );

        await Booking.findByIdAndUpdate(payment.booking, { status: "booked" });

        return payment;
    },

    // 결제 취소
    cancelPayment: async ({ bookingId }) => {
        const payment = await Payment.findOne({ booking: bookingId });
        if (!payment) throw new Error("결제 내역이 존재하지 않습니다.");
        if (payment.status !== "paid")
            throw new Error("결제 완료 상태만 취소할 수 있습니다.");

        const url = `https://api.tosspayments.com/v1/payments/${payment.paymentKey}/cancel`;

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

        payment.status = "cancelled";
        payment.raw = response.data;
        await payment.save();

        return payment;
    },
};

export default PaymentService;
