// src/booking/route.js
// ----------------------------------------------------------
// Booking API 라우터
// 인증 필요 API는 verifyToken 적용
// ----------------------------------------------------------

import express from 'express';
import { verifyToken } from '../common/authMiddleware.js';
import {
    createBooking,
    getBookings,
    getBookingById,
    confirmBooking,
    cancelBooking,
    checkAvailability,
} from './controller.js';

const router = express.Router();

// 예약 생성
router.post('/', verifyToken, createBooking);

// 내 예약 전체 조회
router.get('/', verifyToken, getBookings);

// 특정 예약 조회
router.get('/:id', verifyToken, getBookingById);

// 결제 완료 후 예약 확정
router.post('/:id/confirm', verifyToken, confirmBooking);

// 예약 취소
router.delete('/:id', verifyToken, cancelBooking);

// 객실 가용 여부 체크 (비로그인 가능)
router.get('/availability/:roomId', checkAvailability);

export default router;
