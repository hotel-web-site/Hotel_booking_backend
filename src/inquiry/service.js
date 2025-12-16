import { Inquiry } from "./model.js";

export const createInquiry = async (inquiryData) => {
    return await Inquiry.create(inquiryData);
};

export const getUserInquiries = async (userId) => {
    return await Inquiry.find({ user: userId }).sort({ createdAt: -1 });
};

export const getInquiryDetail = async (id, userId) => {
    return await Inquiry.findOne({ _id: id, user: userId });
};