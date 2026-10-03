import express from "express";

import {
    addEmployee,
    getEmployees,
    updateEmployee,
    deleteEmployee
} from "../controller/controller.js";

const router = express.Router();


router.post("/add", addEmployee);
router.get("/", getEmployees);
router.put("/update/:id", updateEmployee);
router.delete("/delete/:id", deleteEmployee);


export default router;