const express = require("express");
const router = express.Router();
const { verifyToken } = require("../common/authMiddleware");
const reviewController = require("./controller");

router.post("/", verifyToken, reviewController.createReview);
router.get("/", reviewController.getAllReviews);
router.get("/:id", reviewController.getReviewById);
router.get("/hotel/:hotelId", reviewController.getReviewsByHotel);
router.get("/user/me", verifyToken, reviewController.getReviewsByUser);
router.patch("/:id", verifyToken, reviewController.updateReview);
router.delete("/:id", verifyToken, reviewController.deleteReview);

module.exports = router;
