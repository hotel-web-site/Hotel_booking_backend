import * as noticeService from './service.js';
import { successResponse } from '../common/response.js'; // 응답 규격 추가

export const create = async (req, res, next) => {
    try {
        const adminId = req.user._id;
        const result = await noticeService.createNotice(adminId, req.body, req.files);
        res.status(201).json(successResponse(result, "NOTICE_CREATED", 201));
    } catch (error) {
        next(error);
    }
};

export const getList = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const result = await noticeService.getNoticeList(page, limit);
        res.status(200).json(successResponse(result, "NOTICES_FETCHED", 200));
    } catch (error) {
        next(error);
    }
};

export const getOne = async (req, res, next) => {
    try {
        const { noticeId } = req.params;
        const result = await noticeService.getNoticeById(noticeId);
        res.status(200).json(successResponse(result, "NOTICE_FETCHED", 200));
    } catch (error) {
        next(error);
    }
};

export const update = async (req, res, next) => {
    try {
        const { noticeId } = req.params;
        const result = await noticeService.updateNotice(noticeId, req.body);
        res.status(200).json(successResponse(result, "NOTICE_UPDATED", 200));
    } catch (error) {
        next(error);
    }
};

export const remove = async (req, res, next) => {
    try {
        const { noticeId } = req.params;
        await noticeService.deleteNotice(noticeId);
        res.status(200).json(successResponse(null, "NOTICE_DELETED", 200));
    } catch (error) {
        next(error);
    }
};