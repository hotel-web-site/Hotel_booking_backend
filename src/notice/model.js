import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "제목은 필수입니다."]
    },
    content: {
        type: String,
        required: [true, "내용은 필수입니다."]
    },
    isPinned: {
        type: Boolean,
        default: false
    }, // 상단 고정 여부
    views: {
        type: Number,
        default: 0
    },
}, { timestamps: true });

export const Notice = mongoose.model("Notice", noticeSchema);