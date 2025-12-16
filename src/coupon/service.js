import Coupon from './model.js';

// 1. 쿠폰 생성
export const createCoupon = async (data) => {
    // 코드 중복 체크
    const exists = await Coupon.findOne({ code: data.code.toUpperCase() });
    if (exists) {
        throw new Error('이미 존재하는 쿠폰 코드입니다.');
    }

    const coupon = await Coupon.create({
        name: data.name,
        code: data.code,
        discountType: data.discountType,
        discountValue: data.discountValue,
        validFrom: data.validFrom,
        validUntil: data.validUntil,
        totalQuantity: data.totalQuantity,
    });

    return coupon;
};

// 2. 쿠폰 목록 조회 (관리자용)
export const getCouponList = async (page = 1, limit = 10) => {
    const skip = (page - 1) * limit;

    const coupons = await Coupon.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Coupon.countDocuments();

    return { coupons, total, page, totalPages: Math.ceil(total / limit) };
};

// 3. 쿠폰 삭제
export const deleteCoupon = async (couponId) => {
    const coupon = await Coupon.findByIdAndDelete(couponId);
    if (!coupon) throw new Error('쿠폰이 없습니다.');
    return true;
};

// 4. 쿠폰 수정 (선택 - 필요하면 추가)
export const updateCoupon = async (couponId, data) => {
    const coupon = await Coupon.findByIdAndUpdate(couponId, data, { new: true });
    if (!coupon) throw new Error('쿠폰이 없습니다.');
    return coupon;
};