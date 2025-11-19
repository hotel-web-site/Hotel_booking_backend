const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async function auth(req, res, next) {
    try {
        // 헤더에서 토큰 가져오기
        const h = req.headers.authorization || '';
        const token = h.startsWith('Bearer')
            ? h.slice(7)
            : (req.cookies?.token || null);

        if (!token) return res.status(401).json({ message: "인증 필요" });

        // 토큰 검증
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // DB에서 실제 유저 확인
        const user = await User.findById(decoded.id);
        if (!user) return res.status(401).json({ message: "유효하지 않은 사용자" });

        req.user = user; // req.user에 실제 User document 저장
        next();
    } catch (error) {
        return res.status(401).json({ message: "토큰 무효", error: error.message });
    }
};
