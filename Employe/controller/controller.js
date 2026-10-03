import Employee from "../module/module.js";

// ADD EMPLOYEE
export const addEmployee = async (req, res) => {
    try {
        const employee = new Employee(req.body);

        await employee.save();

        res.status(201).json({
            message: "Employee added successfully",
            employee: employee
        });
    } 
    catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};


// DISPLAY EMPLOYEES
export const getEmployees = async (req, res) => {
    try {
        const employees = await Employee.find();

        res.status(200).json(employees);
    } 
    catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};


// UPDATE EMPLOYEE
export const updateEmployee = async (req, res) => {
    try {
        const employee = await Employee.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!employee) {
            return res.status(404).json({
                message: "Employee not found"
            });
        }

        res.status(200).json({
            message: "Employee updated successfully",
            employee: employee
        });
    } 
    catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};


// DELETE EMPLOYEE
export const deleteEmployee = async (req, res) => {
    try {
        const employee = await Employee.findByIdAndDelete(
            req.params.id
        );

        if (!employee) {
            return res.status(404).json({
                message: "Employee not found"
            });
        }

        res.status(200).json({
            message: "Employee deleted successfully"
        });
    } 
    catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};