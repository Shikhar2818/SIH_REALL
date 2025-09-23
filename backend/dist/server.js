"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
const screenings_1 = __importDefault(require("./routes/screenings"));
const bookings_1 = __importDefault(require("./routes/bookings"));
const counsellors_1 = __importDefault(require("./routes/counsellors"));
const chat_1 = __importDefault(require("./routes/chat"));
const admin_1 = __importDefault(require("./routes/admin"));
const adminExtended_1 = __importDefault(require("./routes/adminExtended"));
const adminAnalytics_1 = __importDefault(require("./routes/adminAnalytics"));
const counsellor_1 = __importDefault(require("./routes/counsellor"));
const counsellorExtended_1 = __importDefault(require("./routes/counsellorExtended"));
const forum_1 = __importDefault(require("./routes/forum"));
const resources_1 = __importDefault(require("./routes/resources"));
const aiChat_1 = __importDefault(require("./routes/aiChat"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: 'Too many requests from this IP, please try again later.',
    skip: (req) => {
        return req.path === '/health' || req.path === '/health/detailed' || process.env.NODE_ENV === 'development';
    }
});
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
app.use(limiter);
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.get('/health', (req, res) => {
    const healthStatus = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        database: mongoose_1.default.connection.readyState === 1 ? 'connected' : 'disconnected',
        version: process.version,
    };
    res.json(healthStatus);
});
app.get('/health/detailed', (req, res) => {
    const detailedStatus = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100 + ' MB',
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100 + ' MB',
            external: Math.round(process.memoryUsage().external / 1024 / 1024 * 100) / 100 + ' MB',
        },
        database: {
            status: mongoose_1.default.connection.readyState === 1 ? 'connected' : 'disconnected',
            host: mongoose_1.default.connection.host,
            port: mongoose_1.default.connection.port,
            name: mongoose_1.default.connection.name,
        },
        version: process.version,
        platform: process.platform,
        pid: process.pid,
    };
    res.json(detailedStatus);
});
app.use('/api/auth', auth_1.default);
app.use('/api/screenings', screenings_1.default);
app.use('/api/bookings', bookings_1.default);
app.use('/api/counsellors', counsellors_1.default);
app.use('/api/chat', chat_1.default);
app.use('/api/admin', admin_1.default);
app.use('/api/admin/extended', adminExtended_1.default);
app.use('/api/admin-analytics', adminAnalytics_1.default);
app.use('/api/counsellor', counsellor_1.default);
app.use('/api/counsellor/extended', counsellorExtended_1.default);
app.use('/api/forum', forum_1.default);
app.use('/api/resources', resources_1.default);
app.use('/api/ai-chat', aiChat_1.default);
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(500).json({
        error: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { details: err.message })
    });
});
const startServer = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/psychological_intervention?authSource=admin';
        const mongoOptions = {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            bufferCommands: false,
            maxIdleTimeMS: 30000,
            connectTimeoutMS: 10000,
        };
        await mongoose_1.default.connect(mongoUri, mongoOptions);
        console.log('Connected to MongoDB');
        mongoose_1.default.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });
        mongoose_1.default.connection.on('disconnected', () => {
            console.log('MongoDB disconnected. Attempting to reconnect...');
            setTimeout(startServer, 5000);
        });
        mongoose_1.default.connection.on('reconnected', () => {
            console.log('MongoDB reconnected');
        });
        if (process.env.ALLOW_MINIMAL_SEED === 'true') {
            const { seedDatabase } = await Promise.resolve().then(() => __importStar(require('./scripts/seed')));
            const { seedUsers } = await Promise.resolve().then(() => __importStar(require('./scripts/seedUsers')));
            await seedDatabase();
            await seedUsers();
        }
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Health check: http://localhost:${PORT}/health`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        setTimeout(startServer, 5000);
    }
};
startServer();
process.on('SIGINT', async () => {
    console.log('Received SIGINT. Gracefully closing MongoDB connection...');
    try {
        await mongoose_1.default.connection.close();
        console.log('MongoDB connection closed.');
    }
    catch (error) {
        console.error('Error closing MongoDB connection:', error);
    }
    process.exit(0);
});
process.on('SIGTERM', async () => {
    console.log('Received SIGTERM. Gracefully closing MongoDB connection...');
    try {
        await mongoose_1.default.connection.close();
        console.log('MongoDB connection closed.');
    }
    catch (error) {
        console.error('Error closing MongoDB connection:', error);
    }
    process.exit(0);
});
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
exports.default = app;
//# sourceMappingURL=server.js.map