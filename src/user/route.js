const express = require("express");
const router = express.Router();
const { verifyToken } = require("../common/authMiddleware"); // named import
const controller = require("./controller");

router.post("/register", controller.register);
router.post("/login", controller.login);
router.get("/me", verifyToken, controller.getMe);
router.put("/profile", verifyToken, controller.updateProfile);
router.put("/change-password", verifyToken, controller.changePassword);
router.delete("/deactivate", verifyToken, controller.deactivate);
router.get("/users", verifyToken, controller.getAllUsers);

module.exports = router;
