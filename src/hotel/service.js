import Hotel from './model.js';
import { Room } from '../room/model.js'; // Room 모델 필요 (lookup에서 from: 'rooms'와 이름 맞춰야 함)
import Booking from '../booking/model.js';

// --- Helper Function ---
// 예약된 객실 ID 목록을 조회하는 함수 (재사용)
async function getBookedRoomIds(checkIn, checkOut) {
    if (!checkIn || !checkOut) return [];

    const ci = new Date(checkIn);
    const co = new Date(checkOut);

    // 겹치는 예약이 있는 객실 ID만 조회 (취소되지 않은 예약)
    const bookedRoomIds = await Booking.find({
        status: { $ne: 'cancelled' },
        checkIn: { $lt: co },
        checkOut: { $gt: ci },
    }).distinct('room'); // 중복 객실 ID 제거 및 ID만 추출

    // MongoDB의 ObjectId를 문자열로 변환하여 배열로 반환
    return bookedRoomIds.map(id => id.toString());
}


/**
 * 사용자용 최적화된 호텔 검색 (Aggregation Pipeline 사용)
 * 쿼리 파라미터: city, minPrice, maxPrice, capacity, checkIn, checkOut, type, amenities, rating, sortBy
 */
export async function searchHotels({
    city, minPrice, maxPrice, capacity, checkIn, checkOut, type, amenities, rating, sortBy,
}) {
    // 1. 예약된 객실 ID 목록을 미리 조회
    const bookedRoomIds = await getBookedRoomIds(checkIn, checkOut); // 

    // 2. Aggregation Pipeline 구성
    const pipeline = [];

    // --- 2-1. 호텔 레벨 초기 필터 ($match) ---
    const initialHotelMatch = {};
    if (city) initialHotelMatch.city = { $regex: city, $options: 'i' };
    if (amenities) initialHotelMatch.amenities = { $all: Array.isArray(amenities) ? amenities : [amenities] };
    if (rating) initialHotelMatch.rating = { $gte: Number(rating) };

    if (Object.keys(initialHotelMatch).length > 0) {
        pipeline.push({ $match: initialHotelMatch });
    }

    // --- 2-2. 객실 정보 조인 ($lookup) ---
    // 호텔 문서에 해당 호텔의 모든 객실 정보를 'availableRooms' 배열로 추가
    pipeline.push({
        $lookup: {
            from: 'rooms', // MongoDB 컬렉션 이름 (Room 모델의 복수형)
            localField: '_id',
            foreignField: 'hotel',
            as: 'availableRooms'
        }
    });

    // --- 2-3. 객실 레벨 필터링 ($set + $filter) ---
    pipeline.push({
        $set: {
            availableRooms: {
                $filter: {
                    input: '$availableRooms',
                    as: 'room',
                    cond: {
                        $and: [
                            // 1) 예약된 객실 제외 (가용성 체크)
                            { $not: { $in: ['$$room._id', bookedRoomIds] } },
                            // 2) 객실 타입 필터
                            ...(type ? [{ $eq: ['$$room.type', type] }] : []),
                            // 3) 수용 인원 필터
                            ...(capacity ? [{ $gte: ['$$room.capacity', Number(capacity)] }] : []),
                            // 4) 객실 가격 필터
                            ...(minPrice ? [{ $gte: ['$$room.price', Number(minPrice)] }] : []),
                            ...(maxPrice ? [{ $lte: ['$$room.price', Number(maxPrice)] }] : []),
                        ]
                    }
                }
            }
        }
    });

    // --- 2-4. 예약 가능한 객실이 0개인 호텔 제외 ($match) ---
    // 필터링 후에도 객실이 남아있는 호텔만 최종 결과에 포함
    pipeline.push({ $match: { 'availableRooms.0': { $exists: true } } });

    // --- 2-5. UI 표시를 위한 최저가 계산 ($set) ---
    // 호텔 검색 화면의 'starting from' 가격을 제공
    pipeline.push({
        $set: {
            cheapestPrice: { $min: '$availableRooms.price' }
        }
    });

    // --- 2-6. 최종 정렬 ($sort) ---
    let sortOption = {};
    switch (sortBy) {
        case 'priceAsc': sortOption = { cheapestPrice: 1 }; break;
        case 'priceDesc': sortOption = { cheapestPrice: -1 }; break;
        case 'ratingDesc': sortOption = { rating: -1 }; break;
        case 'recommended':
        default: sortOption = { isRecommended: -1, rating: -1 }; break;
    }
    pipeline.push({ $sort: sortOption });

    // 3. 쿼리 실행
    const finalHotels = await Hotel.aggregate(pipeline);

    return finalHotels;
}

/**
 * 특정 호텔 조회 (가용 객실 포함)
 */
export async function getHotelWithRooms(hotelId, checkIn, checkOut) {
    const hotel = await Hotel.findById(hotelId).lean();
    if (!hotel) throw new Error('호텔을 찾을 수 없습니다.');

    let rooms = await Room.find({ hotel: hotel._id, status: 'available' }).lean();

    // 예약된 객실 ID 목록 조회
    const bookedRoomIds = await getBookedRoomIds(checkIn, checkOut);

    // 가용성 필터링
    rooms = rooms.filter(r => !bookedRoomIds.includes(r._id.toString()));

    hotel.rooms = rooms;
    return hotel;
}