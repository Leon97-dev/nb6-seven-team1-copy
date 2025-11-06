// src/controllers/image-controller.js
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import { error } from 'console';

const prisma = new PrismaClient();

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
export const handleSingleUpload = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        ok: false,
        error: { code: 'NO_FILE', message: '업로드된 파일이 없습니다.' },
      });
    }

    const groupId = Number(req.body?.groupId);
    if (!groupId) {
      return res.status(400).json({
        ok: false,
        error: { code: 'NO_GROUP_ID', message: 'groupId가 필요합니다.' },
      });
    }

    const imageUrl = toPublicUrl(req, req.file.path);

    await prisma.group.update({
      where: { id: groupId },
      data: { photoUrl: imageUrl },
    });

    return res.status(201).json({
      ok: true,
      data: { imageUrl },
    });
  } catch (e) {
    return next(e);
  }
};

// 다중 이미지 검증/응답
export const handleMultiUpload = async (req, res, next) => {
  try {
    const files = Array.isArray(req.files) ? req.files : [];

    if (files.length === 0) {
      return res.status(400).json({
        ok: false,
        error: { code: 'NO_FILE', message: '업로드된 파일이 없습니다.' },
      });
    }

    const recordId = Number(req.body?.recordId);
    if (!recordId) {
      return res.status(400).json({
        ok: false,
        error: { code: 'NO_RECORD_ID', message: 'recordId가 필요합니다.' },
      });
    }

    const imageUrls = files.map((f) => toPublicUrl(req, f.path));

    await prisma.record.update({
      where: { id: recordId },
      data: { photos: { push: imageUrls } },
    });

    return res.status(201).json({
      ok: true,
      data: { imageUrls },
    });
  } catch (e) {
    return next(e);
  }
};
