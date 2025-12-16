import PaymentService from "./service.js";
import { successResponse } from "../common/response.js";

export const preparePayment = async (req, res, next) => {
    try {
        const result = await PaymentService.preparePayment({
            userId: req.user.id,
            bookingId: req.body.bookingId
        });
        res.status(200).json(successResponse(result, "결제 준비 완료"));
    } catch (err) { next(err); }
};

export const confirmPayment = async (req, res, next) => {
    try {
        const result = await PaymentService.confirmPayment(req.body);
        res.status(200).json(successResponse(result, "결제 승인 완료"));
    } catch (err) { next(err); }
};

export const getAdminList = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const result = await PaymentService.getAllPayments(page, limit);
        res.status(200).json(successResponse(result, "전체 내역 조회 완료"));
    } catch (err) { next(err); }
};