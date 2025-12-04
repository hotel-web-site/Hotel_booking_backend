import mongoose from "mongoose"; // require 대신 import 사용

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB 연결 성공");
    } catch (err) {
        console.error("MongoDB 연결 실패:", err.message);
        process.exit(1);
    }
};

// module.exports 대신 export default 사용
export default connectDB;