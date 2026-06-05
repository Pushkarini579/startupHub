"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatUserResponse = void 0;
const formatUserResponse = (user) => ({
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    profileImage: user.profileImage,
    createdAt: user.createdAt,
});
exports.formatUserResponse = formatUserResponse;
