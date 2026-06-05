"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const projectController_1 = require("../controllers/projectController");
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const uploadMiddleware_1 = __importDefault(require("../middleware/uploadMiddleware"));
const router = (0, express_1.Router)();
router.use(authMiddleware_1.default);
router.get('/', projectController_1.getProjects);
router.get('/:id', projectController_1.getProjectById);
router.post('/', uploadMiddleware_1.default.single('attachment'), projectController_1.createProject);
router.put('/:id', uploadMiddleware_1.default.single('attachment'), projectController_1.updateProject);
router.delete('/:id', projectController_1.deleteProject);
exports.default = router;
