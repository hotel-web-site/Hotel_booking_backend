import { Router } from "express";
import { verifyToken } from "../common/authMiddleware.js";
import * as reviewController from "./controller.js";

const router = Router();

router.post("/", verifyToken, reviewController.createReview);
router.get("/", reviewController.getAllReviews);

router.get("/hotel/:hotelId", reviewController.getReviewsByHotel);
router.get("/user/me", verifyToken, reviewController.getReviewsByUser);

router.get("/:id", reviewController.getReviewById);
router.patch("/:id", verifyToken, reviewController.updateReview);
router.delete("/:id", verifyToken, reviewController.deleteReview);

export default router;
