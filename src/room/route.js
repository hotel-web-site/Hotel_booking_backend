// src/room/route.js
import { Router } from "express";
import { verifyToken } from "../common/authMiddleware.js";
import {
    createRoom,
    getRoomsByHotel,
    getRoomById,
    updateRoom,
    deleteRoom,
} from "./controller.js";

const router = Router();

// 호텔별 객실 조회
router.get("/hotel/:hotelId", verifyToken, getRoomsByHotel);

// 특정 객실 조회
router.get("/:id", verifyToken, getRoomById);

// 객실 생성
router.post("/", verifyToken, createRoom);

// 객실 수정
router.patch("/:id", verifyToken, updateRoom);

// 객실 삭제
router.delete("/:id", verifyToken, deleteRoom);

export default router;
