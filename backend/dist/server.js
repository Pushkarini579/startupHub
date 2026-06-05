"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
const db_1 = require("./config/db");
// Routes
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const startupRoutes_1 = __importDefault(require("./routes/startupRoutes"));
const projectRoutes_1 = __importDefault(require("./routes/projectRoutes"));
const mentorRoutes_1 = __importDefault(require("./routes/mentorRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const analyticsRoutes_1 = __importDefault(require("./routes/analyticsRoutes"));
const newsRoutes_1 = __importDefault(require("./routes/newsRoutes"));
// Load Env
dotenv_1.default.config();
// Create Express Server
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Connect Database
(0, db_1.connectDB)();
// CORS Configuration
const defaultOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];
const configuredOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map((origin) => origin.trim()).filter(Boolean)
    : defaultOrigins;
const corsOptions = {
    origin: configuredOrigins,
    credentials: true,
    optionsSuccessStatus: 200,
};
app.use((0, cors_1.default)(corsOptions));
// Body Parser
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Serve local uploads statically
const uploadsPath = path_1.default.join(__dirname, '..', 'public', 'uploads');
app.use('/uploads', express_1.default.static(uploadsPath));
console.log(`Static file upload directory served from: ${uploadsPath}`);
// API Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/startups', startupRoutes_1.default);
app.use('/api/projects', projectRoutes_1.default);
app.use('/api/mentors', mentorRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.use('/api/analytics', analyticsRoutes_1.default);
app.use('/api/news', newsRoutes_1.default);
// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'StartupHub API is active and healthy.' });
});
// 404 Route handler
app.use((req, res) => {
    res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});
// Multer / upload error handler
app.use((err, req, res, next) => {
    if (err instanceof multer_1.default.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'File too large. Maximum upload size is 10MB.' });
        }
        return res.status(400).json({ message: err.message });
    }
    if (err?.message?.includes('Invalid file type')) {
        return res.status(400).json({ message: err.message });
    }
    next(err);
});
// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled Server Error:', err);
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err : {},
    });
});
// Launch server
app.listen(PORT, () => {
    console.log(`[StartupHub Backend] running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
