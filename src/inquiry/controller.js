import * as inquiryService from "./service.js";
import { successResponse, errorResponse } from "../common/response.js";

export const createInquiry = async (req, res) => {
    try {
        const { title, summary, content } = req.body;

        if (!title || !content) {
            return res.status(400).json(errorResponse("제목과 내용을 모두 입력해주세요.", 400));
        }

        const inquiry = await inquiryService.createInquiry({
            user: req.user.id, // 인증된 사용자 정보
            title,
            summary,
            content
        });

        return res.status(201).json(successResponse(inquiry, "문의가 정상적으로 접수되었습니다.", 201));
    } catch (err) {
        return res.status(500).json(errorResponse(err.message, 500));
    }
};

export const listMyInquiries = async (req, res) => {
    try {
        const data = await inquiryService.getUserInquiries(req.user.id);
        return res.status(200).json(successResponse(data, "내 문의 내역 조회 성공"));
    } catch (err) {
        return res.status(500).json(errorResponse(err.message, 500));
    }
};