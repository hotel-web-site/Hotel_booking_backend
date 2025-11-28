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

// 객실 생성 (기존)
router.post("/", verifyToken, createRoom);

// ⭐ 호텔별 객실 생성 추가
router.post("/hotel/:hotelId", verifyToken, (req, res) => {
    req.body.hotel = req.params.hotelId; // URL의 hotelId를 body에 넣어줌
    return createRoom(req, res);
});

// 객실 수정
router.patch("/:id", verifyToken, updateRoom);

// 객실 삭제
router.delete("/:id", verifyToken, deleteRoom);

export default router;
