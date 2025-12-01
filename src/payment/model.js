import mongoose from "mongoose";
const { Schema, model } = mongoose;

const paymentSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        booking: {
            type: Schema.Types.ObjectId,
            ref: "Booking",
            required: true,
        },
        paymentKey: String,
        orderId: { type: String, required: true, unique: true }, // 주문 ID는 고유해야 함
        amount: { type: Number, required: true },
        status: {
            type: String,
            enum: ["pending", "paid", "cancelled", "failed"],
            default: "pending",
        },
        raw: Object, // PG사 API 응답 전체 저장
        paymentType: String, // 카드, 계좌이체 등
    },
    { timestamps: true }
);

export default model("Payment", paymentSchema);