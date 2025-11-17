import express from 'express';
import groupLikeCountController from '../controllers/group-like-count-controller.js';

const router = express.Router();

router.post('/:id/likes', groupLikeCountController.groupLikeCountUp);
router.delete('/:id/likes', groupLikeCountController.groupLikeCountDown);
router.post('/:id/like', groupLikeCountController.groupLikeCountUp);
router.delete('/:id/like', groupLikeCountController.groupLikeCountDown);

export default router;
