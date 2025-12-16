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

// 호텔별 객실 조회 (공개)
router.get("/:hotelId", getRoomsByHotel);

// 특정 객실 조회 (공개)
router.get("/:id", getRoomById);

// 객실 생성 (관리자/호스트)
router.post("/", verifyToken, createRoom);

// 호텔별 객실 생성
router.post("/hotel/:hotelId", verifyToken, (req, res) => {
    req.body.hotel = req.params.hotelId;
    return createRoom(req, res);
});

// 객실 수정 (호스트)
router.patch("/:id", verifyToken, updateRoom);

// 객실 삭제 (호스트)
router.delete("/:id", verifyToken, deleteRoom);

export default router;
