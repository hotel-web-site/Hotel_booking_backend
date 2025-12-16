import * as hotelService from "./service.js";
import { RoomService } from "../room/service.js";
import { successResponse, errorResponse } from "../common/response.js";
import * as roomService from "../room/service.js";

// 1. 호텔 목록 조회 (버그 수정 및 응답 구조 강화)
export const listHotels = async (req, res) => {
    try {
        const { city, guests, type, freebies } = req.query;
        // 서비스로부터 리스트, 전체 개수, 타입별 통계를 포함한 객체를 받음
        const result = await hotelService.listHotels({ city, guests, type, freebies });

        // 이미지의 "총 3개 중 0개 표시" 문제를 해결하기 위해 데이터를 구조화
        const responseData = {
            list: result.hotels,        // 실제 숙소 배열
            total: result.totalCount,   // "총 X개" 표시용 숫자
            typeStats: result.stats     // 상단 탭(호텔/모텔/리조트) 숫자용
        };

        return res.status(200).json(successResponse(responseData, "HOTEL_LIST_SUCCESS", 200));
    } catch (err) {
        return res
            .status(err.statusCode || 400)
            .json(errorResponse(err.message, err.statusCode || 400));
    }
};

// 2. 호텔 상세 조회
export const getHotelDetail = async (req, res) => {
    try {
        const data = await hotelService.getHotelDetail(req.params.id);
        return res.status(200).json(successResponse(data, "HOTEL_DETAIL_SUCCESS", 200));
    } catch (err) {
        return res
            .status(err.statusCode || 404)
            .json(errorResponse(err.message, err.statusCode || 404));
    }
};

// 3. 호텔별 룸 조회
export const listRoomsByHotel = async (req, res) => {
    try {
        const data = await RoomService.findByHotel(req.params.id);
        return res.status(200).json(successResponse(data, "ROOMS_BY_HOTEL_SUCCESS", 200));
    } catch (err) {
        return res
            .status(err.statusCode || 400)
            .json(errorResponse(err.message, err.statusCode || 400));
    }
};

// 4. 특정 조건으로 룸 조회 (예약 가능 여부 등)
export const listRooms = async (req, res) => {
    try {
        const { hotelId, guests, checkIn, checkOut } = req.query;
        const data = await roomService.getAvailableRooms({
            hotelId,
            guests,
            checkIn,
            checkOut,
        });
        return res.status(200).json(successResponse(data, "ROOM_LIST_SUCCESS", 200));
    } catch (err) {
        return res
            .status(err.statusCode || 400)
            .json(errorResponse(err.message, err.statusCode || 400));
    }
};

// 5. 추천 호텔 조회
export const getFeaturedHotels = async (req, res) => {
    try {
        const { limit } = req.query;
        const data = await hotelService.getFeaturedHotels(limit ? Number(limit) : 10);
        return res.status(200).json(successResponse(data, "FEATURED_HOTELS_SUCCESS", 200));
    } catch (err) {
        return res
            .status(err.statusCode || 400)
            .json(errorResponse(err.message, err.statusCode || 400));
    }
};