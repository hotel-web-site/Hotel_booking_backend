import { Router } from "express";
import { verifyToken } from "../common/authMiddleware.js";
import * as controller from "./controller.js";

const router = Router();

router.post("/register", controller.register);
router.post("/login", controller.login);
router.get("/me", verifyToken, controller.getMe);
router.put("/profile", verifyToken, controller.updateProfile);
router.put("/change-password", verifyToken, controller.changePassword);
router.delete("/deactivate", verifyToken, controller.deactivate);
router.get("/users", verifyToken, controller.getAllUsers);

export default router;
