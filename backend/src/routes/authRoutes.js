const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const authController = require("../controllers/authController");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", auth, authController.getMe);
router.post("/logout", auth, authController.logout);
router.put("/profile", auth, authController.updateProfile);
router.put("/change-password", auth, authController.changePassword);
router.delete("/deactivate", auth, authController.deactivate);
router.get("/users", auth, authController.getAllUsers);

module.exports = router;
