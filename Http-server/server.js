const http = require("http");
const fs = require("fs");

const PORT = 3000;

const server = http.createServer((req, res) => {
    const currentDateTime = new Date().toLocaleString();


    res.setHeader("Content-Type", "application/json");

    
    if (req.method === "GET" && req.url === "/") {
        res.writeHead(200);
        res.end(JSON.stringify({
            message: "GET Request Successfully Handled",
            date: currentDateTime
        }));
    }

    
    else if (req.method === "POST" && req.url === "/data") {
        let body = "";

        req.on("data", chunk => {
            body += chunk.toString();
        });

        req.on("end", () => {
            res.writeHead(201);
            res.end(JSON.stringify({
                message: "POST Request Successfully Handled",
                receivedData: body,
                date: currentDateTime
            }));
        });
    }

    else if (req.method === "PUT" && req.url === "/data") {
        let body = "";

        req.on("data", chunk => {
            body += chunk.toString();
        });

        req.on("end", () => {
            res.writeHead(200);
            res.end(JSON.stringify({
                message: "PUT Request Successfully Handled",
                updatedData: body,
                date: currentDateTime
            }));
        });
    }

    
    else if (req.method === "DELETE" && req.url === "/data") {
        res.writeHead(200);
        res.end(JSON.stringify({
            message: "DELETE Request Successfully Handled",
            date: currentDateTime
        }));
    }


    else {
        res.writeHead(404);
        res.end(JSON.stringify({
            message: "Route Not Found",
            date: currentDateTime
        }));
    }
});


server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Date & Time: ${new Date().toLocaleString()}`);
});