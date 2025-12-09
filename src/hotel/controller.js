// src/hotel/controller.js (수정된 코드)

import * as hotelService from "./service.js";
import { RoomService } from "../room/service.js"; // RoomService import
import { successResponse, errorResponse } from "../common/response.js";
import * as roomService from "../room/service.js"; // 룸 조회에 사용되는 roomService가 있다면 import 해야 함 (listRooms 때문)
import { getReviewsByHotel } from "../review/controller.js"; // 리뷰는 별도 요청/컨트롤러 사용 가정

// 호텔 목록 조회
export const listHotels = async (req, res) => {
    try {
        const { city, guests, type, freebies } = req.query;
        const data = await hotelService.listHotels({ city, guests, type, freebies });
        return res.status(200).json(successResponse(data, "HOTEL_LIST", 200));
    } catch (err) {
        return res
            .status(err.statusCode || 400)
            .json(errorResponse(err.message, err.statusCode || 400));
    }
};

// 호텔 상세 조회
export const getHotelDetail = async (req, res) => {
    try {
        // 🚨 수정: 서비스는 호텔 객체만 반환하고, 프론트엔드에서 Room/Review를 병렬로 가져오므로, 
        // 컨트롤러는 순수 호텔 객체만 반환하도록 로직을 단순화합니다.
        const data = await hotelService.getHotelDetail(req.params.id);

        // 프론트엔드가 { hotel: hotelData } 형태를 기대할 경우, 서비스에서 바로 호텔 객체를 반환했다고 가정하고 data를 전달합니다.
        // 프론트엔드에서는 hotelRes.data를 hotel 객체로 바로 사용합니다.
        return res.status(200).json(successResponse(data, "HOTEL_DETAIL", 200));
    } catch (err) {
        // 서비스 계층에서 400/404 에러를 던질 것으로 가정하고 처리
        return res
            .status(err.statusCode || 404)
            .json(errorResponse(err.message, err.statusCode || 404));
    }
};

// 호텔별 룸 조회
export const listRoomsByHotel = async (req, res) => {
    try {
        // ✅ 수정: RoomService.getRoomsByHotel을 RoomService.findByHotel로 변경
        const data = await RoomService.findByHotel(req.params.id);
        return res.status(200).json(successResponse(data, "ROOMS_BY_HOTEL", 200));
    } catch (err) {
        return res
            .status(err.statusCode || 400)
            .json(errorResponse(err.message, err.statusCode || 400));
    }
};

// 특정 조건으로 룸 조회
export const listRooms = async (req, res) => {
    try {
        const { hotelId, guests, checkIn, checkOut } = req.query;
        // 🚨 주의: roomService가 정의되었다고 가정 (import * as roomService from "../room/service.js"; 필요)
        const data = await roomService.getAvailableRooms({
            hotelId,
            guests,
            checkIn,
            checkOut,
        });
        return res.status(200).json(successResponse(data, "ROOM_LIST", 200));
    } catch (err) {
        return res
            .status(err.statusCode || 400)
            .json(errorResponse(err.message, err.statusCode || 400));
    }
};

// 추천 호텔
export const getFeaturedHotels = async (req, res) => {
    try {
        const { limit } = req.query;
        const data = await hotelService.getFeaturedHotels(limit ? Number(limit) : 10);
        return res.status(200).json(successResponse(data, "FEATURED_HOTELS", 200));
    } catch (err) {
        return res
            .status(err.statusCode || 400)
            .json(errorResponse(err.message, err.statusCode || 400));
    }
};