// src/room/service.js
import { Room } from "./model.js";
import mongoose from "mongoose";

export const RoomService = {
    create: async (data) => await Room.create(data),

    // 🚨 findByHotel 메서드를 업데이트하고, 중복된 getRoomsByHotel 로직을 제거
    findByHotel: async (hotelId) => {
        // 1. hotelId 유효성 검사 및 ObjectId 변환
        if (!mongoose.Types.ObjectId.isValid(hotelId)) {
            // 유효하지 않은 ID라면 빈 배열 반환 (또는 throw Error)
            console.warn(`[RoomService] Invalid hotelId: ${hotelId}`);
            return [];
        }

        try {
            // 2. 해당 호텔 ID를 가진 객실들을 데이터베이스에서 찾아 반환
            // hotelId는 이미 ObjectId 유효성 검사를 통과했으므로 바로 쿼리에 사용
            const rooms = await Room.find({ hotel: hotelId }).lean();
            return rooms;
        } catch (error) {
            console.error("Mongoose 쿼리 오류:", error);
            // 서비스 계층에서는 상세 오류를 감추고 일반화하여 던지는 것이 좋습니다.
            throw new Error("호텔 객실 정보 조회 실패");
        }
    },

    // findById, update, delete는 기존 로직을 유지
    findById: async (id) => await Room.findById(id).populate("hotel"),
    update: async (id, updateData) => await Room.findByIdAndUpdate(id, updateData, { new: true }),
    delete: async (id) => await Room.findByIdAndDelete(id),
};
// 🚨 export const getRoomsByHotel 부분은 RoomService 객체 내부에 포함되면서 제거되었습니다.