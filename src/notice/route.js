import { Router } from 'express';
import * as noticeController from './controller.js';
import { verifyToken, isAdmin } from '../common/authMiddleware.js'; // 명칭 통일
import { s3Uploader } from '../common/s3Uploader.js';

const router = Router();

// 1. 공지 등록 (관리자 전용 + 이미지)
router.post('/',
    verifyToken,
    isAdmin,
    s3Uploader.array('noticeImages', 5),
    noticeController.create
);

// 2. 공지 목록 조회 (누구나 가능)
router.get('/', noticeController.getList);

// 3. 공지 상세 조회 (누구나 가능)
router.get('/:noticeId', noticeController.getOne);

// 4. 공지 수정 (관리자 전용)
router.patch('/:noticeId',
    verifyToken,
    isAdmin,
    noticeController.update
);

// 5. 공지 삭제 (관리자 전용)
router.delete('/:noticeId',
    verifyToken,
    isAdmin,
    noticeController.remove
);

export default router;