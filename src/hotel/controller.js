import * as hotelService from './service.js';
import { successResponse, errorResponse } from '../common/response.js';

// ------------------------------------------------------------------------
// 1. 전체 호텔 검색 및 필터링 (사용자용)
// 라우트: GET /api/hotels (혹은 /api/hotels/search)
// ------------------------------------------------------------------------
export const getAllHotels = async (req, res) => {
    try {
        // req.query를 서비스 계층으로 전달하여 검색 및 필터링 수행
        const hotels = await hotelService.searchHotels(req.query);

        if (!hotels || hotels.length === 0) {
            return res.status(200).json(successResponse([], '검색 조건에 맞는 호텔이 없습니다.'));
        }

        return res.json(successResponse(hotels, '호텔 검색 완료'));
    } catch (err) {
        console.error("호텔 검색 처리 중 에러:", err.message);
        return res.status(500).json(errorResponse('호텔 검색 처리 중 서버 오류가 발생했습니다.', 500));
    }
};

// ------------------------------------------------------------------------
// 2. 특정 호텔 상세 조회 (가용 객실 포함)
// 라우트: GET /api/hotels/:hotelId?checkIn=...&checkOut=...
// ------------------------------------------------------------------------
export const getHotelById = async (req, res) => {
    try {
        const { hotelId } = req.params;
        const { checkIn, checkOut } = req.query;

        // 서비스 계층 함수 호출: 호텔 정보와 가용 객실 목록을 가져옴
        const hotel = await hotelService.getHotelWithRooms(hotelId, checkIn, checkOut);

        if (!hotel) {
            // 서비스에서 '호텔을 찾을 수 없습니다.' 오류를 throw 했을 경우 처리
            return res.status(404).json(errorResponse('요청하신 호텔을 찾을 수 없습니다.', 404));
        }

        return res.json(successResponse(hotel, '호텔 조회 완료'));
    } catch (err) {
        console.error("호텔 상세 조회 중 에러:", err.message);

        // 서비스에서 발생시킨 특정 오류 메시지를 404로 처리 (예외 처리 구체화)
        if (err.message === '호텔을 찾을 수 없습니다.') {
            return res.status(404).json(errorResponse(err.message, 404));
        }

        return res.status(500).json(errorResponse('호텔 상세 조회 처리 중 서버 오류가 발생했습니다.', 500));
    }
};