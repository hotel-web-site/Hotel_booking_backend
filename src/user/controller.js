import * as userService from "./service.js";
import { successResponse, errorResponse } from "../common/response.js";
import Joi from "joi";

/**
 * [유효성 검사 설정]
 * 휴대폰 번호 정규식: 010으로 시작하는 10~11자리 숫자
 */
const phoneRegex = /^01(?:0|1|[6-9])(?:\d{3}|\d{4})\d{4}$/;

const registerSchema = Joi.object({
    name: Joi.string().trim().required().messages({ "any.required": "이름은 필수 입력 항목입니다." }),
    email: Joi.string().email().required().messages({ "string.email": "유효한 이메일 형식이 아닙니다." }),
    password: Joi.string().min(6).required().messages({ "string.min": "비밀번호는 최소 6자 이상이어야 합니다." }),
    phoneNumber: Joi.string().regex(phoneRegex).required().messages({
        "string.pattern.base": "휴대폰 번호 형식이 올바르지 않습니다. (예: 01012345678)"
    }),
    address: Joi.string().allow("", null),
    dateOfBirth: Joi.date().allow(null),
    role: Joi.string().valid("user", "admin", "business").default("user"),
});

// 1. 회원가입: 실패 사유(중복, 형식 오류)를 구체적으로 반환
export async function register(req, res) {
    try {
        // 휴대폰 번호에서 하이픈(-) 제거 (데이터 정규화)
        if (req.body.phoneNumber) {
            req.body.phoneNumber = req.body.phoneNumber.replace(/-/g, "");
        }

        // Joi 유효성 검사 실시
        const { error } = registerSchema.validate(req.body);
        if (error) {
            // 형식 오류 발생 시 (예: 비밀번호 짧음) 해당 메시지 반환
            return res.status(400).json(errorResponse(error.details[0].message, 400));
        }

        const user = await userService.registerUser(req.body);
        return res.status(201).json(
            successResponse(user.toSafeJSON(), "회원가입 성공", 201)
        );
    } catch (error) {
        // 서비스에서 던진 에러(중복 이메일 등) 처리
        return res.status(400).json(errorResponse(error.message, 400));
    }
}

// 2. 로그인: 비밀번호 오류 횟수 및 계정 잠금 처리
export async function login(req, res) {
    try {
        const { email, password } = req.body;
        const result = await userService.loginUser(email, password);

        if (!result.ok) {
            if (result.reason === "notFound")
                return res.status(400).json(errorResponse("이메일 또는 비밀번호가 올바르지 않습니다.", 400));

            if (result.reason === "invalid")
                return res.status(400).json(errorResponse(`비밀번호 오류입니다. (남은 횟수: ${result.remaining})`, 400));

            if (result.reason === "locked")
                return res.status(423).json(errorResponse("비밀번호 5회 오류로 계정이 잠겼습니다. 관리자에게 문의하세요.", 423));
        }

        // 보안을 위해 토큰을 쿠키에 설정
        res.cookie("token", result.token, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
        });

        return res.status(200).json(successResponse({ token: result.token, user: result.user.toSafeJSON() }, "로그인 성공"));
    } catch (error) {
        return res.status(500).json(errorResponse("서버 통신 중 오류가 발생했습니다.", 500));
    }
}

// 3. 내 정보 조회
export async function getMe(req, res) {
    try {
        const user = await userService.getUserById(req.user.id);
        if (!user) return res.status(404).json(errorResponse("사용자를 찾을 수 없습니다.", 404));
        return res.status(200).json(successResponse(user.toSafeJSON(), "내 정보 조회 성공"));
    } catch (error) {
        return res.status(400).json(errorResponse(error.message, 400));
    }
}

// 4. 프로필 수정
export async function updateProfile(req, res) {
    try {
        // 수정 시 휴대폰 번호가 있으면 형식 검사 및 정규화
        if (req.body.phoneNumber) {
            req.body.phoneNumber = req.body.phoneNumber.replace(/-/g, "");
            if (!phoneRegex.test(req.body.phoneNumber)) {
                throw new Error("올바른 휴대폰 번호 형식이 아닙니다.");
            }
        }

        const updated = await userService.updateUser(req.user.id, req.body);
        if (!updated) return res.status(404).json(errorResponse("사용자를 찾을 수 없습니다.", 404));
        return res.status(200).json(successResponse(updated.toSafeJSON(), "프로필 수정 완료"));
    } catch (error) {
        return res.status(400).json(errorResponse(error.message, 400));
    }
}

// 5. 비밀번호 변경
export async function changePassword(req, res) {
    try {
        await userService.changePassword(req.user.id, req.body.currentPassword, req.body.newPassword);
        return res.status(200).json(successResponse(null, "비밀번호 변경 완료"));
    } catch (error) {
        return res.status(400).json(errorResponse(error.message, 400));
    }
}

// 6. 계정 비활성화 (탈퇴)
export async function deactivate(req, res) {
    try {
        await userService.deactivateUser(req.user.id);
        res.clearCookie("token");
        return res.status(200).json(successResponse(null, "계정 비활성화 완료"));
    } catch (error) {
        return res.status(400).json(errorResponse(error.message, 400));
    }
}

// 7. 전체 사용자 조회 (관리자 전용)
export async function getAllUsers(req, res) {
    try {
        const users = await userService.getAllUsersForAdmin(req.user.id);
        const safeUsers = users.map(user => user.toSafeJSON());
        return res.status(200).json(successResponse(safeUsers, "전체 사용자 조회 완료"));
    } catch (error) {
        return res.status(403).json(errorResponse(error.message, 403));
    }
}