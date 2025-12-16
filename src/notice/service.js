import Notice from './model.js';
import { s3 } from '../common/s3Uploader.js';
import { DeleteObjectsCommand } from '@aws-sdk/client-s3';

// 1. 공지 생성
export const createNotice = async (adminId, data, files) => {
    const imageUrls = files ? files.map(f => f.location) : [];

    const notice = await Notice.create({
        author: adminId,
        title: data.title,
        content: data.content,
        isImportant: data.isImportant === 'true', // 폼데이터는 문자열로 옴
        images: imageUrls,
    });
    return notice;
};

// 2. 공지 목록 조회 (페이지네이션 + 중요공지 상단)
export const getNoticeList = async (page = 1, limit = 10) => {
    const skip = (page - 1) * limit;

    // 중요 공지 먼저, 그 다음 최신순
    const notices = await Notice.find()
        .sort({ isImportant: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', 'name'); // 작성자 이름만

    const total = await Notice.countDocuments();

    return { notices, total, page, totalPages: Math.ceil(total / limit) };
};

// 3. 공지 상세 조회
export const getNoticeById = async (noticeId) => {
    const notice = await Notice.findById(noticeId).populate('author', 'name');
    if (!notice) throw new Error('공지사항이 없습니다.');
    return notice;
};

// 4. 공지 삭제 (S3 이미지 포함)
export const deleteNotice = async (noticeId) => {
    const notice = await Notice.findById(noticeId);
    if (!notice) throw new Error('공지사항이 없습니다.');

    // S3 이미지 삭제
    if (notice.images && notice.images.length > 0) {
        try {
            const keys = notice.images.map((url) => {
                const urlParts = new URL(url);
                return { Key: decodeURIComponent(urlParts.pathname.substring(1)) };
            });
            await s3.send(new DeleteObjectsCommand({
                Bucket: process.env.S3_BUCKET,
                Delete: { Objects: keys }
            }));
        } catch (err) {
            console.error('⚠️ Notice S3 삭제 실패:', err);
        }
    }

    await Notice.findByIdAndDelete(noticeId);
    return true;
};

// 5. 공지 수정 (텍스트만 - 이미지 수정은 복잡하니 일단 패스 ㅋ)
export const updateNotice = async (noticeId, data) => {
    const notice = await Notice.findByIdAndUpdate(
        noticeId,
        {
            title: data.title,
            content: data.content,
            isImportant: data.isImportant === 'true'
        },
        { new: true }
    );
    if (!notice) throw new Error('공지사항이 없습니다.');
    return notice;
};