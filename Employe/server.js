import express from "express";
import cors from "cors";

import { connectDB } from "./config/db.js";
import employeeRoutes from "./routes/routes.js";

const app = express();


// Middleware
app.use(cors());
app.use(express.json());


// Database
connectDB();


// Routes
app.use("/api/employees", employeeRoutes);


// Home
app.get("/", (req, res) => {
    res.send("Employee Management System Running");
});


// Server
app.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
});