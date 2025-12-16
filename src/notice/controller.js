import { Notice } from "./model.js";
import { successResponse, errorResponse } from "../common/response.js";

// [사용자/관리자] 목록 조회 (고정글 우선 -> 최신순 정렬)
export const getNotices = async (req, res) => {
    try {
        const notices = await Notice.find().sort({ isPinned: -1, createdAt: -1 });
        return res.status(200).json(successResponse(notices, "NOTICES_FETCHED", 200));
    } catch (err) {
        return res.status(500).json(errorResponse(err.message, 500));
    }
};

// [사용자/관리자] 상세 조회 (조회수 1 증가)
export const getNoticeById = async (req, res) => {
    try {
        const notice = await Notice.findByIdAndUpdate(
            req.params.id,
            { $inc: { views: 1 } },
            { new: true }
        );
        if (!notice) return res.status(404).json(errorResponse("NOTICE_NOT_FOUND", 404));
        return res.status(200).json(successResponse(notice, "NOTICE_FETCHED", 200));
    } catch (err) {
        return res.status(500).json(errorResponse(err.message, 500));
    }
};

// [관리자 전용] 공지 작성
export const createNotice = async (req, res) => {
    try {
        const notice = await Notice.create(req.body);
        return res.status(201).json(successResponse(notice, "NOTICE_CREATED", 201));
    } catch (err) {
        return res.status(400).json(errorResponse(err.message, 400));
    }
};

// [관리자 전용] 공지 수정
export const updateNotice = async (req, res) => {
    try {
        const notice = await Notice.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!notice) return res.status(404).json(errorResponse("NOTICE_NOT_FOUND", 404));
        return res.status(200).json(successResponse(notice, "NOTICE_UPDATED", 200));
    } catch (err) {
        return res.status(400).json(errorResponse(err.message, 400));
    }
};

// [관리자 전용] 공지 삭제
export const deleteNotice = async (req, res) => {
    try {
        const notice = await Notice.findByIdAndDelete(req.params.id);
        if (!notice) return res.status(404).json(errorResponse("NOTICE_NOT_FOUND", 404));
        return res.status(200).json(successResponse(null, "NOTICE_DELETED", 200));
    } catch (err) {
        return res.status(500).json(errorResponse(err.message, 500));
    }
};