import { Router } from 'express';
import * as inquiryController from './controller.js';
import { verifyToken, isAdmin } from '../common/authMiddleware.js'; // 명칭 수정

const router = Router();

// 1. 문의 등록 (로그인한 누구나)
router.post('/', verifyToken, inquiryController.create);

// 2. 목록 조회 (유저는 본인 것만, 관리자는 전체)
router.get('/', verifyToken, inquiryController.getList);

// 3. 상세 조회
router.get('/:inquiryId', verifyToken, inquiryController.getOne);

// 4. 답변 등록 (관리자만)
router.post('/:inquiryId/reply', verifyToken, isAdmin, inquiryController.reply);

// 5. 삭제 (본인 or 관리자)
router.delete('/:inquiryId', verifyToken, inquiryController.remove);

export default router;