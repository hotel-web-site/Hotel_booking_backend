import Review from "./model.js";

const reviewService = {
    createReview: async ({ userId, hotel, rating, comment }) => {
        return await Review.create({
            user: userId,
            hotel,
            rating,
            comment,
        });
    },

    getAllReviews: async () => {
        return await Review.find()
            .populate("user", "name email")
            .populate("hotel", "name address")
            .sort({ createdAt: -1 });
    },

    getReviewById: async (reviewId) => {
        return await Review.findById(reviewId)
            .populate("user", "name email")
            .populate("hotel", "name address");
    },

    getReviewsByHotel: async (hotelId) => {
        return await Review.find({ hotel: hotelId })
            .populate("user", "name email")
            .sort({ createdAt: -1 });
    },

    getReviewsByUser: async (userId) => {
        return await Review.find({ user: userId })
            .populate("hotel", "name")
            .sort({ createdAt: -1 });
    },

    updateReview: async (review, updateData) => {
        Object.assign(review, updateData);
        return await review.save();
    },

    deleteReview: async (review) => {
        return await review.deleteOne();
    },

    findById: async (reviewId) => {
        return await Review.findById(reviewId);
    },
};

export default reviewService;
