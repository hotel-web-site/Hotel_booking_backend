const Room = require("../models/Room");

async function createRoom(req, res) {
    try {
        const room = await Room.create(req.body);
        res.status(201).json({ message: "객실 생성 완료", room });
    } catch (error) {
        res.status(500).json({ message: "객실 생성 실패", error: error.message });
    }
}

async function getRooms(req, res) {
    try {
        const rooms = await Room.find();
        res.status(200).json(rooms);
    } catch (error) {
        res.status(500).json({ message: "객실 조회 실패", error: error.message });
    }
}

async function getRoom(req, res) {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) return res.status(404).json({ message: "객실 없음" });
        res.status(200).json(room);
    } catch (error) {
        res.status(500).json({ message: "객실 조회 실패", error: error.message });
    }
}

async function updateRoom(req, res) {
    try {
        const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!room) return res.status(404).json({ message: "객실 없음" });
        res.status(200).json({ message: "객실 업데이트 완료", room });
    } catch (error) {
        res.status(500).json({ message: "객실 업데이트 실패", error: error.message });
    }
}

async function deleteRoom(req, res) {
    try {
        const room = await Room.findByIdAndDelete(req.params.id);
        if (!room) return res.status(404).json({ message: "객실 없음" });
        res.status(200).json({ message: "객실 삭제 완료" });
    } catch (error) {
        res.status(500).json({ message: "객실 삭제 실패", error: error.message });
    }
}

module.exports = { createRoom, getRooms, getRoom, updateRoom, deleteRoom };
