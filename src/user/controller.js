import * as userService from "./service.js";
import { successResponse, errorResponse } from "../common/response.js";

// ----------------------------------------------------
// 인증 관련
// ----------------------------------------------------

// 회원가입
export async function register(req, res) {
    try {
        const user = await userService.registerUser(req.body);
        // toSafeJSON을 호출하여 안전하게 데이터 반환
        return res.status(201).json(
            successResponse(user.toSafeJSON(), "회원가입 성공", 201)
        );
    } catch (error) {
        return res.status(400).json(errorResponse(error.message, 400));
    }
}

// 로그인 (가장 복잡한 오류 처리)
export async function login(req, res) {
    try {
        const { email, password } = req.body;
        const result = await userService.loginUser(email, password);

        if (!result.ok) {
            if (result.reason === "notFound")
                return res.status(400).json(
                    errorResponse("이메일 또는 비밀번호가 올바르지 않습니다.", 400)
                );

            if (result.reason === "invalid")
                return res.status(400).json(
                    errorResponse("비밀번호 오류", 400, { remainingAttempts: result.remaining })
                );

            if (result.reason === "locked")
                // 계정 잠금 상태는 423 Locked 사용
                return res.status(423).json(errorResponse("계정이 잠겼습니다.", 423));
        }

        // 토큰을 쿠키에 설정 (httpOnly 설정으로 보안 강화)
        res.cookie("token", result.token, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
        });

        return res.status(200).json(
            successResponse(
                {
                    token: result.token,
                    user: result.user.toSafeJSON(), // toSafeJSON 호출
                },
                "로그인 성공"
            )
        );
    } catch (error) {
        // 서버 오류 (500)
        return res.status(500).json(errorResponse(error.message, 500));
    }
}

// ----------------------------------------------------
// 사용자 정보 관리 관련
// ----------------------------------------------------

// 내 정보 조회
export async function getMe(req, res) {
    try {
        // req.user.id는 verifyToken 미들웨어에서 가져옴
        const user = await userService.getUserById(req.user.id);
        if (!user) return res.status(404).json(errorResponse("사용자를 찾을 수 없습니다.", 404));

        return res.status(200).json(successResponse(user.toSafeJSON(), "내 정보 조회 성공"));
    } catch (error) {
        return res.status(400).json(errorResponse(error.message, 400));
    }
}

// 프로필 수정
export async function updateProfile(req, res) {
    try {
        const updated = await userService.updateUser(req.user.id, req.body);
        if (!updated) return res.status(404).json(errorResponse("사용자를 찾을 수 없습니다.", 404));

        return res.status(200).json(successResponse(updated.toSafeJSON(), "프로필 수정 완료"));
    } catch (error) {
        return res.status(400).json(errorResponse(error.message, 400));
    }
}

// 비밀번호 변경
export async function changePassword(req, res) {
    try {
        // 비밀번호가 일치하지 않으면 서비스에서 에러 throw
        await userService.changePassword(
            req.user.id,
            req.body.currentPassword,
            req.body.newPassword
        );
        return res.status(200).json(successResponse(null, "비밀번호 변경 완료"));
    } catch (error) {
        // 주로 "현재 비밀번호가 일치하지 않습니다." 오류를 잡음
        return res.status(400).json(errorResponse(error.message, 400));
    }
}

// 계정 비활성화 (탈퇴)
export async function deactivate(req, res) {
    try {
        await userService.deactivateUser(req.user.id);
        // 토큰 쿠키 제거
        res.clearCookie("token");
        return res.status(200).json(successResponse(null, "계정 비활성화 완료"));
    } catch (error) {
        return res.status(400).json(errorResponse(error.message, 400));
    }
}

// 전체 사용자 조회 (관리자 전용)
export async function getAllUsers(req, res) {
    try {
        const users = await userService.getAllUsersForAdmin(req.user.id);
        // 사용자 목록을 toSafeJSON으로 변환하여 반환
        const safeUsers = users.map(user => user.toSafeJSON());

        return res.status(200).json(successResponse(safeUsers, "전체 사용자 조회 완료"));
    } catch (error) {
        // 권한 없음 에러는 403 Forbidden
        return res.status(403).json(errorResponse(error.message, 403));
    }
}