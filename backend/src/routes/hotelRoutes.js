const express = require("express");
const router = express.Router();
const hotelController = require("../controllers/hotelController");

// 호텔 생성
router.post("/", hotelController.createHotel);

// 호텔 전체 조회
router.get("/", hotelController.getHotels);

// 특정 호텔 조회
router.get("/:id", hotelController.getHotel);

// 호텔 수정
router.patch("/:id", hotelController.updateHotel);

// 호텔 삭제
router.delete("/:id", hotelController.deleteHotel);

module.exports = router;
