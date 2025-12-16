import { Router } from "express";
import * as noticeController from "./controller.js";
import { verifyToken, isAdmin } from "../common/authMiddleware.js";

const router = Router();

// 누구나 조회 가능
router.get("/", noticeController.getNotices);
router.get("/:id", noticeController.getNoticeById);

// 관리자(Admin) 권한 필수
router.post("/", verifyToken, isAdmin, noticeController.createNotice);
router.put("/:id", verifyToken, isAdmin, noticeController.updateNotice);
router.delete("/:id", verifyToken, isAdmin, noticeController.deleteNotice);

export default router;