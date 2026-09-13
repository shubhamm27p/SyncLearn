import express from "express";
import { createServer } from "node:http";
import cors from "cors";
import helmet from "helmet";
import { connectToSocket } from "./controllers/socketmanager.js";
import userRouter from "./routes/usersRouter.js";
import { supabase } from "./utils/supabase.js";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcrypt";
import { globalLimiter } from "./middlewares/rateLimiter.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { authMiddleware } from "./middlewares/authMiddleware.js";
import webhookRouter from "./routes/webhookRoutes.js";

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

const ensureAdminAccount = async () => {
    const adminUsername = process.env.ADMIN_USERNAME || 'synclearn_admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'SyncAdmin@2026!';

    try {
        const { data: existing, error: lookupError } = await supabase
            .from('users')
            .select('id, role')
            .or(`username.eq.${adminUsername},email.eq.${adminUsername}`)
            .maybeSingle();

        if (lookupError) {
            console.warn("Admin lookup warning:", lookupError.message);
        }

        if (existing) {
            console.log(`Admin account confirmed in database: ${adminUsername} (${existing.role})`);
            return;
        }

        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        const { error: insertError } = await supabase.from('users').insert([{
            name: process.env.ADMIN_NAME || 'System Admin',
            username: adminUsername,
            email: process.env.ADMIN_EMAIL || `${adminUsername}@synclearn.edu`,
            password: hashedPassword,
            role: 'admin',
            is_active: true
        }]);

        if (insertError) {
            console.warn("Admin account auto-insert warning:", insertError.message);
        } else {
            console.log(`Admin account created successfully: ${adminUsername}`);
        }
    } catch (err) {
        console.error("Admin bootstrap error:", err.message);
    }
};

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

import mcqModule from './mcq/server.js';
const { mcqApp, initMCQDB } = mcqModule;

// API Gateway to MCQ Backend
app.use(
    "/api/mcq",
    authMiddleware,
    (req, res, next) => {
        // Inject Supabase user info securely into headers
        req.headers['x-auth-user'] = JSON.stringify(req.user);
        req.headers['x-gateway-secret'] = process.env.GATEWAY_SECRET || "super_secret_gateway_key_2026";
        next();
    },
    mcqApp
);

// Mount webhooks BEFORE express.json() so raw body is preserved
app.use("/api/v1/webhooks", webhookRouter);

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
            await ensureAdminAccount();
            
            // Initialize MCQ DB (MongoDB)
            await initMCQDB();
            console.log("MCQ Engine initialized successfully.");
        } catch (err) {
            console.error("Supabase Connection Error:", err.message);
        }
    });
}