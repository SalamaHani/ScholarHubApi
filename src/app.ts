import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import passport from "./config/passport.js";

import config from "./config/index.js";
import routes from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middleware/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Create Express app
const app: Express = express();

// ==================== SECURITY MIDDLEWARE ====================

// Helmet - secure HTTP headers
app.use(helmet());

// CORS
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3003",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  "http://127.0.0.1:3002",
  "http://127.0.0.1:3003",
  config.frontendUrl,
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// app.use("/api/", limiter);

// Stricter rate limit for auth routes
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 attempts per hour
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later.",
  },
});

// app.use("/api/auth/login", authLimiter);
// app.use("/api/auth/register", authLimiter);

// ==================== BODY PARSING ====================

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

// ==================== PASSPORT INITIALIZATION ====================

app.use(passport.initialize());
// Note: We don't use passport.session() because we use JWT, not sessions

// ==================== LOGGING ====================

if (config.env === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// ==================== STATIC FILES ====================

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ==================== ROUTES ====================

// API routes
app.use("/api", routes);

// Root route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to ScholarHub API",
    version: "1.0.0",
    documentation: "/api/docs",
  });
});

// ==================== ERROR HANDLING ====================

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;
