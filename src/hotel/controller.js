import * as hotelService from './service.js';
import { successResponse, errorResponse } from '../common/response.js';

// 전체 호텔 검색 (사용자용)
export const getAllHotels = async (req, res) => {
    try {
        const hotels = await hotelService.searchHotels(req.query);
        return res.json(successResponse(hotels, '호텔 검색 완료'));
    } catch (err) {
        return res.status(500).json(errorResponse(err.message, 500));
    }
};

// 특정 호텔 조회 (사용자용)
export const getHotelById = async (req, res) => {
    try {
        const { hotelId } = req.params;
        const { checkIn, checkOut } = req.query;

        const hotel = await hotelService.getHotelWithRooms(hotelId, checkIn, checkOut);
        return res.json(successResponse(hotel, '호텔 조회 완료'));
    } catch (err) {
        return res.status(404).json(errorResponse(err.message, 404));
    }
};
