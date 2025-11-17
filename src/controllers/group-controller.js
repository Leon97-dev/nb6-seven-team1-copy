import { NotFoundError, UnauthorizedError, ValidationError } from '../middlewares/error-handler.js';
import { debugError, debugLog } from '../utils/debug.js';
import prisma from '../utils/prisma.js';
import {
  convertArrayImageFieldsToUrls,
  convertImageFieldsToUrls,
  extractImagePath,
} from '../utils/image-utils.js';

class GroupController {
  async getGroupList(req, res, next) {
    try {
      const { page = 1, limit = 10, orderBy = 'createdAt', order = 'desc', search } = req.query;

      if (order !== 'asc' && order !== 'desc') {
        throw new ValidationError('order', 'order는 반드시 [asc, desc] 중 하나여야 합니다.');
      }

      let orderByClause;
      switch (orderBy) {
        case 'participantCount':
          orderByClause = { participants: { _count: order } };
          break;
        case 'likeCount':
          orderByClause = { likeCount: order };
          break;
        case 'createdAt':
          orderByClause = { createdAt: order };
          break;
        default:
          throw new ValidationError(
            'orderBy',
            `orderBy는 반드시 [createdAt, likeCount, participantCount] 중 하나여야 합니다.`,
          );
      }

      const [groups, total] = await Promise.all([
        prisma.group.findMany({
          orderBy: orderByClause,
          skip: (page - 1) * limit,
          take: parseInt(limit),
          where: {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
          include: {
            owner: {
              select: {
                id: true,
                nickname: true,
                createdAt: true,
                updatedAt: true,
              },
            },
            participants: {
              select: {
                id: true,
                nickname: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        }),
        prisma.group.count({
          where: {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
        }),
      ]);

      const groupsWithImages = convertArrayImageFieldsToUrls(groups, ['photoUrl']);
      const groupsWithRecordCount = await Promise.all(
        groupsWithImages.map(async (group) => {
          const recordCount = await prisma.record.count({
            where: { groupId: group.id },
          });

          return {
            ...group,
            recordCount,
          };
        }),
      );

      res.status(200).json({
        data: groupsWithRecordCount,
        total,
      });
    } catch (err) {
      next(err);
    }
  }

  async createGroup(req, res, next) {
    try {
      const { name, goalRep, photoUrl, ownerNickname, ownerPassword, ...body } = req.body;

      if (!name) {
        throw new ValidationError('name', '그룹명은 필수입니다');
      }

      if (!ownerNickname) {
        throw new ValidationError('ownerNickname', '소유자 닉네임은 필수입니다');
      }

      if (!ownerPassword) {
        throw new ValidationError('ownerPassword', '소유자 비밀번호는 필수입니다');
      }

      const finalGoalRep = parseInt(goalRep);
      if (!Number.isInteger(finalGoalRep) || finalGoalRep < 0) {
        throw new ValidationError('goalRep', '목표 횟수는 0 이상의 정수여야 합니다');
      }

      const mainImgs = req.files;
      let finalPhotoUrl = null;

      if (photoUrl) {
        finalPhotoUrl = extractImagePath(photoUrl);
      }

      if (mainImgs && mainImgs.length > 0) {
        finalPhotoUrl = `uploads/${mainImgs[0].filename}`;
      }

      const group = await prisma.group.create({
        data: {
          ...body,
          name,
          goalRep: finalGoalRep,
          photoUrl: finalPhotoUrl,
        },
      });

      debugLog('group 생성 완료', group);

      const owner = await prisma.participant.create({
        data: {
          nickname: ownerNickname,
          password: ownerPassword,
          groupId: group.id,
        },
      });

      debugLog('owner 생성 완료', owner);

      const updatedGroup = await prisma.group.update({
        where: { id: group.id },
        data: { ownerId: owner.id },
        include: {
          owner: {
            select: {
              id: true,
              nickname: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          participants: {
            select: {
              id: true,
              nickname: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });

      debugLog('group 업데이트 완료', updatedGroup);

      const groupWithImages = convertImageFieldsToUrls(updatedGroup, ['photoUrl']);
      const groupResponse = {
        id: groupWithImages.id,
        name: groupWithImages.name,
        description: groupWithImages.description,
        photoUrl: groupWithImages.photoUrl,
        goalRep: groupWithImages.goalRep,
        discordWebhookUrl: groupWithImages.discordWebhookUrl,
        discordInviteUrl: groupWithImages.discordInviteUrl,
        likeCount: groupWithImages.likeCount,
        tags: groupWithImages.tags,
        owner: groupWithImages.owner,
        participants: groupWithImages.participants,
        createdAt: groupWithImages.createdAt,
        updatedAt: groupWithImages.updatedAt,
        badges: groupWithImages.badges,
      };

      res.status(201).json(groupResponse);
    } catch (err) {
      debugError('group 생성 실패', err);
      next(err);
    }
  }

  async getGroupDetail(req, res, next) {
    try {
      const { id } = req.params;

      const group = await prisma.group.findUnique({
        where: { id: Number(id) },
        include: {
          owner: {
            select: {
              id: true,
              nickname: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          participants: {
            select: {
              id: true,
              nickname: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });

      if (!group) {
        throw new NotFoundError('그룹을 찾을 수 없습니다.');
      }

      const groupResponse = convertImageFieldsToUrls(group, ['photoUrl']);
      res.status(200).json(groupResponse);
    } catch (err) {
      debugError('group 호출 실패', err);
      next(err);
    }
  }

  async deleteGroup(req, res, next) {
    try {
      const { id } = req.params;
      const { ownerPassword } = req.body;

      const group = await prisma.group.findUnique({
        where: { id: Number(id) },
        select: {
          owner: {
            select: {
              password: true,
            },
          },
        },
      });

      if (!group) {
        throw new NotFoundError('그룹을 찾을 수 없습니다.');
      }

      if (!group.owner) {
        throw new UnauthorizedError('group owner의 정보를 찾을 수 없습니다.');
      }

      const ownerPasswordFromDB = group.owner.password;

      if (ownerPassword !== ownerPasswordFromDB) {
        throw new UnauthorizedError('password', '비밀번호가 일치하지 않습니다.');
      }

      await prisma.group.delete({
        where: { id: Number(id) },
      });

      res.status(200).json({ message: '그룹이 성공적으로 삭제되었습니다.' });
    } catch (err) {
      next(err);
    }
  }

  async patchGroup(req, res, next) {
    try {
      const { id } = req.params;
      const { ownerPassword, photoUrl: bodyPhotoUrl, ...updateData } = req.body;
      let dataToUpdate = {
        name: updateData.name,
        description: updateData.description,
        goalRep: updateData.goalRep,
        tags: updateData.tags,
        discordWebhookUrl: updateData.discordWebhookUrl,
        discordInviteUrl: updateData.discordInviteUrl,
        photoUrl: bodyPhotoUrl,
      };
      dataToUpdate = Object.fromEntries(
        Object.entries(dataToUpdate).filter(([, value]) => value !== undefined),
      );

      const findGroup = await prisma.group.findUnique({
        where: { id: Number(id) },
        select: {
          owner: {
            select: {
              password: true,
            },
          },
        },
      });

      if (!findGroup) {
        throw new NotFoundError('그룹을 찾을 수 없습니다.');
      }

      if (!findGroup.owner) {
        throw new UnauthorizedError('group owner의 정보를 찾을 수 없습니다.');
      }

      const ownerPasswordFromDB = findGroup.owner.password;

      if (ownerPassword !== ownerPasswordFromDB) {
        throw new UnauthorizedError('password', '비밀번호가 일치하지 않습니다.');
      }

      if (!updateData.name) {
        throw new ValidationError('name', '그룹명은 필수입니다');
      }

      dataToUpdate.goalRep = parseInt(updateData.goalRep);
      if (!Number.isInteger(dataToUpdate.goalRep) || dataToUpdate.goalRep < 0) {
        throw new ValidationError('goalRep', '목표 횟수는 0 이상의 정수여야 합니다');
      }

      const mainImgs = req.files;
      if (typeof dataToUpdate.photoUrl === 'string') {
        const trimmed = dataToUpdate.photoUrl.trim();
        dataToUpdate.photoUrl = trimmed.length > 0 ? extractImagePath(trimmed) : null;
      } else if (dataToUpdate.photoUrl === '') {
        dataToUpdate.photoUrl = null;
      }

      if (mainImgs && mainImgs.length > 0) {
        dataToUpdate.photoUrl = `uploads/${mainImgs[0].filename}`;
      }

      const group = await prisma.group.update({
        where: { id: Number(id) },
        data: dataToUpdate,
        include: {
          owner: {
            select: {
              id: true,
              nickname: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          participants: {
            select: {
              id: true,
              nickname: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });

      const groupResponse = convertImageFieldsToUrls(group, ['photoUrl']);
      res.status(200).json(groupResponse);
    } catch (err) {
      next(err);
    }
  }
}

export default new GroupController();
