
import mongoose from "mongoose";

mongoose
.connect("mongodb://localhost:27017/studentDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch((err) => console.log(err));



const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    course: { type: String, required: true },
    city: { type: String },
},
{
    timestamps: true,
}
);

const Student = mongoose.model("Student", studentSchema);

await Student.create({
    name: "John Doe",
    age: 20,
    course: "Computer Science",
    city: "New York",
});