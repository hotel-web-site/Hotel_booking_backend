import Joi from 'joi';
import mongoose from "mongoose";

const { Schema } = mongoose;

const hotelSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        type: {
            type: String,
            enum: ["hotel", "motel", "resort"],
            default: "hotel",
        },
        city: { type: String, required: true, trim: true },
        country: { type: String, required: true, trim: true, default: "대한민국" }, // ✅ 'country' 필드 추가
        address: { type: String, trim: true },
        location: { type: String, trim: true },
        images: [{ type: String, trim: true }],
        amenities: [{ type: String, trim: true }],
        ratingAverage: { type: Number, default: 0, min: 0, max: 5 },
        ratingCount: { type: Number, default: 0 },
        owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
        freebies: {
            breakfast: { type: Boolean, default: false },
            airportPickup: { type: Boolean, default: false },
            wifi: { type: Boolean, default: false },
            customerSupport: { type: Boolean, default: false },
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },
        basePrice: { type: Number, default: 0 },
        tags: [{ type: String, trim: true }],
        featured: { type: Boolean, default: false }, // 추천 숙소 여부
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

hotelSchema.index({ city: 1, status: 1 });

hotelSchema.set("toJSON", {
    virtuals: true,
    transform: (_doc, ret) => {
        ret.id = ret._id;
        ret.hotelId = ret._id;
        delete ret._id;
        delete ret.__v;
    },
});

export const Hotel = mongoose.model("Hotel", hotelSchema);
export default Hotel;