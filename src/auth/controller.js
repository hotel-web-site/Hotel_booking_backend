import * as authService from "./service.js";
import { successResponse, errorResponse } from "../common/response.js";

// --- 기존 로직 (Register, Login, Me) ---
export const register = async (req, res) => {
    try {
        const data = await authService.register(req.body);
        return res.status(201).json(successResponse(data, "REGISTER_SUCCESS", 201));
    } catch (err) {
        return res.status(err.statusCode || 400).json(errorResponse(err.message, err.statusCode || 400));
    }
};

export const login = async (req, res) => {
    try {
        const data = await authService.login(req.body);
        return res.status(200).json(successResponse(data, "LOGIN_SUCCESS", 200));
    } catch (err) {
        return res.status(err.statusCode || 401).json(errorResponse(err.message, err.statusCode || 401));
    }
};

export const me = async (req, res) => {
    const data = authService.getProfile(req.user);
    return res.status(200).json(successResponse(data, "GET_ME_SUCCESS", 200));
};

// --- 소셜 로그인 공통 리다이렉트 처리 ---
const handleSocialLoginSuccess = (res, data) => {
    const frontendRedirect = process.env.KAKAO_LOGIN_REDIRECT; // 모든 소셜 공통 리다이렉트 지점
    if (frontendRedirect) {
        const url = new URL(frontendRedirect);
        // 프론트엔드에서 토큰을 쉽게 파싱하도록 Hash 사용
        url.hash = `token=${data.token}&name=${encodeURIComponent(data.name)}&email=${data.email}`;
        return res.redirect(url.toString());
    }
    return res.status(200).json(successResponse(data, "LOGIN_SUCCESS", 200));
};

// --- 카카오 ---
export const kakaoRedirect = (req, res) => {
    const url = `https://kauth.kakao.com/oauth/authorize?client_id=${process.env.KAKAO_CLIENT_ID}&redirect_uri=${process.env.KAKAO_REDIRECT_URI}&response_type=code`;
    return res.redirect(url);
};

export const kakaoCallback = async (req, res) => {
    try {
        const { code } = req.query;
        if (!code) throw new Error("AUTH_CODE_REQUIRED");
        const data = await authService.kakaoLogin({ code });
        return handleSocialLoginSuccess(res, data);
    } catch (err) {
        return res.status(400).json(errorResponse(err.message, 400));
    }
};

// --- 네이버 ---
export const naverRedirect = (req, res) => {
    const url = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${process.env.NAVER_ID}&redirect_uri=${process.env.NAVER_REDIRECT_URI}&state=STATE_STRING`;
    return res.redirect(url);
};

export const naverCallback = async (req, res) => {
    try {
        const { code, state } = req.query;
        const data = await authService.naverLogin({ code, state });
        return handleSocialLoginSuccess(res, data);
    } catch (err) {
        return res.status(400).json(errorResponse(err.message, 400));
    }
};

// --- 구글 ---
export const googleRedirect = (req, res) => {
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_ID}&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&response_type=code&scope=email%20profile`;
    return res.redirect(url);
};

export const googleCallback = async (req, res) => {
    try {
        const { code } = req.query;
        const data = await authService.googleLogin({ code });
        return handleSocialLoginSuccess(res, data);
    } catch (err) {
        return res.status(400).json(errorResponse(err.message, 400));
    }
};