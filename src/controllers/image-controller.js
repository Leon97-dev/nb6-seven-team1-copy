// src/controllers/image-controller.js
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 절대경로 > URL 경로 변경
function toPublicUrl(req, absolutePath) {
  const publicRoot = path.resolve(__dirname, '../../public');

  const relativePath = path.relative(publicRoot, absolutePath);

  const webPath = `/${relativePath.split(path.sep).join('/')}`;

  return `${req.protocol}://${req.get('host')}${webPath}`;
}

// 단일 이미지 검증/응답
export const handleSingleUpload = (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        ok: false,
        error: { code: 'NO_FILE', message: '업로드된 파일이 없습니다.' },
      });
    }

    return res.status(201).json({
      ok: true,
      data: { file: req.file },
    });
  } catch (e) {
    return next(e);
  }
};

// 다중 이미지 검증/응답
export const handleMultiUpload = (req, res, next) => {
  try {
    const files = Array.isArray(req.files) ? req.files : [];

    if (files.length === 0) {
      return res.status(400).json({
        ok: false,
        error: { code: 'NO_FILE', message: '업로드된 파일이 없습니다.' },
      });
    }

    return res.status(201).json({
      ok: true,
      data: { file: req.file },
    });
  } catch (e) {
    return next(e);
  }
};
