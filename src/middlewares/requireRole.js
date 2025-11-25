module.exports = function requireRole(roles = []) {
    if (!Array.isArray(roles)) roles = [roles];

    return (req, res, next) => {
        if (!req.user) return res.status(401).json({ message: "로그인 필요" });
        if (!roles.includes(req.user.role)) return res.status(403).json({ message: "권한 없음" });
        next();
    };
};
