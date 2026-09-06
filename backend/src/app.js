import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import dns from "node:dns";
import { connectToSocket } from "./controllers/socketmanager.js";
import userRouter from "./routes/usersRouter.js";

// Load environment variables from .env if present
try {
    process.loadEnvFile();
} catch (e) {
    // .env file optional
}

// Set DNS servers to ensure MongoDB SRV records resolve properly on Windows
try {
    dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (e) {
    console.warn("Could not set DNS servers:", e.message);
}

const app = express();

const server = createServer(app);
const io = connectToSocket(server);

app.set("port", (process.env.PORT || 8000));
app.use(cors());
app.use(express.json({limit: "49kb"}));
app.use(express.urlencoded({limit: "40kb", extended: true}));

app.use("/api/v1/users", userRouter);

server.listen(app.get("port"), () => {
    console.log(`Server listening on port ${app.get("port")}`);
});

const connectDB = async () => {
    try {
        const mongoUrl = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/viora";
        const connectionDb = await mongoose.connect(mongoUrl, { serverSelectionTimeoutMS: 3000 });
        console.log(`MONGO connected DB host: ${connectionDb.connection.host}`);
    } catch (err) {
        console.error("MongoDB Connection Error:", err.message);
        try {
            console.log("Attempting fallback to local MongoDB...");
            const fallbackDb = await mongoose.connect("mongodb://127.0.0.1:27017/viora", { serverSelectionTimeoutMS: 3000 });
            console.log(`MONGO connected to local DB host: ${fallbackDb.connection.host}`);
        } catch (fallbackErr) {
            console.error("Local MongoDB Fallback Error:", fallbackErr.message);
        }
    }
};

connectDB();