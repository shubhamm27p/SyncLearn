import express from "express";
import { createServer } from "node:http";
import cors from "cors";
import helmet from "helmet";
import { connectToSocket } from "./controllers/socketmanager.js";
import userRouter from "./routes/usersRouter.js";
import { supabase } from "./utils/supabase.js";
import { globalLimiter } from "./middlewares/rateLimiter.js";
import { errorHandler } from "./middlewares/errorHandler.js";

// Load environment variables from .env if present
try {
    process.loadEnvFile();
} catch (e) {
    // .env file optional
}

// ---------------------------------------------------------
// High Net Crashdown Limiter: Process Level Exception Catchers
// Prevent the server from hard crashing on unexpected errors
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! Shutting down gracefully...');
    console.error(err.name, err.message, err.stack);
    process.exit(1);
});

process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! Shutting down gracefully...');
    console.error(err.name, err.message, err.stack);
    process.exit(1);
});
// ---------------------------------------------------------

const app = express();
const server = createServer(app);

const io = connectToSocket(server);

app.set("port", (process.env.PORT || 8000));

// ---------------------------------------------------------
// Security Middlewares
// 1. Helmet: Secures HTTP headers
app.use(helmet());

// 2. Global Rate Limiter: Limits requests from a single IP
app.use(globalLimiter);
// ---------------------------------------------------------

// Allow all Vercel preview URLs + the specific production URL
const allowedOrigins = process.env.NODE_ENV === "production" && process.env.FRONTEND_URL
    ? [
        process.env.FRONTEND_URL,                // Main production URL
        /https:\/\/.*\.vercel\.app$/,            // Any Vercel preview URL
        "http://localhost:5173",                 // Local dev
        "http://localhost:3000",                 // Local dev alt port
      ]
    : "*";

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

app.use(express.json({limit: "49kb"}));
app.use(express.urlencoded({limit: "40kb", extended: true}));

// Routes
app.use("/api/v1/users", userRouter);

// Global Error Handler Middleware
app.use(errorHandler);

// Export app for testing purposes
export { app };

// Start Server if not imported by tests
if (process.env.NODE_ENV !== 'test') {
    server.listen(app.get("port"), async () => {
        console.log(`Server listening on port ${app.get("port")}`);
        
        // Verify Supabase Connection
        try {
            const { data, error } = await supabase.from('users').select('id').limit(1);
            if (error) throw error;
            console.log("Supabase connection established successfully.");
        } catch (err) {
            console.error("Supabase Connection Error:", err.message);
        }
    });
}