const Review = require("../models/Review");

// 리뷰 생성
async function createReview(req, res) {
    try {
        const { hotel, rating, comment } = req.body;
        const review = await Review.create({
            user: req.user.id,
            hotel,
            rating,
            comment,
        });
        res.status(201).json({ message: "리뷰 생성 완료", review });
    } catch (error) {
        res.status(500).json({ message: "리뷰 생성 실패", error: error.message });
    }
}

// 전체 리뷰 조회 (관리자용)
async function getAllReviews(req, res) {
    try {
        const reviews = await Review.find()
            .populate("user", "name email")
            .populate("hotel", "name address")
            .sort({ createdAt: -1 });
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: "전체 리뷰 조회 실패", error: error.message });
    }
}

// 특정 리뷰 조회
async function getReviewById(req, res) {
    try {
        const review = await Review.findById(req.params.id)
            .populate("user", "name email")
            .populate("hotel", "name address");
        if (!review) return res.status(404).json({ message: "리뷰 없음" });
        res.status(200).json(review);
    } catch (error) {
        res.status(500).json({ message: "리뷰 조회 실패", error: error.message });
    }
}

// 리뷰 수정
async function updateReview(req, res) {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json({ message: "리뷰 없음" });

        if (review.user.toString() !== req.user.id)
            return res.status(403).json({ message: "수정 권한 없음" });

        Object.assign(review, req.body);
        await review.save();

        res.status(200).json({ message: "리뷰 수정 완료", review });
    } catch (error) {
        res.status(500).json({ message: "리뷰 수정 실패", error: error.message });
    }
}

// 호텔별 리뷰 조회
async function getReviewsByHotel(req, res) {
    try {
        const reviews = await Review.find({ hotel: req.params.hotelId })
            .populate("user", "name email")
            .sort({ createdAt: -1 });
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: "호텔 리뷰 조회 실패", error: error.message });
    }
}

// 사용자별 리뷰 조회
async function getReviewsByUser(req, res) {
    try {
        const reviews = await Review.find({ user: req.user.id })
            .populate("hotel", "name")
            .sort({ createdAt: -1 });
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: "사용자 리뷰 조회 실패", error: error.message });
    }
}

// 리뷰 삭제
async function deleteReview(req, res) {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json({ message: "리뷰 없음" });

        if (review.user.toString() !== req.user.id)
            return res.status(403).json({ message: "삭제 권한 없음" });

        await review.remove();
        res.status(200).json({ message: "리뷰 삭제 완료" });
    } catch (error) {
        res.status(500).json({ message: "리뷰 삭제 실패", error: error.message });
    }
}

module.exports = {
    createReview,
    getReviewById,
    getAllReviews,    // 정의 후 export
    getReviewsByHotel,
    getReviewsByUser,
    updateReview,     // 정의 후 export
    deleteReview
};