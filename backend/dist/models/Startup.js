"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Startup = void 0;
const mongoose_1 = require("mongoose");
const startupSchema = new mongoose_1.Schema({
    startupName: {
        type: String,
        required: [true, 'Startup name is required'],
        trim: true,
    },
    industry: {
        type: String,
        required: [true, 'Industry is required'],
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
    },
    fundingStage: {
        type: String,
        enum: ['Ideation', 'Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C', 'Bootstrapped'],
        required: [true, 'Funding stage is required'],
    },
    logo: {
        type: String,
        default: '',
    },
    founderId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Founder ID is required'],
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending',
    },
    website: {
        type: String,
        default: '',
        trim: true,
    },
}, {
    timestamps: true,
});
exports.Startup = (0, mongoose_1.model)('Startup', startupSchema);
exports.default = exports.Startup;
