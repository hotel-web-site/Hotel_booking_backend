import reviewService from "./service.js";
import { successResponse, errorResponse } from "../common/response.js";
// 호텔 통계 업데이트 함수 임포트
import { updateHotelStats } from "../hotel/service.js";

// 1. 리뷰 생성
export const createReview = async (req, res) => {
    try {
        const review = await reviewService.createReview({
            userId: req.user.id,
            hotel: req.body.hotel,
            rating: req.body.rating,
            comment: req.body.comment,
        });

        // [핵심] 해당 호텔의 평점/개수 업데이트
        await updateHotelStats(review.hotel);

        return res.status(201).json(successResponse(review, "리뷰가 등록되었습니다.", 201));
    } catch (error) {
        return res.status(500).json(errorResponse("리뷰 생성 실패", 500, error.message));
    }
};

// 2. 호텔별 리뷰 조회
export const getReviewsByHotel = async (req, res) => {
    try {
        const reviews = await reviewService.getReviewsByHotel(req.params.hotelId);
        return res.status(200).json(successResponse(reviews, "호텔 리뷰 조회 성공"));
    } catch (error) {
        return res.status(500).json(errorResponse("리뷰 조회 실패", 500, error.message));
    }
};

// 3. 리뷰 수정
export const updateReview = async (req, res) => {
    try {
        const review = await reviewService.findById(req.params.id);
        if (!review) return res.status(404).json(errorResponse("리뷰를 찾을 수 없습니다.", 404));

        if (review.user.toString() !== req.user.id) {
            return res.status(403).json(errorResponse("수정 권한이 없습니다.", 403));
        }

        const updated = await reviewService.updateReview(review, req.body);

        // [핵심] 평점이 바뀌었을 수 있으므로 통계 업데이트
        await updateHotelStats(updated.hotel);

        return res.status(200).json(successResponse(updated, "리뷰가 수정되었습니다."));
    } catch (error) {
        return res.status(500).json(errorResponse("리뷰 수정 실패", 500, error.message));
    }
};

// 4. 리뷰 삭제
export const deleteReview = async (req, res) => {
    try {
        const review = await reviewService.findById(req.params.id);
        if (!review) return res.status(404).json(errorResponse("리뷰를 찾을 수 없습니다.", 404));

        if (review.user.toString() !== req.user.id) {
            return res.status(403).json(errorResponse("삭제 권한이 없습니다.", 403));
        }

        const hotelId = review.hotel; // 삭제 전 호텔 ID 백업
        await reviewService.deleteReview(review);

        // [핵심] 삭제 후 평점/개수 재계산
        await updateHotelStats(hotelId);

        return res.status(200).json(successResponse(null, "리뷰가 삭제되었습니다."));
    } catch (error) {
        return res.status(500).json(errorResponse("리뷰 삭제 실패", 500, error.message));
    }
};

// 5. 기타 조회 함수들 (생략 없이 유지)
export const getAllReviews = async (req, res) => {
    try {
        const reviews = await reviewService.getAllReviews();
        return res.status(200).json(successResponse(reviews, "전체 조회 완료"));
    } catch (error) {
        return res.status(500).json(errorResponse("조회 실패", 500, error.message));
    }
};

export const getReviewById = async (req, res) => {
    try {
        const review = await reviewService.getReviewById(req.params.id);
        if (!review) return res.status(404).json(errorResponse("리뷰 없음", 404));
        return res.status(200).json(successResponse(review, "조회 완료"));
    } catch (error) {
        return res.status(500).json(errorResponse("조회 실패", 500, error.message));
    }
};

export const getReviewsByUser = async (req, res) => {
    try {
        const reviews = await reviewService.getReviewsByUser(req.user.id);
        return res.status(200).json(successResponse(reviews, "사용자 리뷰 조회 완료"));
    } catch (error) {
        return res.status(500).json(errorResponse("조회 실패", 500, error.message));
    }
};
