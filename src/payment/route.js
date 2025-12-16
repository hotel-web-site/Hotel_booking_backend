import express from "express";
import { verifyToken, isAdmin } from "../common/authMiddleware.js";
import * as paymentController from "./controller.js";

const router = express.Router();

// 유저 전용
router.post("/prepare", verifyToken, paymentController.preparePayment);
router.post("/confirm", verifyToken, paymentController.confirmPayment);

// 관리자 전용 (매니지먼트 경로 이식)
router.get("/admin/list", verifyToken, isAdmin, paymentController.getAdminList);

export default router;