const users = [];

const addUser = (username) => {
  const name = username.trim().toLowerCase();
  const existingUser = users.find((u) => u === name);
  if (!username.trim()) return { error: "Name is required" };
  if (existingUser) {
    return {
      error: "Name is taken",
    };
  } else {
    users.push(name);
    return username;
  }
};

const chat = (io) => {
  // middleware
  io.use((socket, next) => {
    const username = socket.handshake.auth.username;
    if (!username) {
      return next(new Error("invalid username"));
    }
    socket.username = username;
    next();
  });
  //   console.log("live chat ---> ", io.opts);
  io.on("connection", (socket) => {
    // console.log("socket id", socket.id);
    // socket.on("username", (username, next) => {
    //   // console.log("username", username);
    //   // io.emit("user joined", `${username} joined`);
    //   let result = addUser(username);
    //   if (result.error) {
    //     return next(result.error);
    //   } else {
    //     io.emit("users", users);
    //     socket.broadcast.emit("user joined", `${username} joined`);
    //   }
    // });

    let users = [];
    for (let [id, socket] of io.of("/").sockets) {
      const existingUser = users.find((u) => u.username === socket.username);
      if (existingUser) {
        socket.emit("username taken");
        socket.disconnect();
        return;
      } else {
        users.push({
          userID: id,
          username: socket.username,
        });
      }
    }

    socket.emit("users", users);

    // when a new user joins, nofity existing users
    socket.broadcast.emit("user connected", {
      userID: socket.id,
      username: socket.username,
    });

    socket.on("message", (data) => {
      io.emit("message", data);
    });

    socket.on("typing", (username) => {
      // console.log("typing", username);
      socket.broadcast.emit("typing", `${username} is typing...`);
    });

    socket.on("private message", ({ message, to }) => {
      socket.to(to).emit("private message", {
        message,
        from: socket.id,
      });
    });

    // disconnect
    socket.on("disconnect", () => {
      // console.log("user disconnected");
      socket.broadcast.emit("user disconnected", socket.id);
    });
  });
};

export default chat;
