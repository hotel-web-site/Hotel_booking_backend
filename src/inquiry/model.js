import mongoose from "mongoose";

const inquirySchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        title: { type: String, required: true },
        summary: { type: String, required: true }, // "문의 요약" 부분
        content: { type: String, required: true }, // "문의 내용 상세"
        status: {
            type: String,
            enum: ["pending", "answered"],
            default: "pending"
        },
        answer: { type: String }, // 관리자 답변 내용
    },
    { timestamps: true }
);

export const Inquiry = mongoose.model("Inquiry", inquirySchema);