// -------------------------------
// Payment Route (ESM)
// -------------------------------

import express from "express";
import { verifyToken } from "../common/authMiddleware.js";
import {
    preparePayment,
    confirmPayment,
    cancelPayment,
} from "./controller.js";

const router = express.Router();

router.post("/prepare", verifyToken, preparePayment);
router.post("/confirm", verifyToken, confirmPayment);
router.post("/cancel/:bookingId", verifyToken, cancelPayment);

export default router;
