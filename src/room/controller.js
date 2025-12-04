// src/room/controller.js
// -------------------------------------------
// Room 컨트롤러
// HTTP 요청을 받아 RoomService 호출 후 응답 반환
// -------------------------------------------

import { RoomService } from './service.js';
import { successResponse, errorResponse } from '../common/response.js';

// 객실 등록
export const createRoom = async (req, res) => {
    try {
        const room = await RoomService.create(req.body);
        return res.status(201).json(successResponse(room, '객실 생성 완료'));
    } catch (err) {
        // 💡 디버그: 에러 상세 정보를 로그로 출력하여 서버 버그를 찾을 수 있게 합니다.
        console.error("Error creating room:", err.message, err.stack);
        return res.status(500).json(errorResponse('객실 생성 실패', 500, err.message));
    }
};

// 호텔별 객실 조회
export const getRoomsByHotel = async (req, res) => {
    try {
        const rooms = await RoomService.findByHotel(req.params.hotelId);
        return res.status(200).json(successResponse(rooms, '호텔 객실 조회 완료'));
    } catch (err) {
        // 💡 디버그: 500 에러 발생 시 서버 콘솔에 상세 로그를 출력합니다.
        console.error("FATAL Error fetching rooms by hotel:", err.message, err.stack);
        return res.status(500).json(errorResponse('호텔 객실 조회 실패', 500, err.message));
    }
};

// 특정 객실 조회
export const getRoomById = async (req, res) => {
    try {
        const room = await RoomService.findById(req.params.id);
        if (!room) return res.status(404).json(errorResponse('객실 없음', 404));
        return res.status(200).json(successResponse(room, '객실 조회 완료'));
    } catch (err) {
        console.error("Error fetching room by ID:", err.message, err.stack);
        return res.status(500).json(errorResponse('객실 조회 실패', 500, err.message));
    }
};

// 객실 수정
export const updateRoom = async (req, res) => {
    try {
        const updated = await RoomService.update(req.params.id, req.body);
        return res.status(200).json(successResponse(updated, '객실 수정 완료'));
    } catch (err) {
        console.error("Error updating room:", err.message, err.stack);
        return res.status(500).json(errorResponse('객실 수정 실패', 500, err.message));
    }
};

// 객실 삭제
export const deleteRoom = async (req, res) => {
    try {
        await RoomService.delete(req.params.id);
        return res.status(200).json(successResponse(null, '객실 삭제 완료'));
    } catch (err) {
        console.error("Error deleting room:", err.message, err.stack);
        return res.status(500).json(errorResponse('객실 삭제 실패', 500, err.message));
    }
};