import rateLimit from 'express-rate-limit';

// Global Rate Limiter: Applies to all API requests
export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    message: { message: "Too many requests from this IP, please try again after 15 minutes." },
    standardHeaders: true,
    legacyHeaders: false,
});

// API Trigger Limiter: Strict limit for sensitive routes (e.g., login, register, password reset)
export const authLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes window
    max: 50, // Start blocking after 5 requests
    message: { message: "Too many authentication attempts from this IP, please try again after 5 minutes." },
    standardHeaders: true,
    legacyHeaders: false,
});
