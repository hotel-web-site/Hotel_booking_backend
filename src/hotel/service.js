import mongoose from "mongoose";
import { Hotel } from "./model.js";
import { RoomService } from "../room/service.js";
import Review from "../review/model.js";

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
        err.statusCode = 400;
        throw err;
    }

    const hotel = await Hotel.findById(mongoose.Types.ObjectId(id));
    if (!hotel) {
        const err = new Error("HOTEL_NOT_FOUND");
        err.statusCode = 404;
        throw err;
    }

    const rooms = await RoomService.getRoomsByHotel(id);

    const reviews = await Review.find({ hotel: mongoose.Types.ObjectId(id) })
        .populate("user", "name")
        .sort({ createdAt: -1 });

    return { hotel, rooms, reviews };
};

// 호텔별 룸 목록
export const listRoomsByHotel = async (id) => {
    return RoomService.getRoomsByHotel(id);
};

// 추천 호텔
export const getFeaturedHotels = async (limit = 10) => {
    return Hotel.find({ status: "approved", featured: true })
        .sort({ ratingAverage: -1, ratingCount: -1 })
        .limit(limit)
        .lean();
};
