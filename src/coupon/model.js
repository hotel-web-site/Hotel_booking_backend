import { Schema, model } from 'mongoose';

const couponSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true, // 예: "여름 휴가 10% 할인"
        },
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true, // 예: "SUMMER2025"
            trim: true,
        },
        discountType: {
            type: String,
            enum: ['percentage', 'amount'], // % 할인 vs 금액 할인
            required: true,
        },
        discountValue: {
            type: Number,
            required: true, // 10(%) 또는 5000(원)
        },
        validFrom: {
            type: Date,
            default: Date.now,
        },
        validUntil: {
            type: Date,
            required: true, // 만료일 필수
        },
        totalQuantity: {
            type: Number, // 발행할 총 개수 (null이면 무제한)
            default: null,
        },
        isActive: {
            type: Boolean,
            default: true,
        }
    },
    { timestamps: true }
);

export default model('Coupon', couponSchema);