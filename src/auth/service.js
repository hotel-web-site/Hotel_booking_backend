import jwt from "jsonwebtoken";
import axios from "axios";
import { User } from "../user/model.js";

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || "fallback_secret", { expiresIn: "30d" });
};

const findOrCreateUser = async ({ email, name, providerId, phone = "" }) => {
    let user = await User.findOne({ email });
    if (!user) {
        user = await User.create({
            name,
            email,
            password: `social_${providerId}_${Date.now()}`,
            phone
        });
    }
    return { _id: user._id, name: user.name, email: user.email, token: signToken(user._id) };
};

export const register = async ({ name, email, password, phone }) => {
    const exists = await User.findOne({ email });
    if (exists) {
        const err = new Error("USER_ALREADY_EXISTS");
        err.statusCode = 400;
        throw err;
    }
    const user = await User.create({ name, email, password, phone });
    return { _id: user._id, name: user.name, email: user.email, token: signToken(user._id) };
};

export const login = async ({ email, password }) => {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
        return { _id: user._id, name: user.name, email: user.email, token: signToken(user._id) };
    }
    const err = new Error("INVALID_CREDENTIALS");
    err.statusCode = 401;
    throw err;
};

export const getProfile = (user) => ({
    _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role
});

// 카카오 로그인 로직
export const kakaoLogin = async ({ code }) => {
    const tokenRes = await axios.post("https://kauth.kakao.com/oauth/token", new URLSearchParams({
        grant_type: "authorization_code",
        client_id: process.env.KAKAO_CLIENT_ID,
        redirect_uri: process.env.KAKAO_REDIRECT_URI,
        code,
    }), { headers: { "Content-Type": "application/x-www-form-urlencoded" } });

    const profileRes = await axios.get("https://kapi.kakao.com/v2/user/me", {
        headers: { Authorization: `Bearer ${tokenRes.data.access_token}` }
    });

    const { id, kakao_account: account } = profileRes.data;
    return await findOrCreateUser({
        email: account.email || `kakao_${id}@kakao.local`,
        name: account.profile?.nickname || `User_${id}`,
        providerId: id,
        phone: account.phone_number?.replace("+82 ", "0").replace(/-/g, "") || ""
    });
};

// 네이버 로그인 로직
export const naverLogin = async ({ code, state }) => {
    const tokenRes = await axios.get(`https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id=${process.env.NAVER_ID}&client_secret=${process.env.NAVER_SECRET}&code=${code}&state=${state}`);

    const profileRes = await axios.get("https://openapi.naver.com/v1/nid/me", {
        headers: { Authorization: `Bearer ${tokenRes.data.access_token}` }
    });

    const { id, email, nickname, mobile } = profileRes.data.response;
    return await findOrCreateUser({
        email: email || `naver_${id}@naver.local`,
        name: nickname || `User_${id}`,
        providerId: id,
        phone: mobile?.replace(/-/g, "") || ""
    });
};

// 구글 로그인 로직
export const googleLogin = async ({ code }) => {
    const tokenRes = await axios.post("https://oauth2.googleapis.com/token", {
        code,
        client_id: process.env.GOOGLE_ID,
        client_secret: process.env.GOOGLE_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
    });

    const profileRes = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${tokenRes.data.access_token}` }
    });

    const { id, email, name } = profileRes.data;
    return await findOrCreateUser({
        email,
        name,
        providerId: id
    });
};