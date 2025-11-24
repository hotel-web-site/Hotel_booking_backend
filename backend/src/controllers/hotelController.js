const Hotel = require("../models/Hotel");
const Room = require("../models/Room");

async function createHotel(req, res) {
    try {
        const hotel = await Hotel.create(req.body);
        res.status(201).json({ message: "호텔 생성 완료", hotel });
    } catch (error) {
        res.status(500).json({ message: "호텔 생성 실패", error: error.message });
    }
}

async function getHotels(req, res) {
    try {
        const hotels = await Hotel.find().populate("rooms");
        res.status(200).json(hotels);
    } catch (error) {
        res.status(500).json({ message: "호텔 조회 실패", error: error.message });
    }
}

async function getHotel(req, res) {
    try {
        const hotel = await Hotel.findById(req.params.id).populate("rooms");
        if (!hotel) return res.status(404).json({ message: "호텔 없음" });
        res.status(200).json(hotel);
    } catch (error) {
        res.status(500).json({ message: "호텔 조회 실패", error: error.message });
    }
}

async function updateHotel(req, res) {
    try {
        const hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!hotel) return res.status(404).json({ message: "호텔 없음" });
        res.status(200).json({ message: "호텔 수정 완료", hotel });
    } catch (error) {
        res.status(500).json({ message: "호텔 수정 실패", error: error.message });
    }
}

async function deleteHotel(req, res) {
    try {
        const hotel = await Hotel.findByIdAndDelete(req.params.id);
        if (!hotel) return res.status(404).json({ message: "호텔 없음" });
        res.status(200).json({ message: "호텔 삭제 완료" });
    } catch (error) {
        res.status(500).json({ message: "호텔 삭제 실패", error: error.message });
    }
}

module.exports = { createHotel, getHotels, getHotel, updateHotel, deleteHotel };
