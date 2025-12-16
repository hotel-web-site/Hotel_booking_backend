import mongoose from "mongoose";
import bcrypt from "bcrypt";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userSchema = new mongoose.Schema(
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

        // 🔥 반드시 필요한 필드
        loginAttempts: { type: Number, default: 0 },
        isLoggined: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// 비밀번호 비교
userSchema.methods.comparePassword = function (plain) {
    return bcrypt.compare(plain, this.passwordHash);
};

// 자동 해싱
userSchema.pre("save", async function (next) {
    if (!this.isModified("passwordHash")) return next();

    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
});

// 비밀번호 제거
userSchema.methods.toSafeJSON = function () {
    const obj = this.toObject({ versionKey: false });
    delete obj.passwordHash;
    return obj;
};

userSchema.index({ email: 1 }, { unique: true });

const User = mongoose.model("User", userSchema);

// CommonJS의 'module.exports' 대신 ESM의 'export default' 사용
export default User;
