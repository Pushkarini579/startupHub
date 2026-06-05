import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

const isCloudinaryConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('Cloudinary storage engine configured successfully.');
} else {
  console.log('Cloudinary config missing. Using local filesystem storage fallback.');
}

export const uploadFile = async (
  fileBuffer: Buffer,
  fileName: string,
  folderName: string,
  mimeType: string
): Promise<string> => {
  if (isCloudinaryConfigured) {
    try {
      return new Promise((resolve) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `startuphub/${folderName}`,
            resource_type: mimeType.includes('pdf') ? 'raw' : 'auto',
            public_id: path.parse(fileName).name + '-' + Date.now(),
          },
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload stream failed. Falling back to local storage:', error);
              resolve(saveLocally(fileBuffer, fileName));
            } else if (result) {
              resolve(result.secure_url);
            } else {
              resolve(saveLocally(fileBuffer, fileName));
            }
          }
        );
        uploadStream.end(fileBuffer);
      });
    } catch (error) {
      console.error('Cloudinary upload operation failed. Falling back to local storage:', error);
      return saveLocally(fileBuffer, fileName);
    }
  } else {
    return saveLocally(fileBuffer, fileName);
  }
};

const saveLocally = async (fileBuffer: Buffer, fileName: string): Promise<string> => {
  const uploadsDir = path.join(__dirname, '..', '..', 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  const cleanFileName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9_.-]/g, '_')}`;
  const filePath = path.join(uploadsDir, cleanFileName);
  fs.writeFileSync(filePath, fileBuffer);

  // Return relative path for local storage to ensure portability across different environments
  return `/uploads/${cleanFileName}`;
};
