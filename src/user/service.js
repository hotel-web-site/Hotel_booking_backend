import User from "./model.js";
import { makeToken } from "../common/jwtService.js"; // makeToken 함수를 여기서 사용

const LOCK_MAX = 5;

// ----------------------------------------------------
// 1. 회원가입
// ----------------------------------------------------
export async function registerUser(data) {
    const { name, email, password, phoneNumber, address, dateOfBirth, role } = data;

    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) throw new Error("이미 가입된 이메일입니다.");

    const validRoles = ["user", "admin", "business"];
    const safeRole = validRoles.includes(role) ? role : "user";

    const user = await User.create({
        name,
        email: email.toLowerCase().trim(),
        passwordHash: password, // Model의 pre-save 훅에서 해싱 처리됨
        phoneNumber,
        address,
        dateOfBirth,
        role: safeRole,
    });

    return user;
}

// ----------------------------------------------------
// 2. 로그인 (가장 복잡한 로직)
// ----------------------------------------------------
export async function loginUser(email, password) {
    const user = await User.findOne({
        email: email.toLowerCase().trim(),
        isActive: true,
    }).select('+passwordHash'); // 비밀번호 비교를 위해 해시된 값 가져오기

    if (!user) return { ok: false, reason: "notFound", user: null };

    // 계정이 비활성화(잠금) 상태인지 확인
    if (user.loginAttempts >= LOCK_MAX && !user.isActive) {
        return { ok: false, reason: "locked", user };
    }

    const valid = await user.comparePassword(password);

    if (!valid) {
        // 비밀번호 오류: 시도 횟수 증가
        user.loginAttempts += 1;
        const remaining = Math.max(0, LOCK_MAX - user.loginAttempts);

        if (user.loginAttempts >= LOCK_MAX) {
            // 최대 횟수 초과 시 계정 잠금
            user.isActive = false;
            await user.save();
            return { ok: false, reason: "locked", user };
        }

        await user.save();
        return { ok: false, reason: "invalid", user, remaining };
    }

    // 로그인 성공: 시도 횟수 초기화 및 상태 업데이트
    user.loginAttempts = 0;
    user.isLoggined = true;
    user.lastLogin = new Date();
    await user.save();

    const token = makeToken(user);

    return { ok: true, token, user };
}

// ----------------------------------------------------
// 3. 사용자 정보 조회/수정/삭제
// ----------------------------------------------------
export async function getUserById(id) {
    return User.findById(id);
}

export async function updateUser(id, updateData) {
    // 민감 정보는 업데이트에서 제외
    const forbidden = ['passwordHash', 'role', 'email', 'isActive', 'loginAttempts'];
    const filteredUpdate = Object.keys(updateData)
        .filter(key => !forbidden.includes(key))
        .reduce((obj, key) => {
            obj[key] = updateData[key];
            return obj;
        }, {});

    return User.findByIdAndUpdate(id, filteredUpdate, { new: true });
}

export async function changePassword(id, currentPassword, newPassword) {
    const user = await User.findById(id).select('+passwordHash'); // 비밀번호 비교를 위해 가져옴
    if (!user) throw new Error("사용자 없음");

    const valid = await user.comparePassword(currentPassword);
    if (!valid) throw new Error("현재 비밀번호가 일치하지 않습니다.");

    // 새로운 비밀번호를 대입하면 Model의 pre-save 훅에서 자동 해싱됨
    user.passwordHash = newPassword;
    await user.save();
}

export async function deactivateUser(id) {
    return User.findByIdAndUpdate(id, { isActive: false, isLoggined: false });
}

// ----------------------------------------------------
// 4. 관리자 기능
// ----------------------------------------------------
export async function getAllUsersForAdmin(adminId) {
    const admin = await User.findById(adminId);
    // ⭐ 권한 확인
    if (!admin || admin.role !== "admin") throw new Error("권한 없음");

    // 비밀번호 해시 제외하고 모든 사용자 반환
    return User.find().select("-passwordHash");
}