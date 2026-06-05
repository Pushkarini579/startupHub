import multer from 'multer';

// Memory storage is ideal since we stream buffer directly to Cloudinary or write to local disk
const storage = multer.memoryStorage();

// File size limit (10MB)
export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export default upload;
