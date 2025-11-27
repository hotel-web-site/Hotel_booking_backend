// -------------------------------
// Payment Model (ESM)
// -------------------------------

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
        orderId: { type: String, required: true },
        amount: { type: Number, required: true },
        status: {
            type: String,
            enum: ["pending", "paid", "cancelled", "failed"],
            default: "pending",
        },
        raw: Object, // Toss API 응답 전체 저장
    },
    { timestamps: true }
);

export default model("Payment", paymentSchema);
