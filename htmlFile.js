const http = require("http");
const requestListener = function (req, res) {
    res.writeHead(200);
    res.end("My first server!");
};
