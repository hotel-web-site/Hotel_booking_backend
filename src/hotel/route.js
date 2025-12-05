import { Router } from "express";
import {
    listHotels,
    getHotelDetail,
    listRoomsByHotel,
    listRooms,
    getFeaturedHotels,
} from "./controller.js";

import { getReviewsByHotel } from "../review/controller.js"; // ✅ named import

const router = Router();

router.get("/", listHotels);
router.get("/featured", getFeaturedHotels);
router.get("/rooms", listRooms);
router.get("/:id/rooms", listRoomsByHotel);
router.get("/:id/reviews", getReviewsByHotel); // ✅ 함수 이름 맞춤
router.get("/:id", getHotelDetail);

export default router;
