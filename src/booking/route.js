const express = require("express");
const router = express.Router();
const { verifyToken } = require("../common/authMiddleware");
const { createBooking, getBookings, getBookingById, cancelBooking } = require("./controller");

router.post("/", verifyToken, createBooking);
router.get("/", verifyToken, getBookings);
router.get("/:id", verifyToken, getBookingById);
router.delete("/:id", verifyToken, cancelBooking);

module.exports = router;
