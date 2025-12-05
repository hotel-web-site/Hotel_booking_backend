import * as hotelService from "./service.js";
import * as roomService from "../room/service.js";
import { successResponse, errorResponse } from "../common/response.js";

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
        const data = await hotelService.getHotelDetail(req.params.id);
        return res.status(200).json(successResponse(data, "HOTEL_DETAIL", 200));
    } catch (err) {
        return res
            .status(err.statusCode || 404)
            .json(errorResponse(err.message, err.statusCode || 404));
    }
};

// 호텔별 룸 조회
export const listRoomsByHotel = async (req, res) => {
    try {
        const data = await roomService.getRoomsByHotel(req.params.id);
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
