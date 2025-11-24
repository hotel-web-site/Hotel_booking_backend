const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");

// 방 생성
router.post("/", roomController.createRoom);

// 방 전체 조회
router.get("/", roomController.getRooms);

// 특정 방 조회
router.get("/:id", roomController.getRoom);

// 방 수정
router.patch("/:id", roomController.updateRoom);

// 방 삭제
router.delete("/:id", roomController.deleteRoom);

module.exports = router;
