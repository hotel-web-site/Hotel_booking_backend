import { Router } from "express";
import * as authController from "./controller.js";
import { verifyToken } from "../common/authMiddleware.js";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", verifyToken, authController.me);

// 카카오
router.get("/kakao", authController.kakaoRedirect);
router.get("/login/kakao", authController.kakaoCallback); // .env 설정과 일치

// 네이버
router.get("/naver", authController.naverRedirect);
router.get("/login/naver", authController.naverCallback); // .env 설정과 일치

// 구글
router.get("/google", authController.googleRedirect);
router.get("/login/google", authController.googleCallback); // .env 설정과 일치

export default router;