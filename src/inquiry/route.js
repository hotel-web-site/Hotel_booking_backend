import express from "express";
import * as inquiryController from "./controller.js";
import { protect } from "../common/authMiddleware.js"; // 로그인 체크 미들웨어

const router = express.Router();

router.post("/", protect, inquiryController.createInquiry);      // 문의 등록
router.get("/my", protect, inquiryController.listMyInquiries);   // 내 문의 목록

export default router;