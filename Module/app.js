// const add = (a,b) => {
//     console.log("addition is",a+b);

// };
// const div = (a,b) => {
//     console.log("division is a",a/b);

// }; 
// const mul = (a,b) => {
//     console.log("Multification is a",a*b);

// };
// const min = (a,b) => {
//     console.log("is a",a-b);
// }

// module.exports = {add, div, min};

import fs from "fs" // fs is file system module which is used to create, read, update and delete files in node js

fs.writeFileSync("note.txt","Hello World"); // to create a file and write data into it
fs.appendFileSync("note.txt","\nTo the new line "); // to append data into a file
const data = fs.readFileSync("note.txt", "utf-8");
console.log(data);


// How to create a Folder in node js in terminal
// mkdir foldername 
// add package.json file in node js in terminal
// npm init -y
// npm install express

