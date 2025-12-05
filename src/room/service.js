import { Room } from "./model.js";
import mongoose from "mongoose";

export const RoomService = {
    create: async (data) => await Room.create(data),

    findByHotel: async (hotelId) => {
        if (!mongoose.Types.ObjectId.isValid(hotelId)) return [];
        return await Room.find({ hotel: mongoose.Types.ObjectId(hotelId) });
    },

    // 호텔별 룸 조회
    getRoomsByHotel: async (hotelId) => {
        if (!mongoose.Types.ObjectId.isValid(hotelId)) return [];
        return await Room.find({ hotel: mongoose.Types.ObjectId(hotelId) });
    },

    findById: async (id) => await Room.findById(id).populate("hotel"),

    update: async (id, updateData) => await Room.findByIdAndUpdate(id, updateData, { new: true }),

    delete: async (id) => await Room.findByIdAndDelete(id),
};
