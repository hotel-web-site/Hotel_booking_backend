import Hotel from './model.js';
import { Room } from '../room/model.js';
import Booking from '../booking/model.js';

/**
 * 사용자용 호텔 검색
 * 객실이 없어도 호텔은 반환
 */
export async function searchHotels({
    name,
    city,
    minPrice,
    maxPrice,
    type,
    capacity,
    checkIn,
    checkOut,
}) {
    // 1️⃣ 호텔 기본 쿼리 생성
    const hotelQuery = {};
    if (name) hotelQuery.name = { $regex: name, $options: 'i' };
    if (city) hotelQuery.city = { $regex: city, $options: 'i' };

    let hotels = await Hotel.find(hotelQuery).lean();

    // 2️⃣ 호텔별 객실 조회 및 필터링
    for (let hotel of hotels) {
        // 객실 기본 쿼리
        let roomQuery = { hotel: hotel._id, status: 'available' };
        if (type) roomQuery.type = type;
        if (capacity) roomQuery.capacity = { $gte: parseInt(capacity) };

        let rooms = await Room.find(roomQuery).lean();

        // 예약된 객실 제외
        if (checkIn && checkOut) {
            const ci = new Date(checkIn);
            const co = new Date(checkOut);

            const bookedRoomIds = (
                await Booking.find({
                    room: { $in: rooms.map(r => r._id) },
                    status: { $ne: 'cancelled' },
                    checkIn: { $lt: co },
                    checkOut: { $gt: ci },
                }).select('room')
            ).map(b => b.room.toString());

            rooms = rooms.filter(r => !bookedRoomIds.includes(r._id.toString()));
        }

        // 가격 필터
        if (minPrice || maxPrice) {
            rooms = rooms.filter(r => {
                if (minPrice && r.price < parseFloat(minPrice)) return false;
                if (maxPrice && r.price > parseFloat(maxPrice)) return false;
                return true;
            });
        }

        // 호텔에 rooms 배열 그대로 할당
        hotel.rooms = rooms;
    }

    // 🔹 객실 없는 호텔도 반환
    return hotels;
}

/**
 * 특정 호텔 조회
 */
export async function getHotelWithRooms(hotelId, checkIn, checkOut) {
    const hotel = await Hotel.findById(hotelId).lean();
    if (!hotel) throw new Error('호텔을 찾을 수 없습니다.');

    let rooms = await Room.find({ hotel: hotel._id, status: 'available' }).lean();

    if (checkIn && checkOut) {
        const ci = new Date(checkIn);
        const co = new Date(checkOut);

        const bookedRoomIds = (
            await Booking.find({
                room: { $in: rooms.map(r => r._id) },
                status: { $ne: 'cancelled' },
                checkIn: { $lt: co },
                checkOut: { $gt: ci },
            }).select('room')
        ).map(b => b.room.toString());

        rooms = rooms.filter(r => !bookedRoomIds.includes(r._id.toString()));
    }

    hotel.rooms = rooms;
    return hotel;
}
