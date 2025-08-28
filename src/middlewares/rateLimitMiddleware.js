import rateLimit from "express-rate-limit";

// Custom rate limiter middleware
export const apiRateLimiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS
    ? parseInt(process.env.RATE_LIMIT_WINDOW_MS)
    : 60000, // 1 minute
  max: process.env.RATE_LIMIT_MAX ? parseInt(process.env.RATE_LIMIT_MAX) : 100, // limit each IP
  message: "Too many requests, please try again later.",
});
