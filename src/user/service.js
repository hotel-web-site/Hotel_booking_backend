import User from "./model.js";
import { makeToken } from "../common/jwtService.js";

const LOCK_MAX = 5; // 비밀번호 최대 시도 횟수

// 1. 회원가입 로직: 이메일 및 휴대폰 중복을 사전에 차단
export async function registerUser(data) {
    const { name, email, password, phoneNumber, address, dateOfBirth, role } = data;

    // 이메일 중복 체크
    const emailExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (emailExists) throw new Error("이미 사용 중인 이메일 주소입니다.");

    // 휴대폰 번호 중복 체크
    const phoneExists = await User.findOne({ phoneNumber });
    if (phoneExists) throw new Error("이미 등록된 휴대폰 번호입니다.");

    // 역할(Role) 유효성 확인
    const validRoles = ["user", "admin", "business"];
    const safeRole = validRoles.includes(role) ? role : "user";

    // 사용자 생성 (비밀번호는 모델의 pre-save 훅에서 암호화된다고 가정)
    try {
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
    } catch (dbError) {
        console.error("회원가입 DB 에러:", dbError);
        throw new Error("데이터베이스 저장 중 오류가 발생했습니다.");
    }
}

// 2. 로그인 로직: 비밀번호 일치 확인 및 잠금 정책 적용
export async function loginUser(email, password) {
    if (!email || !password) {
        throw new Error("이메일과 비밀번호를 입력해주세요.");
    }

    const user = await User.findOne({
        email: email.toLowerCase().trim(),
        isActive: true, // 활성화된 계정만 조회
    });

    // 사용자가 없는 경우
    if (!user) return { ok: false, reason: "notFound", user: null };

    // 비밀번호 검증 (모델의 comparePassword 메서드 호출)
    const valid = await user.comparePassword(password);

    if (!valid) {
        user.loginAttempts += 1;
        const remaining = Math.max(0, LOCK_MAX - user.loginAttempts);

        // 5회 이상 실패 시 계정 비활성화(잠금)
        if (user.loginAttempts >= LOCK_MAX) {
            user.isActive = false;
            await user.save();
            return { ok: false, reason: "locked", user };
        }

        await user.save();
        return { ok: false, reason: "invalid", user, remaining };
    }

    // 성공 시 로그인 시도 횟수 초기화 및 정보 갱신
    user.loginAttempts = 0;
    user.isLoggined = true;
    user.lastLogin = new Date();
    await user.save();

    // 토큰 생성
    const token = makeToken(user);
    return { ok: true, token, user };
}

// 3. ID로 사용자 조회
export async function getUserById(id) {
    return User.findById(id);
}

// 4. 사용자 정보 업데이트
export async function updateUser(id, updateData) {
    // 패스워드는 여기서 직접 수정하지 않으므로 passwordHash 제외
    return User.findByIdAndUpdate(id, updateData, { new: true }).select("-passwordHash");
}

// 5. 비밀번호 변경 로직
export async function changePassword(id, currentPassword, newPassword) {
    const user = await User.findById(id);
    if (!user) throw new Error("사용자를 찾을 수 없습니다.");

    // 현재 비밀번호가 맞는지 먼저 확인
    const valid = await user.comparePassword(currentPassword);
    if (!valid) throw new Error("현재 비밀번호가 일치하지 않습니다.");

    // 새 비밀번호 설정 (모델 훅에서 자동 암호화 처리됨)
    user.passwordHash = newPassword;
    await user.save();
}

// 6. 계정 탈퇴 (isActive를 false로)
export async function deactivateUser(id) {
    return User.findByIdAndUpdate(id, { isActive: false, isLoggined: false });
}

// 7. 관리자용 전체 사용자 조회
export async function getAllUsersForAdmin(adminId) {
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== "admin") {
        throw new Error("관리자 권한이 필요합니다.");
    }
    return User.find().select("-passwordHash");
}