import jwt from "jsonwebtoken";

// JWT 발급 함수
export const makeToken = (user) => {
    // payload: 최소한의 정보만 담기 (id, role 등)
    const payload = {
        id: user._id,
        role: user.role,
        email: user.email,
    };

    // 토큰 생성 (만료 1일)
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });

    return token;
};

// JWT 검증 함수 (미들웨어용이 아니라 단순 검증용)
export const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        throw new Error("INVALID_OR_EXPIRED_TOKEN");
    }
};
