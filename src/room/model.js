// src/room/model.js
// -------------------------------------------
// Room(객실) 데이터 스키마 정의
// 호텔(hotel) 참조, 객실 이름, 타입, 가격, 최대 인원, 상태 등
// -------------------------------------------

import { Schema, model } from 'mongoose';

const roomSchema = new Schema(
    {
        hotel: {
            type: Schema.Types.ObjectId,
            ref: 'Hotel',  // Management에서 만든 Hotel 참조
            required: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        type: {
            type: String,
            required: true, // Single, Double, Suite 등
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        capacity: {
            type: Number,
            required: true,
            min: 1,
        },
        status: {
            type: String,
            enum: ['available', 'unavailable', 'maintenance'],
            default: 'available',
        },
        images: [
            { type: String }, // S3 이미지 URL
        ],
    },
    { timestamps: true } // createdAt, updatedAt 자동 생성
);

export const Room = model('Room', roomSchema);
