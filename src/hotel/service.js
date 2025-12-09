// src/hotel/service.js (수정된 코드)

import mongoose from "mongoose";
import { Hotel } from "./model.js";
import { RoomService } from "../room/service.js"; // RoomService import
import Review from "../review/model.js"; // Review model import (목록 조회에서 사용되지 않으므로 제거 가능하지만, 여기서는 유지)

// 호텔 목록 조회
export const listHotels = async ({ city, guests, type, freebies }) => {
    const query = { status: "approved" };

    if (city && city !== "undefined" && city !== "") {
        query.city = { $regex: city, $options: "i" };
    }

    if (type && type !== "undefined" && type !== "") {
        query.type = type;
    }

    if (freebies) {
        const freebiesArray =
            typeof freebies === "string" ? freebies.split(",") : freebies;

        freebiesArray.forEach((freebie) => {
            const f = freebie.trim();
            if (f === "breakfast") query["freebies.breakfast"] = true;
            if (f === "airportPickup") query["freebies.airportPickup"] = true;
            if (f === "wifi") query["freebies.wifi"] = true;
            if (f === "customerSupport") query["freebies.customerSupport"] = true;
        });
    }

    return await Hotel.find(query).sort({ createdAt: -1 });
};

// 호텔 상세 조회
export const getHotelDetail = async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        const err = new Error("INVALID_HOTEL_ID");
        err.statusCode = 400; // 400: 클라이언트 요청 오류
        throw err;
    }

    // ✅ 수정: new 키워드 사용 (이전 로그에서 발생한 오류 방지)
    const hotel = await Hotel.findById(new mongoose.Types.ObjectId(id));

    if (!hotel) {
        const err = new Error("HOTEL_NOT_FOUND");
        err.statusCode = 404; // 404: 리소스를 찾을 수 없음
        throw err;
    }

    // 🚨 중요 수정: 컨트롤러가 Room과 Review를 병렬로 가져오므로, 
    // 서비스는 순수한 Hotel 객체만 반환하도록 단순화합니다.
    return hotel;

    // (참고: 기존에 아래 코드를 서비스에서 처리했지만, 프론트엔드가 병렬로 요청하므로 제거)
    // const rooms = await RoomService.findByHotel(id); 
    // const reviews = await Review.find({ hotel: new mongoose.Types.ObjectId(id) })...;
    // return { hotel, rooms, reviews }; 
};

// 호텔별 룸 목록
export const listRoomsByHotel = async (id) => {
    // ✅ 수정: RoomService.getRoomsByHotel을 RoomService.findByHotel로 변경
    return RoomService.findByHotel(id);
};

// 추천 호텔
export const getFeaturedHotels = async (limit = 10) => {
    return Hotel.find({ status: "approved", featured: true })
        .sort({ ratingAverage: -1, ratingCount: -1 })
        .limit(limit)
        .lean();
};