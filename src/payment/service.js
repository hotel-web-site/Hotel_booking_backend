import axios from "axios";
import Payment from "./model.js";
import Booking from "../booking/model.js";
import createError from "http-errors";

// .env에 등록하신 TOSS_SECRET_KEY를 사용합니다.
const TOSS_SECRET_KEY = Buffer.from(process.env.TOSS_SECRET_KEY + ":", "utf8").toString("base64");

const PaymentService = {
    // 1. 결제 준비 (유저)
    preparePayment: async ({ userId, bookingId }) => {
        const booking = await Booking.findById(bookingId);
        if (!booking || booking.user.toString() !== userId) {
            throw createError(403, "결제 권한이 없거나 예약을 찾을 수 없습니다.");
        }

        const amount = booking.totalPrice || 0;
        const orderId = `ORDER_${bookingId}_${Date.now()}`;

        return await Payment.create({
            user: userId,
            booking: bookingId,
            orderId,
            amount,
            status: "pending",
        });
    },

    // 2. 결제 승인 (유저 -> Toss API 연동)
    confirmPayment: async ({ orderId, paymentKey, amount }) => {
        try {
            const response = await axios.post(
                "https://api.tosspayments.com/v1/payments/confirm",
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
                {
                    paymentKey,
                    status: "paid",
                    raw: response.data,
                    paymentType: response.data.method
                },
                { new: true }
            );

            // 예약 상태를 확정(confirmed)으로 변경
            await Booking.findByIdAndUpdate(payment.booking, {
                status: "confirmed",
                paymentId: payment._id
            });

            return payment;
        } catch (error) {
            const status = error.response?.status || 500;
            throw createError(status, error.response?.data?.message || "결제 승인 실패");
        }
    },

    // 3. 결제 취소/환불 (유저/관리자 공용)
    cancelPayment: async ({ bookingId, userId, isAdmin }) => {
        const payment = await Payment.findOne({ booking: bookingId });
        if (!payment) throw createError(404, "결제 내역을 찾을 수 없습니다.");

        // 본인 확인 (관리자가 아닐 경우)
        if (!isAdmin && payment.user.toString() !== userId) {
            throw createError(403, "취소 권한이 없습니다.");
        }

        try {
            const response = await axios.post(
                `https://api.tosspayments.com/v1/payments/${payment.paymentKey}/cancel`,
                { cancelReason: "고객 요청 취소" },
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

            await Booking.findByIdAndUpdate(bookingId, { status: "cancelled" });
            return payment;
        } catch (error) {
            const status = error.response?.status || 500;
            throw createError(status, error.response?.data?.message || "환불 처리 실패");
        }
    },

    // 4. 전체 내역 조회 (관리자 - 매니지먼트 로직)
    getAllPayments: async (page = 1, limit = 10) => {
        const skip = (page - 1) * limit;
        const payments = await Payment.find()
            .populate('user', 'name email')
            .populate({
                path: 'booking',
                populate: { path: 'hotel', select: 'name' }
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Payment.countDocuments();
        return { payments, total, page, totalPages: Math.ceil(total / limit) };
    }
};

export default PaymentService;