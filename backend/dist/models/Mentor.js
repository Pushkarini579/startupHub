"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mentor = void 0;
const mongoose_1 = require("mongoose");
const mentorSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Mentor name is required'],
        trim: true,
    },
    expertise: {
        type: String,
        required: [true, 'Expertise area is required'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        lowercase: true,
        trim: true,
    },
    profileImage: {
        type: String,
        default: '',
    },
    startupAssigned: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Startup',
        required: [true, 'Startup assignment is required'],
    },
}, {
    timestamps: true,
});
exports.Mentor = (0, mongoose_1.model)('Mentor', mentorSchema);
exports.default = exports.Mentor;
