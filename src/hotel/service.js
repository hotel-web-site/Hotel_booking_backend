import mongoose from "mongoose";
import { Hotel } from "./model.js";
import { RoomService } from "../room/service.js";

// 1. 호텔 목록 조회 (검색 조건 동기화 및 통계 추가)
export const listHotels = async ({ city, guests, type, freebies }) => {
    const query = { status: "approved" };

    // 도시 검색 (대소문자 무시 정규식)
    if (city && city !== "undefined" && city !== "") {
        query.city = { $regex: city, $options: "i" };
    }

    // 숙소 타입 필터링
    if (type && type !== "all" && type !== "undefined" && type !== "") {
        query.type = type;
    }

    // 편의시설 필터링
    if (freebies) {
        const freebiesArray = typeof freebies === "string" ? freebies.split(",") : freebies;
        freebiesArray.forEach((freebie) => {
            const f = freebie.trim();
            if (f === "breakfast") query["freebies.breakfast"] = true;
            if (f === "airportPickup") query["freebies.airportPickup"] = true;
            if (f === "wifi") query["freebies.wifi"] = true;
            if (f === "customerSupport") query["freebies.customerSupport"] = true;
        });
    }

    /**
     * [버그 수정 핵심] 
     * 리스트(hotels)와 개수(totalCount)를 동시에 조회합니다.
     * 동일한 query 객체를 사용하여 '숫자는 있는데 리스트는 없는' 현상을 방지합니다.
     */
    const [hotels, totalCount] = await Promise.all([
        Hotel.find(query).sort({ createdAt: -1 }),
        Hotel.countDocuments(query)
    ]);

    /**
     * [추가 기능] 타입별 통계 (호텔/모텔/리조트 개수)
     * 이미지 상단 탭의 숫자를 정확히 표기하기 위해 집계 쿼리를 실행합니다.
     */
    const statsResult = await Hotel.aggregate([
        { $match: { status: "approved", city: query.city || { $exists: true } } },
        { $group: { _id: "$type", count: { $sum: 1 } } }
    ]);

    // 배열 형태의 통계를 객체로 변환 { hotel: 237, motel: 51, resort: 72 }
    const stats = statsResult.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
    }, {});

    return { hotels, totalCount, stats };
};

// 2. 호텔 상세 조회
export const getHotelDetail = async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        const err = new Error("유효하지 않은 호텔 ID입니다.");
        err.statusCode = 400;
        throw err;
    }

    const hotel = await Hotel.findById(new mongoose.Types.ObjectId(id));

    if (!hotel) {
        const err = new Error("해당 숙소를 찾을 수 없습니다.");
        err.statusCode = 404;
        throw err;
    }

    return hotel;
};

// 3. 호텔별 룸 목록 조회
export const listRoomsByHotel = async (id) => {
    return RoomService.findByHotel(id);
};

// 4. 추천 호텔 조회
export const getFeaturedHotels = async (limit = 10) => {
    return Hotel.find({ status: "approved", featured: true })
        .sort({ ratingAverage: -1, ratingCount: -1 })
        .limit(limit)
        .lean();
};