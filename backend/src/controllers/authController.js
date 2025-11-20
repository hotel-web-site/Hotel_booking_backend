const jwtService = require("../services/jwtService");
const User = require("../models/User");

const LOCK_MAX = 5;

async function register(req, res) {
    try {
        const { name, email, password, phoneNumber, address, dateOfBirth, role } = req.body;
        if (!email || !password || !name) return res.status(400).json({ message: "이름/이메일/비밀번호는 필수입니다." });

        const exists = await User.findOne({ email: email.toLowerCase().trim() });
        if (exists) return res.status(400).json({ message: "이미 가입된 이메일입니다." });

        const validRoles = ["user", "admin", "business"];
        const safeRole = validRoles.includes(role) ? role : "user";

        const user = await User.create({
            name,
            email: email.toLowerCase().trim(),
            passwordHash: password,
            phoneNumber,
            address,
            dateOfBirth,
            role: safeRole
        });

        return res.status(201).json({ message: "회원가입 성공", user: user.toSafeJSON() });
    } catch (error) {
        return res.status(500).json({ message: "회원가입 실패", error: error.message });
    }
}

async function login(req, res) {
    try {
        const { email = "", password = "" } = req.body;
        const user = await User.findOne({ email: email.toLowerCase().trim(), isActive: true });
        const invalidMsg = { message: "이메일 또는 비밀번호가 올바르지 않습니다." };

        if (!user) return res.status(400).json({ ...invalidMsg, loginAttempts: null, remainingAttempts: null, locked: false });

        const ok = await user.comparePassword(password);
        if (!ok) {
            user.loginAttempts = (user.loginAttempts || 0) + 1;
            const remaining = Math.max(0, LOCK_MAX - user.loginAttempts);
            if (user.loginAttempts >= LOCK_MAX) {
                user.isActive = false;
                await user.save();
                return res.status(423).json({ message: "계정이 잠겼습니다. 관리자에게 문의하세요.", loginAttempts: user.loginAttempts, remainingAttempts: 0, locked: true });
            }
            await user.save();
            return res.status(400).json({ ...invalidMsg, loginAttempts: user.loginAttempts, remainingAttempts: remaining, locked: false });
        }

        user.loginAttempts = 0;
        user.isLoggined = true;
        user.lastLogin = new Date();
        await user.save();

        const token = jwtService.makeToken(user);
        res.cookie("token", token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 7 * 24 * 60 * 60 * 1000 });

        return res.status(200).json({ message: "로그인 성공", user: user.toSafeJSON(), token, loginAttempts: 0, remainingAttempts: LOCK_MAX, locked: false });
    } catch (error) {
        return res.status(500).json({ message: "로그인 실패", error: error.message });
    }
}

async function getMe(req, res) {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "사용자 없음" });
        return res.status(200).json(user.toSafeJSON());
    } catch (error) {
        return res.status(401).json({ message: "토큰 무효", error: error.message });
    }
}

async function logout(req, res) {
    try {
        await User.findByIdAndUpdate(req.user.id, { isLoggined: false });
        res.clearCookie("token", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" });
        return res.status(200).json({ message: "로그아웃 성공" });
    } catch (error) {
        return res.status(500).json({ message: "로그아웃 실패", error: error.message });
    }
}

async function updateProfile(req, res) {
    try {
        const allowed = ["name", "phoneNumber", "address", "dateOfBirth", "marketingAgree", "profileImage"];
        const updateData = {};
        allowed.forEach(field => { if (req.body[field] !== undefined) updateData[field] = req.body[field]; });

        const updated = await User.findByIdAndUpdate(req.user.id, updateData, { new: true }).select("-passwordHash");
        if (!updated) return res.status(404).json({ message: "사용자 없음" });

        return res.status(200).json({ message: "회원정보 수정 완료", user: updated });
    } catch (error) {
        return res.status(500).json({ message: "수정 실패", error: error.message });
    }
}

async function changePassword(req, res) {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) return res.status(400).json({ message: "현재 비밀번호와 새 비밀번호가 필요합니다." });

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "사용자 없음" });

        const valid = await user.comparePassword(currentPassword);
        if (!valid) return res.status(400).json({ message: "현재 비밀번호가 일치하지 않습니다." });

        user.passwordHash = newPassword;
        await user.save();
        return res.status(200).json({ message: "비밀번호 변경 완료" });
    } catch (error) {
        return res.status(500).json({ message: "비밀번호 변경 실패", error: error.message });
    }
}

async function deactivate(req, res) {
    try {
        await User.findByIdAndUpdate(req.user.id, { isActive: false, isLoggined: false });
        res.clearCookie("token", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" });
        return res.status(200).json({ message: "계정이 비활성화되었습니다." });
    } catch (error) {
        return res.status(500).json({ message: "비활성화 실패", error: error.message });
    }
}

async function getAllUsers(req, res) {
    try {
        const me = await User.findById(req.user.id);
        if (!me) return res.status(404).json({ message: "사용자 없음" });
        if (me.role !== "admin") return res.status(403).json({ message: "권한 없음" });

        const users = await User.find().select("-passwordHash");
        return res.status(200).json({ users });
    } catch (error) {
        return res.status(500).json({ message: "조회 실패", error: error.message });
    }
}

module.exports = { register, login, getMe, logout, updateProfile, changePassword, deactivate, getAllUsers };
