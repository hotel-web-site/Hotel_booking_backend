const User = require("./model");
const { makeToken } = require("../common/jwtService"); // jwtService 불러오기

const LOCK_MAX = 5;

async function registerUser(data) {
    const { name, email, password, phoneNumber, address, dateOfBirth, role } = data;

    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) throw new Error("이미 가입된 이메일입니다.");

    const validRoles = ["user", "admin", "business"];
    const safeRole = validRoles.includes(role) ? role : "user";

    const user = await User.create({
        name,
        email: email.toLowerCase().trim(),
        passwordHash: password,
        phoneNumber,
        address,
        dateOfBirth,
        role: safeRole,
    });

    return user;
}

async function loginUser(email, password) {
    const user = await User.findOne({
        email: email.toLowerCase().trim(),
        isActive: true,
    });

    if (!user) return { ok: false, reason: "notFound", user: null };

    const valid = await user.comparePassword(password);

    if (!valid) {
        user.loginAttempts += 1;
        const remaining = Math.max(0, LOCK_MAX - user.loginAttempts);

        if (user.loginAttempts >= LOCK_MAX) {
            user.isActive = false;
            await user.save();
            return { ok: false, reason: "locked", user };
        }

        await user.save();
        return { ok: false, reason: "invalid", user, remaining };
    }

    // 로그인 성공
    user.loginAttempts = 0;
    user.isLoggined = true;
    user.lastLogin = new Date();
    await user.save();

    const token = makeToken(user); // jwtService에서 토큰 생성

    return { ok: true, token, user };
}

async function getUserById(id) {
    return User.findById(id);
}

async function updateUser(id, updateData) {
    return User.findByIdAndUpdate(id, updateData, { new: true }).select("-passwordHash");
}

async function changePassword(id, currentPassword, newPassword) {
    const user = await User.findById(id);
    if (!user) throw new Error("사용자 없음");

    const valid = await user.comparePassword(currentPassword);
    if (!valid) throw new Error("현재 비밀번호가 일치하지 않습니다.");

    user.passwordHash = newPassword;
    await user.save();
}

async function deactivateUser(id) {
    return User.findByIdAndUpdate(id, { isActive: false, isLoggined: false });
}

async function getAllUsersForAdmin(adminId) {
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== "admin") throw new Error("권한 없음");

    return User.find().select("-passwordHash");
}

module.exports = {
    registerUser,
    loginUser,
    getUserById,
    updateUser,
    changePassword,
    deactivateUser,
    getAllUsersForAdmin,
};
