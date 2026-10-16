const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AppError = require('../utils/AppError');

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_SIZE = 8 * 1024 * 1024; // 8 MB

const useS3 = process.env.STORAGE_DRIVER === 's3';

let storage;
if (useS3) {
  // S3 storage handled in uploadService.putObject — we buffer in memory
  storage = multer.memoryStorage();
} else {
  const dir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, dir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`);
    },
  });
}

const fileFilter = (req, file, cb) => {
  if (!ALLOWED.includes(file.mimetype)) return cb(new AppError('Unsupported file type', 400));
  cb(null, true);
};

const upload = multer({ storage, limits: { fileSize: MAX_SIZE }, fileFilter });

exports.uploadSingle = upload.single('file');
exports.uploadMultiple = upload.array('files', 5);
exports.isS3 = useS3;