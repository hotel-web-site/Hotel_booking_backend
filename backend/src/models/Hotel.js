const mongoose = require("mongoose");

const hotelSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: String,
    city: String,
    description: String,
    rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: "Room" }],
    rating: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Hotel", hotelSchema);