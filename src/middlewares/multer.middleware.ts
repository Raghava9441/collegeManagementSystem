import multer from 'multer';
import fs from 'fs';
import path from 'path';

// Define the upload directory
const uploadDir = path.join(__dirname, '..', 'public', 'temp');

// Ensure the directory exists, create it if not
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

export const upload = multer({ storage: storage });
