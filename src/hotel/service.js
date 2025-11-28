import Hotel from './model.js';
import { Room } from '../room/model.js';
import Booking from '../booking/model.js';

/**
 * 사용자용 호텔 검색
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
    // 호텔 기본 쿼리
    const hotelQuery = {};
    if (name) hotelQuery.name = { $regex: name, $options: 'i' };
    if (city) hotelQuery.city = { $regex: city, $options: 'i' };

    let hotels = await Hotel.find(hotelQuery).lean();

    for (let hotel of hotels) {
        // 객실 기본 쿼리
        let roomQuery = { hotel: hotel._id, status: 'available' };
        if (type) roomQuery.type = type;
        if (capacity) roomQuery.capacity = { $gte: parseInt(capacity) };

        let rooms = await Room.find(roomQuery).lean();

        // 예약된 객실 제거
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

        hotel.rooms = rooms;
    }

    // 객실 없는 호텔 제거
    hotels = hotels.filter(h => h.rooms.length > 0);

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
