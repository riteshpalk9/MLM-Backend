import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import purchaseRoutes from "./routes/purchase.js";
import reportRoutes from "./routes/report.js";
import { auth } from "./middleware/auth.js";

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true, // required if you're using cookies or auth headers
  })
);
app.options("*", cors()); // Handle preflight requests

app.use(express.json());

// Make io available in requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/mlm-referral")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", auth, userRoutes);
app.use("/api/purchase", auth, purchaseRoutes);
app.use("/api/report", auth, reportRoutes);
app.get("/api/test", (req, res) => {
  res.send("Server is up and running!");
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-user-room", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 4862;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
