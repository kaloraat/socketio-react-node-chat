import express from "express";
import cors from "cors";
import chat from "./controllers/chat";
require("dotenv").config();

// app
const app = express();
const http = require("http").createServer(app);

// socket io
const io = require("socket.io")(http, {
  path: "/socket.io",
  cors: {
    origin: [process.env.DOMAIN],
    methods: ["GET", "POST"],
    allowedHeaders: ["content-type"],
  },
});

// middlewares
app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

// rest api
app.get("/api", (req, res) => {
  res.send("THIS IS REST API!");
});

// socket
chat(io);

const port = process.env.PORT || 8000;
http.listen(port, () => console.log(`Server running on port ${port}`));
