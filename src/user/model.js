import mongoose from "mongoose";
import bcrypt from "bcrypt";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SALT_WORK_FACTOR = 10;

const userSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            match: [EMAIL_REGEX, "유효한 이메일"],
        },
        passwordHash: { type: String, required: true },
        phoneNumber: { type: String, trim: true },
        address: { type: String, trim: true },
        dateOfBirth: { type: Date },
        role: {
            type: String,
            enum: ["user", "admin", "business"],
            default: "user",
            index: true,
        },
        isActive: { type: Boolean, default: true },
        lastLogin: { type: Date },
        profileImage: { type: String },
        marketingAgree: { type: Boolean, default: false },
        loginAttempts: { type: Number, default: 0 },
        isLoggined: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// ----------------------------------------------------
// Instance Methods
// ----------------------------------------------------
// 비밀번호 비교
userSchema.methods.comparePassword = function (plain) {
    return bcrypt.compare(plain, this.passwordHash);
};

// 안전한 JSON 객체 반환 (민감 정보 제거)
userSchema.methods.toSafeJSON = function () {
    const obj = this.toObject({ versionKey: false });
    delete obj.passwordHash;
    // ⭐ 개선 반영: 로그인 시도 횟수도 민감 정보로 간주하여 제거
    delete obj.loginAttempts;
    delete obj.isLoggined; // 로그인 상태도 제외
    return obj;
};

// ----------------------------------------------------
// Pre-save Hook: 자동 해싱
// ----------------------------------------------------
userSchema.pre("save", async function (next) {
    if (!this.isModified("passwordHash")) return next();

    try {
        const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
        this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
        next();
    } catch (err) {
        next(err);
    }
});

userSchema.index({ email: 1 }, { unique: true });

const User = mongoose.model("User", userSchema);

// CommonJS의 'module.exports' 대신 ESM의 'export default' 사용
export default User;
