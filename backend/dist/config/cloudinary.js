"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFile = void 0;
const cloudinary_1 = require("cloudinary");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const isCloudinaryConfigured = !!(process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET);
if (isCloudinaryConfigured) {
    cloudinary_1.v2.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    console.log('Cloudinary storage engine configured successfully.');
}
else {
    console.log('Cloudinary config missing. Using local filesystem storage fallback.');
}
const uploadFile = async (fileBuffer, fileName, folderName, mimeType) => {
    if (isCloudinaryConfigured) {
        try {
            return new Promise((resolve) => {
                const uploadStream = cloudinary_1.v2.uploader.upload_stream({
                    folder: `startuphub/${folderName}`,
                    resource_type: mimeType.includes('pdf') ? 'raw' : 'auto',
                    public_id: path_1.default.parse(fileName).name + '-' + Date.now(),
                }, (error, result) => {
                    if (error) {
                        console.error('Cloudinary upload stream failed. Falling back to local storage:', error);
                        resolve(saveLocally(fileBuffer, fileName));
                    }
                    else if (result) {
                        resolve(result.secure_url);
                    }
                    else {
                        resolve(saveLocally(fileBuffer, fileName));
                    }
                });
                uploadStream.end(fileBuffer);
            });
        }
        catch (error) {
            console.error('Cloudinary upload operation failed. Falling back to local storage:', error);
            return saveLocally(fileBuffer, fileName);
        }
    }
    else {
        return saveLocally(fileBuffer, fileName);
    }
};
exports.uploadFile = uploadFile;
const saveLocally = async (fileBuffer, fileName) => {
    const uploadsDir = path_1.default.join(__dirname, '..', '..', 'public', 'uploads');
    if (!fs_1.default.existsSync(uploadsDir)) {
        fs_1.default.mkdirSync(uploadsDir, { recursive: true });
    }
    const cleanFileName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9_.-]/g, '_')}`;
    const filePath = path_1.default.join(uploadsDir, cleanFileName);
    fs_1.default.writeFileSync(filePath, fileBuffer);
    // Return relative path for local storage to ensure portability across different environments
    return `/uploads/${cleanFileName}`;
};
