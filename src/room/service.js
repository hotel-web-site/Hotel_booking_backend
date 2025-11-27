// src/room/service.js
// -------------------------------------------
// Room 관련 DB 처리 서비스
// 생성, 조회, 수정, 삭제 기능 제공
// -------------------------------------------

import { Room } from './model.js';

export const RoomService = {
    create: async (data) => {
        return await Room.create(data);
    },

    findByHotel: async (hotelId) => {
        return await Room.find({ hotel: hotelId });
    },

    findById: async (id) => {
        return await Room.findById(id).populate('hotel'); // hotel 정보도 가져오기
    },

    update: async (id, updateData) => {
        return await Room.findByIdAndUpdate(id, updateData, { new: true });
    },

    delete: async (id) => {
        return await Room.findByIdAndDelete(id);
    },
};
