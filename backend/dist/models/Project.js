"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Project = void 0;
const mongoose_1 = require("mongoose");
const projectSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, 'Project title is required'],
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Project description is required'],
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium',
    },
    status: {
        type: String,
        enum: ['To Do', 'In Progress', 'Under Review', 'Completed'],
        default: 'To Do',
    },
    deadline: {
        type: Date,
        required: [true, 'Deadline is required'],
    },
    startupId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Startup',
        required: [true, 'Startup ID reference is required'],
    },
    assignedUser: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Assigned user reference is required'],
    },
    attachment: {
        type: String,
        default: '',
    },
}, {
    timestamps: true,
});
exports.Project = (0, mongoose_1.model)('Project', projectSchema);
exports.default = exports.Project;
