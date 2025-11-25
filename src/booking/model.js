import { Schema, model } from 'mongoose';

const bookingSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        hotel: {
            type: Schema.Types.ObjectId,
            ref: 'Hotel',
            required: true,
        },
        room: {
            type: Schema.Types.ObjectId,
            ref: 'Room',
            required: true,
        },
        checkIn: {
            type: Date,
            required: true,
        },
        checkOut: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ['booked', 'cancelled', 'completed'],
            default: 'booked',
        },
    },
    {
        timestamps: true,
    }
);

export const Booking = model('Booking', bookingSchema);
