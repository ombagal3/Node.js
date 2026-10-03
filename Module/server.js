// const main = require("./app.js");
// main.add(20,30);
// main.div(10,2);
// main.min(20,5);

import http from "http";

const server = http.createServer((req , res) => {

    res.writeHead(200,{"content-type":"text-/plain"});
    res.end("Hello NODE server");
});
 
server.listen(3000, () => {
    console.log("Hello Node server");
});

