// src/tests/testPayment.js
// -------------------------
// 백엔드 결제 테스트 스크립트 (Room + Hotel 문서를 DB에 생성)
// Booking → 결제 준비 → 결제 승인 → 결제 취소 전체 테스트
// CommonJS 방식, populate 없이 price 접근 가능
// Toss API 호출 대신 mock 처리
// -------------------------

// 1. 환경변수 로드
require('dotenv').config({ path: '../../.env' });

const mongoose = require("mongoose");
const connectDB = require("../config/db.js");
const { Booking } = require("../booking/model.js");

// 2. 테스트용 임의 ObjectId 생성
const testUserId = new mongoose.Types.ObjectId();
const testHotelId = new mongoose.Types.ObjectId();
const testRoomId = new mongoose.Types.ObjectId();

// 3. Room 임시 모델 등록
const roomSchema = new mongoose.Schema({
    name: String,
    type: String,
    price: Number
});
const Room = mongoose.model('Room', roomSchema);

// 4. Hotel 임시 모델 등록
const hotelSchema = new mongoose.Schema({
    name: String,
    address: String,
    rating: Number
});
const Hotel = mongoose.model('Hotel', hotelSchema);

// 5. PaymentService mock 정의
const PaymentService = {
    preparePayment: async ({ bookingId, userId }) => {
        const booking = await Booking.findById(bookingId);
        if (!booking) throw new Error("예약을 찾을 수 없습니다.");

        const amount = 100000; // mock 금액
        const orderId = `ORDER_${bookingId}_${Date.now()}`;

        // 결제 정보 mock DB 저장
        const payment = {
            user: userId,
            booking: bookingId,
            orderId,
            amount,
            status: "pending",
        };

        return { payment, amount, orderId };
    },

    confirmPayment: async ({ orderId, paymentKey, amount }) => {
        // 실제 Toss API 호출 없이 mock 처리
        return {
            orderId,
            paymentKey,
            amount,
            status: "paid",
            updatedAt: new Date()
        };
    },

    cancelPayment: async ({ bookingId }) => {
        // 실제 Toss API 호출 없이 mock 처리
        return {
            bookingId,
            status: "cancelled",
            updatedAt: new Date()
        };
    }
};

// 6. Booking 생성 함수
async function createTestBooking() {
    // Room & Hotel 문서 DB에 생성
    await Room.create({
        _id: testRoomId,
        name: "Test Room",
        type: "Single",
        price: 100000
    });

    await Hotel.create({
        _id: testHotelId,
        name: "Test Hotel",
        address: "Test Address",
        rating: 5
    });

    // Booking 생성
    const booking = await Booking.create({
        user: testUserId,
        hotel: testHotelId,
        room: testRoomId,  // ObjectId로 참조
        checkIn: new Date(),
        checkOut: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2일 후
        status: "pending",
    });

    console.log("Booking 생성:", booking._id.toString());
    return booking;
}

// 7. 결제 테스트 전체 플로우
async function testPaymentFlow() {
    try {
        // DB 연결
        await connectDB();

        // Booking 생성
        const booking = await createTestBooking();

        // 결제 준비
        console.log("=== 결제 준비 ===");
        const prep = await PaymentService.preparePayment({
            bookingId: booking._id,
            userId: testUserId,
        });
        console.log("결제 준비 결과:", prep);

        // 결제 승인
        console.log("=== 결제 승인 ===");
        const paymentKey = "test_1234567890"; // mock PaymentKey
        const confirmed = await PaymentService.confirmPayment({
            orderId: prep.payment.orderId,
            paymentKey,
            amount: prep.payment.amount,
        });
        console.log("결제 승인 결과:", confirmed);

        // Booking 상태 업데이트 (mock)
        booking.status = "booked";
        await booking.save();
        console.log("Booking 상태:", booking.status);

        // 결제 취소 (환불 테스트)
        console.log("=== 결제 취소 (환불) ===");
        const canceled = await PaymentService.cancelPayment({
            bookingId: booking._id,
        });
        console.log("결제 취소 결과:", canceled);

        // Booking 상태 업데이트 (mock)
        booking.status = "cancelled";
        await booking.save();
        console.log("최종 Booking 상태:", booking.status);

    } catch (err) {
        console.error("테스트 에러:", err.message);
    } finally {
        // DB 연결 종료
        mongoose.connection.close();
    }
}

// 8. 테스트 실행
testPaymentFlow();
