// const express = require("express");
// // const bodyParser = require('body-parser');
// const cors = require("cors");
// const mongoose = require("mongoose");
// require("dotenv").config();

// const userRoutes = require("./routes/userRoutes");
// const emailRoutes = require("./routes/emailRoutes");

// const app = express();
// const PORT = process.env.PORT || 8080;

// app.use(
//   cors({
//     origin: "*",
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true,
//   })
// );
// app.use(express.json());

// mongoose
//   .connect(process.env.MONGODB_URI)
//   .then(() => {
//     console.log("MongoDB connected");
//     app.listen(PORT, () => {
//       console.log(`Server is running on port ${PORT}`);
//     });
//   })
//   .catch((err) => console.log(err));

// app.use("/api/user", userRoutes);
// app.use("/api/email", emailRoutes);


const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const userRoutes = require("./routes/userRoutes");
const emailRoutes = require("./routes/emailRoutes");

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL ,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());

// HTTP server
const server = http.createServer(app);

// Socket.IO server
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL ,
    methods: ["GET", "POST"],
  },
});

// 🔥 Make io accessible in routes
app.set("io", io);

// Socket logic
io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  /**
   * Client should emit:
   * socket.emit("join", userId)
   */
  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`👤 User ${userId} joined room`);
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// Routes
app.use("/api/user", userRoutes);
app.use("/api/email", emailRoutes);
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// DB + Server start
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.log(err));