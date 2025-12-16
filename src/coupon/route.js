import { Router } from 'express';
import * as couponController from './controller.js';
import { authMiddleware, adminAuthMiddleware } from '../common/authMiddleware.js';

const router = Router();

// 1. 쿠폰 생성 (관리자)
router.post('/',
    authMiddleware,
    adminAuthMiddleware,
    couponController.create
);

// 2. 쿠폰 목록 조회 (관리자)
router.get('/',
    authMiddleware,
    adminAuthMiddleware,
    couponController.getList
);

// 3. 쿠폰 수정 (관리자)
router.patch('/:couponId',
    authMiddleware,
    adminAuthMiddleware,
    couponController.update
);

// 4. 쿠폰 삭제 (관리자)
router.delete('/:couponId',
    authMiddleware,
    adminAuthMiddleware,
    couponController.remove
);

export default router;