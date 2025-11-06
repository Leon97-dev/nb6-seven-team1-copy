// src/routes/image-routes.js
import express from 'express';
import { uploadSingle, uploadMulti } from '../middlewares/upload.js';
import {
  handleSingleUpload,
  handleMultiUpload,
} from '../controllers/image-controller.js';

const router = express.Router();

router.post('/', uploadSingle, handleSingleUpload);
router.post('/multi', uploadMulti, handleMultiUpload);

export default router;
