import * as hotelService from './service.js';
import { successResponse, errorResponse } from '../common/response.js';

// 전체 호텔 검색 (사용자용) - 라우트의 hotelController.getHotels와 이름 통일
export const getHotels = async (req, res) => {
    try {
        const hotels = await hotelService.searchHotels(req.query);
        return res.json(successResponse(hotels, '호텔 검색 완료'));
    } catch (err) {
        return res.status(500).json(errorResponse(err.message, 500));
    }
};

// 특정 호텔 상세 조회 (사용자용) - 라우트의 hotelController.getHotelDetail과 이름 통일
export const getHotelDetail = async (req, res) => {
    try {
        const { hotelId } = req.params;
        const { checkIn, checkOut } = req.query;

        // 호텔 및 객실 정보 로딩
        const hotel = await hotelService.getHotelWithRooms(hotelId, checkIn, checkOut);

        // 데이터가 없으면 404 처리 (서비스에서 에러를 throw 했다고 가정)
        if (!hotel) {
            return res.status(404).json(errorResponse('해당 호텔을 찾을 수 없습니다.', 404));
        }

        return res.json(successResponse(hotel, '호텔 조회 완료'));
    } catch (err) {
        // 서비스에서 발생한 에러 처리 (일반적으로 404가 아닌 500으로 처리하는 것이 안전함)
        return res.status(500).json(errorResponse(err.message, 500));
    }
};

// 🌟 특정 호텔의 객실 목록 조회 (프런트엔드 hotelClient.js에서 요청하는 함수)
export const getHotelRooms = async (req, res) => {
    try {
        const { hotelId } = req.params;
        const { checkIn, checkOut } = req.query;

        // 서비스 계층에서 해당 호텔의 가용 객실 목록만 가져온다고 가정
        const rooms = await hotelService.getAvailableRooms(hotelId, checkIn, checkOut);

        return res.json(successResponse(rooms, '호텔 객실 목록 조회 완료'));
    } catch (err) {
        // 객실 목록 조회 실패 시 500 에러 처리
        return res.status(500).json(errorResponse(err.message, 500));
    }
};