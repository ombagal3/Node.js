import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017/employeeDB");

        console.log("Database connected successfully");
    } 
    catch (err) {
        console.log("Database connection failed : error- " + err.message);
    }
};