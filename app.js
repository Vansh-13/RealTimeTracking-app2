const express = require('express');
const path = require('path');
const app = express();
const http = require("http");
const socket = require('socket.io');
const server = http.createServer(app);
const io = socket(server);

app.set("view engine", 'ejs');
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.render("index");
}); // Corrected the extra character 'a'

io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("send-location", (data) => {
        io.emit("receive-location", { id: socket.id, ...data });
    });

    socket.on("disconnect", () => {
        io.emit("user-disconnect", socket.id);
    });
});

server.listen(3003, (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log("Server is running on port 3003");
    }
});
