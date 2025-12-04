// MongoDB 초기 데이터 삽입 스크립트
db = db.getSiblingDB("hotel-project");

// 기존 호텔 데이터 삭제
db.hotels.deleteMany({});

// 관리자 사용자 가져오기 (없으면 임시 사용자 생성)
let owner = db.users.findOne({ role: "admin" });
if (!owner) {
    owner = db.users.findOne();
}
const ownerId = owner ? owner._id : ObjectId();

db.hotels.insertMany([
    {
        name: "롯데호텔 서울",
        city: "서울",
        country: "대한민국", // ✅ 국가 필드 추가
        address: "서울특별시 중구 을지로 30",
        location: "서울특별시 중구",
        description: "서울 중심부 명동에 위치한 5성급 호텔",
        ratingAverage: 4.5,
        ratingCount: 120,
        basePrice: 250000,
        images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945"],
        amenities: ["무료 WiFi", "수영장", "피트니스", "레스토랑", "주차장"],
        owner: ownerId,
        status: "approved",
        tags: ["럭셔리", "비즈니스"],
    },
    {
        name: "해운대 그랜드 호텔",
        city: "부산",
        country: "대한민국", // ✅ 국가 필드 추가
        address: "부산광역시 해운대구 해운대해변로 296",
        location: "부산광역시 해운대구",
        description: "해운대 해변이 한눈에 보이는 오션뷰 호텔",
        ratingAverage: 4.3,
        ratingCount: 85,
        basePrice: 180000,
        images: ["https://images.unsplash.com/photo-1542314831-068cd1dbfeeb"],
        amenities: ["무료 WiFi", "오션뷰", "조식 포함", "주차장"],
        owner: ownerId,
        status: "approved",
        tags: ["오션뷰", "가족여행"],
    },
    {
        name: "제주 신라호텔",
        city: "제주",
        country: "대한민국", // ✅ 국가 필드 추가
        address: "제주특별자치도 서귀포시 중문관광로 72번길 75",
        location: "제주특별자치도 서귀포시",
        description: "제주 중문 리조트에 위치한 럭셔리 호텔",
        ratingAverage: 4.7,
        ratingCount: 200,
        basePrice: 320000,
        images: ["https://images.unsplash.com/photo-1551882547-ff40c63fe5fa"],
        amenities: ["무료 WiFi", "스파", "골프장", "해변 접근", "키즈클럽"],
        owner: ownerId,
        status: "approved",
        tags: ["럭셔리", "리조트", "신혼여행"],
    },
]);

print("✅ Hotels inserted:", db.hotels.countDocuments());

// 호텔 ID 가져오기
const hotels = db.hotels.find().toArray();
const hotel1 = hotels[0]._id; // 롯데호텔 서울
const hotel2 = hotels[1]._id; // 해운대 그랜드 호텔
const hotel3 = hotels[2]._id; // 제주 신라호텔

// ===== Rooms 데이터 삽입 =====
db.rooms.deleteMany({});

db.rooms.insertMany([
    // 롯데호텔 서울 객실
    {
        hotel: hotel1,
        name: "디럭스 더블룸",
        type: "더블",
        price: 250000,
        capacity: 2,
        inventory: 10,
        images: ["https://images.unsplash.com/photo-1611892440504-42a792e24d32"],
        amenities: ["킹 베드", "시티뷰", "무료 WiFi", "미니바", "욕조"],
        status: "active",
    },
    {
        hotel: hotel1,
        name: "이그제큐티브 스위트",
        type: "스위트",
        price: 450000,
        capacity: 4,
        inventory: 5,
        images: ["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b"],
        amenities: ["킹 베드", "거실", "시티뷰", "무료 WiFi", "욕조", "네스프레소"],
        status: "active",
    },
    {
        hotel: hotel1,
        name: "스탠다드 트윈룸",
        type: "트윈",
        price: 220000,
        capacity: 2,
        inventory: 15,
        images: ["https://images.unsplash.com/photo-1590490360182-c33d57733427"],
        amenities: ["트윈 베드", "무료 WiFi", "미니바", "샤워부스"],
        status: "active",
    },

    // 해운대 그랜드 호텔 객실
    {
        hotel: hotel2,
        name: "오션뷰 더블룸",
        type: "더블",
        price: 180000,
        capacity: 2,
        inventory: 12,
        images: ["https://images.unsplash.com/photo-1631049307264-da0ec9d70304"],
        amenities: ["킹 베드", "오션뷰", "발코니", "무료 WiFi", "욕조"],
        status: "active",
    },
    {
        hotel: hotel2,
        name: "패밀리 스위트",
        type: "스위트",
        price: 320000,
        capacity: 4,
        inventory: 8,
        images: ["https://images.unsplash.com/photo-1596394516093-501ba68a0ba6"],
        amenities: ["킹 베드", "소파베드", "오션뷰", "발코니", "주방", "세탁기"],
        status: "active",
    },
    {
        hotel: hotel2,
        name: "스탠다드 시티뷰",
        type: "더블",
        price: 150000,
        capacity: 2,
        inventory: 20,
        images: ["https://images.unsplash.com/photo-1595576508898-0ad5c879a061"],
        amenities: ["퀸 베드", "시티뷰", "무료 WiFi", "샤워부스"],
        status: "active",
    },

    // 제주 신라호텔 객실
    {
        hotel: hotel3,
        name: "프리미엄 오션뷰",
        type: "더블",
        price: 320000,
        capacity: 2,
        inventory: 15,
        images: ["https://images.unsplash.com/photo-1578683010236-d716f9a3f461"],
        amenities: [
            "킹 베드",
            "오션뷰",
            "발코니",
            "무료 WiFi",
            "욕조",
            "네스프레소",
        ],
        status: "active",
    },
    {
        hotel: hotel3,
        name: "로얄 스위트",
        type: "스위트",
        price: 650000,
        capacity: 4,
        inventory: 3,
        images: ["https://images.unsplash.com/photo-1615460549969-36fa19521a4f"],
        amenities: [
            "킹 베드",
            "거실",
            "오션뷰",
            "프라이빗 풀",
            "욕조",
            "네스프레소",
            "버틀러 서비스",
        ],
        status: "active",
    },
    {
        hotel: hotel3,
        name: "가든뷰 트윈룸",
        type: "트윈",
        price: 280000,
        capacity: 2,
        inventory: 18,
        images: ["https://images.unsplash.com/photo-1584132967334-10e028bd69f7"],
        amenities: ["트윈 베드", "가든뷰", "발코니", "무료 WiFi", "욕조"],
        status: "active",
    },
]);

print("✅ Rooms inserted:", db.rooms.countDocuments());

// 객실 ID 가져오기
const rooms = db.rooms.find().toArray();

// 사용자 가져오기 (리뷰 작성자)
const user = db.users.findOne() || { _id: ObjectId() };
const userId = user._id;

// ===== Reservations 데이터 삽입 (리뷰를 위한 완료된 예약) =====
db.reservations.deleteMany({});

const reservations = db.reservations.insertMany([
    {
        userId: userId,
        hotelId: hotel1,
        roomId: rooms[0]._id,
        checkIn: new Date("2024-11-01"),
        checkOut: new Date("2024-11-03"),
        guests: 2,
        totalPrice: 500000,
        status: "completed",
    },
    {
        userId: userId,
        hotelId: hotel1,
        roomId: rooms[1]._id,
        checkIn: new Date("2024-10-15"),
        checkOut: new Date("2024-10-17"),
        guests: 2,
        totalPrice: 900000,
        status: "completed",
    },
    {
        userId: userId,
        hotelId: hotel2,
        roomId: rooms[3]._id,
        checkIn: new Date("2024-11-10"),
        checkOut: new Date("2024-11-12"),
        guests: 2,
        totalPrice: 360000,
        status: "completed",
    },
    {
        userId: userId,
        hotelId: hotel2,
        roomId: rooms[4]._id,
        checkIn: new Date("2024-10-20"),
        checkOut: new Date("2024-10-22"),
        guests: 4,
        totalPrice: 640000,
        status: "completed",
    },
    {
        userId: userId,
        hotelId: hotel3,
        roomId: rooms[6]._id,
        checkIn: new Date("2024-11-15"),
        checkOut: new Date("2024-11-17"),
        guests: 2,
        totalPrice: 640000,
        status: "completed",
    },
    {
        userId: userId,
        hotelId: hotel3,
        roomId: rooms[8]._id,
        checkIn: new Date("2024-10-25"),
        checkOut: new Date("2024-10-27"),
        guests: 2,
        totalPrice: 560000,
        status: "completed",
    },
]);

print("✅ Reservations inserted:", db.reservations.countDocuments());

// 예약 ID 가져오기
const completedReservations = db.reservations
    .find({ status: "completed" })
    .toArray();

// ===== Reviews 데이터 삽입 =====
db.reviews.deleteMany({});

db.reviews.insertMany([
    {
        userId: userId,
        hotelId: hotel1,
        reservationId: completedReservations[0]._id,
        rating: 5,
        comment:
            "위치도 좋고 시설도 깨끗했어요. 직원분들도 친절하셨습니다. 다음에 또 이용하고 싶어요!",
        images: [],
    },
    {
        userId: userId,
        hotelId: hotel1,
        reservationId: completedReservations[1]._id,
        rating: 4,
        comment:
            "스위트룸이 정말 넓고 좋았습니다. 조식도 훌륭했어요. 단, 주차장이 협소한 것이 아쉬웠습니다.",
        images: [],
    },
    {
        userId: userId,
        hotelId: hotel2,
        reservationId: completedReservations[2]._id,
        rating: 5,
        comment:
            "오션뷰가 정말 환상적이었습니다! 해변 접근도 쉽고 가족 여행하기 좋았어요.",
        images: [],
    },
    {
        userId: userId,
        hotelId: hotel2,
        reservationId: completedReservations[3]._id,
        rating: 4,
        comment:
            "패밀리 스위트가 넓어서 아이들과 지내기 좋았습니다. 주방이 있어서 편리했어요.",
        images: [],
    },
    {
        userId: userId,
        hotelId: hotel3,
        reservationId: completedReservations[4]._id,
        rating: 5,
        comment:
            "제주 여행의 하이라이트였습니다. 리조트 시설이 최고였고, 오션뷰가 정말 아름다웠어요!",
        images: [],
    },
    {
        userId: userId,
        hotelId: hotel3,
        reservationId: completedReservations[5]._id,
        rating: 5,
        comment:
            "가든뷰도 예쁘고 조용해서 휴식하기 좋았습니다. 스파도 최고였어요. 강추!",
        images: [],
    },
]);

print("✅ Reviews inserted:", db.reviews.countDocuments());
print("🎉 Initial data setup completed!");
