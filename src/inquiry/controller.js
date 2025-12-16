import * as inquiryService from './service.js';
import { successResponse, errorResponse } from "../common/response.js"; // 추가

export const create = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const result = await inquiryService.createInquiry(userId, req.body);
        res.status(201).json(successResponse(result, "INQUIRY_CREATED", 201));
    } catch (error) {
        next(error);
    }
};

export const getList = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const role = req.user.role;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const result = await inquiryService.getInquiryList(userId, role, page, limit);
        res.status(200).json(successResponse(result, "INQUIRIES_FETCHED", 200));
    } catch (error) {
        next(error);
    }
};

export const getOne = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const role = req.user.role;
        const { inquiryId } = req.params;

        const result = await inquiryService.getInquiryById(inquiryId, userId, role);
        res.status(200).json(successResponse(result, "INQUIRY_FETCHED", 200));
    } catch (error) {
        if (error.message.includes('권한')) return res.status(403).json(errorResponse(error.message, 403));
        next(error);
    }
};

export const reply = async (req, res, next) => {
    try {
        const adminId = req.user._id;
        const { inquiryId } = req.params;
        const { answer } = req.body;

        const result = await inquiryService.replyInquiry(inquiryId, adminId, answer);
        res.status(200).json(successResponse(result, "REPLY_ADDED", 200));
    } catch (error) {
        next(error);
    }
};

export const remove = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const role = req.user.role;
        const { inquiryId } = req.params;

        await inquiryService.deleteInquiry(inquiryId, userId, role);
        res.status(200).json(successResponse(null, "INQUIRY_DELETED", 200));
    } catch (error) {
        if (error.message.includes('권한')) return res.status(403).json(errorResponse(error.message, 403));
        next(error);
    }
};