// src/middlewares/upload.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// UPLOAD_DIR: 절대 경로 public/uploads
const UPLOAD_DIR = path.resolve(__dirname, '../../public/uploads');

// 저장 위치 고정: public/uploads
function resolveDest() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
  return UPLOAD_DIR;
}

// 실제 파일 경로 + 확장자(ext) 검사
const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    cb(null, resolveDest(req));
  },
  filename: (_req, file, cb) => {
    const fileNameWithoutExt = path.parse(file.originalname).name;

    const ext = path.extname(file.originalname).toLowerCase();

    const validExt = ['.jpg', '.jpeg', '.png'];

    const safeExt = validExt.includes(ext) ? ext : '.jpg';

    cb(null, `${fileNameWithoutExt}${safeExt}`);
  },
});

// MIME 타입 검사 (실제 확장자와 이미지가 일치한지)
function fileFilter(req, file, cb) {
  const allowedFile = ['image/jpeg', 'image/png'];

  if (!allowedFile.includes(file.mimetype)) {
    return cb(new Error('올바른 파일 타입이 아닙니다'));
  }

  cb(null, true);
}

// 파일 크기 제한 (5MB)
const limits = { fileSize: 5 * 1024 * 1024 };

// 단일 업로드(group)
export const uploadSingle = multer({
  storage,
  fileFilter,
  limits,
}).single('image');

// 다중 업로드(record)
export const uploadMulti = multer({
  storage,
  fileFilter,
  limits,
}).array('images', 3);
