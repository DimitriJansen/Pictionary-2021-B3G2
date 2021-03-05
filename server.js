// LOAD
const express = require("express");
const socketIO = require("socket.io");

// SETUP SERVER
const port = process.env.PORT || 3000;
const index = "/index.html";

const server = express()
.use((req, res) => {
    res.sendFile(index, { root: __dirname})
})
.listen(port, () => {
    console.log(`Server started on port : ${port}`);
});

// SETUP SOCKET
const io = socketIO(server);

let users = [];
let currentPlayer = null;
let timeout = null;
const words = [pikachu, carapuce, salamèche];

io.on("connection", (socket) => {
    socket.on("username", (username) => {
        console.log(`${username} joined the game.`);

        socket.username = username;

        users.push(socket);
        sendUsers();
    });

    socket.on("disconnect", () => {
        users = users.filter((user) => {
            return user !== socket;
        });
        sendUsers();

        if (users.length === 1) {
            currentPlayer = socket;
            switchPlayer();
        }
    });

    socket.on("line", (data) => {
        socket.broadcast.emit("line", data);
    });
});

function sendUsers () {
    const usersData = users.map((user) => {
        return {
            username: user.username,
            isActive: user === currentPlayer
        }
    });
    io.emit("users", usersData);
}

function switchPlayer () {
    timeout = setTimeout(switchPlayer, 15000);

    const indexCurrentPlayer = users.indexOf(currentPlayer);
    currentPlayer = users [(indexCurrentPlayer+1) % users.length];

    sendUsers();

    const nextWord = words[Math.floor(Math.random() * words.legnth)];
    currentPlayer.emit("word", nextWord);

    io.emit("clear");
}