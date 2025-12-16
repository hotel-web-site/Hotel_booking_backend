import { Schema, model } from 'mongoose';

const noticeSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        content: {
            type: String,
            required: true,
        },
        // 작성자 (관리자 ID)
        author: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        // 공지 이미지 (S3 URL)
        images: [
            { type: String },
        ],
        // 중요 공지 여부 (상단 고정용)
        isImportant: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

export default model('Notice', noticeSchema);