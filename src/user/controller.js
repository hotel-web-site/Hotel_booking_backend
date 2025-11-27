import * as userService from "./service.js";
import { successResponse, errorResponse } from "../common/response.js";

export async function register(req, res) {
    try {
        const user = await userService.registerUser(req.body);
        return res.status(201).json(
            successResponse(user.toSafeJSON(), "회원가입 성공", 201)
        );
    } catch (error) {
        return res.status(400).json(errorResponse(error.message, 400));
    }
}

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
                return res.status(423).json(errorResponse("계정이 잠겼습니다.", 423));
        }

        res.cookie("token", result.token, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
        });

        return res.status(200).json(
            successResponse(
                {
                    token: result.token,
                    user: result.user.toSafeJSON(),
                },
                "로그인 성공"
            )
        );
    } catch (error) {
        return res.status(500).json(errorResponse(error.message, 500));
    }
}

export async function getMe(req, res) {
    try {
        const user = await userService.getUserById(req.user.id);
        return res.status(200).json(successResponse(user.toSafeJSON(), "내 정보 조회 성공"));
    } catch (error) {
        return res.status(400).json(errorResponse(error.message, 400));
    }
}

export async function updateProfile(req, res) {
    try {
        const updated = await userService.updateUser(req.user.id, req.body);
        return res.status(200).json(successResponse(updated, "프로필 수정 완료"));
    } catch (error) {
        return res.status(400).json(errorResponse(error.message, 400));
    }
}

export async function changePassword(req, res) {
    try {
        await userService.changePassword(
            req.user.id,
            req.body.currentPassword,
            req.body.newPassword
        );
        return res.status(200).json(successResponse(null, "비밀번호 변경 완료"));
    } catch (error) {
        return res.status(400).json(errorResponse(error.message, 400));
    }
}

export async function deactivate(req, res) {
    try {
        await userService.deactivateUser(req.user.id);
        res.clearCookie("token");
        return res.status(200).json(successResponse(null, "계정 비활성화 완료"));
    } catch (error) {
        return res.status(400).json(errorResponse(error.message, 400));
    }
}

export async function getAllUsers(req, res) {
    try {
        const users = await userService.getAllUsersForAdmin(req.user.id);
        return res.status(200).json(successResponse(users, "전체 사용자 조회 완료"));
    } catch (error) {
        return res.status(403).json(errorResponse(error.message, 403));
    }
}
