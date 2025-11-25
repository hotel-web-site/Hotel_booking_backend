import reviewService from "./service.js";
import { successResponse, errorResponse } from "../common/response.js";

// 리뷰 생성
export const createReview = async (req, res) => {
    try {
        const review = await reviewService.createReview({
            userId: req.user.id,
            hotel: req.body.hotel,
            rating: req.body.rating,
            comment: req.body.comment,
        });

        return res.status(201).json(
            successResponse(review, "리뷰 생성 완료", 201)
        );
    } catch (error) {
        return res.status(500).json(
            errorResponse("리뷰 생성 실패", 500, error.message)
        );
    }
};

// 전체 리뷰 조회
export const getAllReviews = async (req, res) => {
    try {
        const reviews = await reviewService.getAllReviews();
        return res.status(200).json(
            successResponse(reviews, "전체 리뷰 조회 완료")
        );
    } catch (error) {
        return res.status(500).json(
            errorResponse("전체 리뷰 조회 실패", 500, error.message)
        );
    }
};

// 특정 리뷰 조회
export const getReviewById = async (req, res) => {
    try {
        const review = await reviewService.getReviewById(req.params.id);
        if (!review)
            return res.status(404).json(
                errorResponse("리뷰 없음", 404)
            );

        return res.status(200).json(
            successResponse(review, "리뷰 조회 완료")
        );
    } catch (error) {
        return res.status(500).json(
            errorResponse("리뷰 조회 실패", 500, error.message)
        );
    }
};

// 호텔별 리뷰 조회
export const getReviewsByHotel = async (req, res) => {
    try {
        const reviews = await reviewService.getReviewsByHotel(req.params.hotelId);
        return res.status(200).json(
            successResponse(reviews, `호텔 ${req.params.hotelId} 리뷰 조회 완료`)
        );
    } catch (error) {
        return res.status(500).json(
            errorResponse("호텔 리뷰 조회 실패", 500, error.message)
        );
    }
};

// 사용자 리뷰 조회
export const getReviewsByUser = async (req, res) => {
    try {
        const reviews = await reviewService.getReviewsByUser(req.user.id);
        return res.status(200).json(
            successResponse(reviews, "사용자 리뷰 조회 완료")
        );
    } catch (error) {
        return res.status(500).json(
            errorResponse("사용자 리뷰 조회 실패", 500, error.message)
        );
    }
};

// 리뷰 수정
export const updateReview = async (req, res) => {
    try {
        const review = await reviewService.findById(req.params.id);
        if (!review)
            return res.status(404).json(
                errorResponse("리뷰 없음", 404)
            );

        if (review.user.toString() !== req.user.id)
            return res.status(403).json(
                errorResponse("수정 권한 없음", 403)
            );

        const updated = await reviewService.updateReview(review, req.body);

        return res.status(200).json(
            successResponse(updated, "리뷰 수정 완료")
        );
    } catch (error) {
        return res.status(500).json(
            errorResponse("리뷰 수정 실패", 500, error.message)
        );
    }
};

// 리뷰 삭제
export const deleteReview = async (req, res) => {
    try {
        const review = await reviewService.findById(req.params.id);
        if (!review)
            return res.status(404).json(
                errorResponse("리뷰 없음", 404)
            );

        if (review.user.toString() !== req.user.id)
            return res.status(403).json(
                errorResponse("삭제 권한 없음", 403)
            );

        await reviewService.deleteReview(review);

        return res.status(200).json(
            successResponse(null, "리뷰 삭제 완료")
        );
    } catch (error) {
        return res.status(500).json(
            errorResponse("리뷰 삭제 실패", 500, error.message)
        );
    }
};
