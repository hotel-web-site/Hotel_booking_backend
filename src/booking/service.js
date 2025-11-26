import { Booking } from './model.js';

export const BookingService = {
    create: async (data) => {
        return await Booking.create(data);
    },

    findByUser: async (userId) => {
        return await Booking.find({ user: userId })
            .populate('hotel')
            .populate('room');
    },

    findById: async (id) => {
        return await Booking.findById(id)
            .populate('hotel')
            .populate('room');
    },

    cancel: async (booking) => {
        booking.status = 'cancelled';
        return await booking.save();
    },
};
