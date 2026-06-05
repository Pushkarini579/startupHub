"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'startuphub_super_secret_jwt_key_2026');
            const user = await User_1.User.findById(decoded.id).select('-password');
            if (!user) {
                return res.status(401).json({ message: 'User associated with this token no longer exists' });
            }
            req.user = user;
            next();
        }
        catch (error) {
            console.error('JWT Verification Error:', error);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }
    else {
        return res.status(401).json({ message: 'Not authorized, no token found' });
    }
};
exports.protect = protect;
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Forbidden: Access is denied. Requires one of these roles: [${roles.join(', ')}]`,
            });
        }
        next();
    };
};
exports.authorize = authorize;
exports.default = exports.protect;
