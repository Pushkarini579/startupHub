"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const uploadMiddleware_1 = __importDefault(require("../middleware/uploadMiddleware"));
const router = (0, express_1.Router)();
router.post('/register', uploadMiddleware_1.default.single('profileImage'), authController_1.register);
router.post('/login', authController_1.login);
router.get('/me', authMiddleware_1.default, authController_1.getMe);
router.put('/profile', authMiddleware_1.default, uploadMiddleware_1.default.single('profileImage'), authController_1.updateProfile);
exports.default = router;
