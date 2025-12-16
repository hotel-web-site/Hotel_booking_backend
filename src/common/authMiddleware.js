import jwt from "jsonwebtoken";
import { errorResponse } from "./response.js";
import User  from "../user/model.js"; // 유저 모델 임포트 필요

// 1. 로그인 여부 및 토큰 유효성 검사
export const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json(errorResponse("NO_TOKEN_PROVIDED", 401));
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json(errorResponse("INVALID_TOKEN_FORMAT", 401));
        }

        // JWT 검증
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 중요: 토큰의 ID로 DB에서 실제 유저를 찾아 req.user에 전체 정보를 담습니다.
        // 이렇게 해야 req.user.role 값을 사용할 수 있습니다.
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(404).json(errorResponse("USER_NOT_FOUND", 404));
        }

        req.user = user;
        next();
    } catch (err) {
        console.error("JWT ERROR:", err.message);
        return res.status(401).json(errorResponse("INVALID_OR_EXPIRED_TOKEN", 401));
    }
};

// 2. 관리자 권한 검사 (verifyToken 다음에 사용)
export const isAdmin = (req, res, next) => {
    // verifyToken에서 담아준 req.user의 role을 확인
    if (req.user && req.user.role === 'admin') {
        next(); // 관리자면 다음 로직(컨트롤러)으로 진행
    } else {
        // 관리자가 아니면 403 Forbidden 에러 반환
        return res.status(403).json(errorResponse("ADMIN_RESOURCE_ACCESS_DENIED", 403));
    }
};