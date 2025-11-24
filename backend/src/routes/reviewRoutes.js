const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const reviewController = require("../controllers/reviewController");

// 리뷰 생성
router.post("/", auth, reviewController.createReview);

// 특정 리뷰 조회
router.get("/:id", reviewController.getReviewById);

// 전체 리뷰 조회
router.get("/", reviewController.getAllReviews);

// 리뷰 수정
router.patch("/:id", auth, reviewController.updateReview);

// 리뷰 삭제
router.delete("/:id", auth, reviewController.deleteReview);

module.exports = router;
