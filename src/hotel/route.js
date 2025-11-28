import { Router } from 'express';
import * as hotelController from './controller.js';

const router = Router();

// 단일 호텔 조회
router.get('/', hotelController.getAllHotels);

// 특정 호텔 조회
router.get('/:hotelId', hotelController.getHotelById);

export default router;
