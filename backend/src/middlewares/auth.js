const jwt = require("jsonwebtoken");

module.exports = async function auth(req, res, next) {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ message: "토큰이 없습니다." });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: "유효하지 않은 토큰입니다.", error: err.message });
    }
};
