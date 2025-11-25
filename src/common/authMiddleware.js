// src/common/authMiddleware.js
// JWT 토큰을 검사하여 인증된 사용자인지 판별하는 미들웨어
// 인증 필요한 API에서만 적용 (예: 예약 생성, 예약 조회 등)

import jwt from "jsonwebtoken";
import { errorResponse } from "./response.js";

export const verifyToken = (req, res, next) => {
    try {
        // Authorization: Bearer TOKEN 형태
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json(errorResponse("NO_TOKEN_PROVIDED", 401));
        }

        // Bearer 분리 → 실제 토큰만 추출
        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json(errorResponse("INVALID_TOKEN_FORMAT", 401));
        }

        // JWT 검증
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // req.user에 담아 다음 단계에서 사용 가능
        req.user = decoded;

        next(); // 인증 성공 → 다음 컨트롤러로 이동
    } catch (err) {
        console.error("JWT ERROR:", err.message);
        return res.status(401).json(errorResponse("INVALID_OR_EXPIRED_TOKEN", 401));
    }
};
