import * as couponService from './service.js';

export const create = async (req, res, next) => {
    try {
        const result = await couponService.createCoupon(req.body);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

export const getList = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const result = await couponService.getCouponList(page, limit);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const remove = async (req, res, next) => {
    try {
        const { couponId } = req.params;
        await couponService.deleteCoupon(couponId);
        res.status(200).json({ message: '쿠폰이 삭제되었습니다.' });
    } catch (error) {
        next(error);
    }
};

export const update = async (req, res, next) => {
    try {
        const { couponId } = req.params;
        const result = await couponService.updateCoupon(couponId, req.body);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};