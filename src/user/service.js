import User from "./model.js";
import { makeToken } from "../common/jwtService.js";

const LOCK_MAX = 5;

export async function registerUser(data) {
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

export async function loginUser(email, password) {
    // 🚨 수정: 필수 입력값 누락 시 명시적 오류 발생 (400 Bad Request 원인 추적을 위해)
    if (!email || !password) {
        throw new Error("로그인을 위해 이메일과 비밀번호를 모두 입력해야 합니다.");
    }

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

    user.loginAttempts = 0;
    user.isLoggined = true;
    user.lastLogin = new Date();
    await user.save();

    const token = makeToken(user);

    return { ok: true, token, user };
}

export async function getUserById(id) {
    return User.findById(id);
}

export async function updateUser(id, updateData) {
    return User.findByIdAndUpdate(id, updateData, { new: true }).select("-passwordHash");
}

export async function changePassword(id, currentPassword, newPassword) {
    const user = await User.findById(id);
    if (!user) throw new Error("사용자 없음");

    const valid = await user.comparePassword(currentPassword);
    if (!valid) throw new Error("현재 비밀번호가 일치하지 않습니다.");

    user.passwordHash = newPassword;
    await user.save();
}

export async function deactivateUser(id) {
    return User.findByIdAndUpdate(id, { isActive: false, isLoggined: false });
}

export async function getAllUsersForAdmin(adminId) {
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== "admin") throw new Error("권한 없음");

    return User.find().select("-passwordHash");
}