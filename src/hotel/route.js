import express from 'express';
// Controller 파일의 경로가 올바른지 확인하세요.
import * as hotelController from './controller.js';

const router = express.Router();

// 1. 모든 호텔 조회 (프런트엔드에서 'getHotels'가 호출하는 경로)
// 이 함수(hotelController.getHotels)는 (req, res, next)를 인자로 받는 함수여야 합니다.
router.get('/', hotelController.getHotels); // <-- 13번째 줄이 이 줄일 가능성이 높습니다.

// 2. 특정 호텔 상세 조회
router.get('/:hotelId', hotelController.getHotelDetail);

// 3. 특정 호텔의 객실 목록 조회
router.get('/:hotelId/rooms', hotelController.getHotelRooms);


export default router;