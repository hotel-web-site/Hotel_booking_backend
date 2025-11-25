// services/reviewService.js
const Review = require("./model");

exports.createReview = async ({ userId, hotel, rating, comment }) => {
    return await Review.create({
        user: userId,
        hotel,
        rating,
        comment,
    });
};

exports.getAllReviews = async () => {
    return await Review.find()
        .populate("user", "name email")
        .populate("hotel", "name address")
        .sort({ createdAt: -1 });
};

exports.getReviewById = async (reviewId) => {
    return await Review.findById(reviewId)
        .populate("user", "name email")
        .populate("hotel", "name address");
};

exports.getReviewsByHotel = async (hotelId) => {
    return await Review.find({ hotel: hotelId })
        .populate("user", "name email")
        .sort({ createdAt: -1 });
};

exports.getReviewsByUser = async (userId) => {
    return await Review.find({ user: userId })
        .populate("hotel", "name")
        .sort({ createdAt: -1 });
};

exports.updateReview = async (review, updateData) => {
    Object.assign(review, updateData);
    return await review.save();
};

exports.deleteReview = async (review) => {
    return await review.deleteOne();
};

exports.findById = async (reviewId) => {
    return await Review.findById(reviewId);
};
