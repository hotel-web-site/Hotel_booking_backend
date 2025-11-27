// src/booking/model.js
// ----------------------------------------------------------
// Booking(예약) 데이터 스키마 정의
// ----------------------------------------------------------

import { Schema, model } from "mongoose";

const bookingSchema = new Schema(
    {
        // 예약한 사용자
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // 호텔
        hotel: {
            type: Schema.Types.ObjectId,
            ref: "Hotel",
            required: true,
        },

        // 객실(Room)
        room: {
            type: Schema.Types.ObjectId,
            ref: "Room",
            required: true,
        },

        // 날짜 정보
        checkIn: { type: Date, required: true },
        checkOut: { type: Date, required: true },

        // 가격 정보
        price: Number,
        nights: Number,
        totalPrice: Number,

        // 예약 상태
        status: {
            type: String,
            enum: ["pending", "booked", "confirmed", "cancelled", "completed"],
            default: "pending",
        },

        // 결제 정보
        paymentProvider: { type: String },
        paymentId: { type: String },
        refunded: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// **default export 추가**
const Booking = model("Booking", bookingSchema);
export default Booking;
