// backend/src/middleware/upload.js
import multer from 'multer';

// Use memory storage for Firebase
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
    if (['avatarFile', 'bannerFile', 'thumbnailFile'].includes(file.fieldname)) {
        // Image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Invalid image file type'), false);
        }
    } else if (file.fieldname === 'videoFile') {
        // Video files
        if (file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Invalid video file type'), false);
        }
    } else {
        cb(new Error('Unexpected field'), false);
    }
};

// Create multer instance
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 100, // 100MB limit
    }
});

// Export middleware for different upload scenarios
export const uploadVideo = upload.fields([
    { name: 'videoFile', maxCount: 1 },
    { name: 'thumbnailFile', maxCount: 1 }
]);

export const uploadChannel = upload.fields([
    { name: 'avatarFile', maxCount: 1 },
    { name: 'bannerFile', maxCount: 1 }
]);