import { NotFoundError, UnauthorizedError, ValidationError } from '../middlewares/error-handler.js';
import { debugError, debugLog } from '../utils/debug.js';
import prisma from '../utils/prisma.js';

class GroupController {
  //group 데이터 목록 조회
  async getGroupList(req, res, next) {
    try {
      const { page = 1, limit = 10, orderBy = 'createdAt', order = 'desc', search } = req.query;

      // order 검증 (명세서에서는 order가 정렬 방향)
      if (order !== 'asc' && order !== 'desc') {
        throw new ValidationError('order', 'order는 반드시 [asc, desc] 중 하나여야 합니다.');
      }

      switch (orderBy) {
        case 'participantCount':
          orderBy = { participants: { _count: order } };
          break;
        case 'likeCount':
          orderBy = { likeCount: order };
          break;
        case 'createdAt':
          orderBy = { createdAt: order };
          break;
        default:
          throw new ValidationError(
            'orderBy',
            `orderBy는 반드시 [createdAt, likeCount, participantCount] 중 하나여야 합니다.`,
          );
      }

      // 전체 개수 조회 추가 (total을 위해)
      const [groups, total] = await Promise.all([
        prisma.group.findMany({
          orderBy,
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

      // recordCount 추가 필요 (명세서에 있음)
      const baseUrl = process.env.BASE_URL || '';
      const groupsWithRecordCount = await Promise.all(
        groups.map(async (group) => {
          const recordCount = await prisma.record.count({
            where: { groupId: group.id },
          });

          return {
            ...group,
            photoUrl: group.photoUrl ? `${baseUrl}/${group.photoUrl}` : null,
            recordCount,
          };
        }),
      );

      // 명세서에 맞는 응답 형식
      res.status(200).json({
        data: groupsWithRecordCount,
        total,
      });
    } catch (err) {
      next(err);
    }
  }

  //group 데이터 추가
  async createGroup(req, res, next) {
    try {
      const { name, goalRep, photoUrl, ownerNickname, ownerPassword, ...body } = req.body;

      // 1. 필수 필드 검증
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

      // 2. multer 파일 받아오기
      const mainImgs = req.files;
      const finalPhotoUrl =
        mainImgs && mainImgs.length > 0 ? `uploads/${mainImgs[0].filename}` : null;

      // 3. Owner(Participant) 생성과 함께 Group 생성
      const group = await prisma.group.create({
        data: {
          ...body,
          name,
          goalRep: finalGoalRep,
          photoUrl: finalPhotoUrl,
          owner: {
            create: {
              nickname: ownerNickname,
              password: ownerPassword,
            },
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
      });

      debugLog('group 생성 완료', group);

      // 4. 응답 데이터 생성
      const baseUrl = process.env.BASE_URL || '';
      const groupResponse = {
        id: group.id,
        name: group.name,
        description: group.description,
        photoUrl: group.photoUrl ? `${baseUrl}/${group.photoUrl}` : null,
        goalRep: group.goalRep,
        discordWebhookUrl: group.discordWebhookUrl,
        discordInviteUrl: group.discordInviteUrl,
        likeCount: group.likeCount,
        tags: group.tags,
        owner: group.owner,
        participants: group.participants,
        createdAt: group.createdAt,
        updatedAt: group.updatedAt,
        badges: group.badges,
      };

      res.status(201).json(groupResponse);
    } catch (err) {
      debugError('group 생성 실패', err);
      next(err);
    }
  }

  //group 상세내역 호출
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

      // Group Img 경로 제공을 위해 response 값 변환
      const baseUrl = process.env.BASE_URL || '';
      const groupResponse = {
        ...group,
        photoUrl: group.photoUrl ? `${baseUrl}/${group.photoUrl}` : null,
      };

      // 명세서에 맞게 직접 객체 반환
      res.status(200).json(groupResponse);
    } catch (err) {
      debugError('group 호출 실패', err);
      next(err);
    }
  }

  //특정 group 삭제
  async deleteGroup(req, res, next) {
    try {
      const { id } = req.params;
      const { ownerPassword } = req.body; // ✅ pw → ownerPassword

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
        throw new UnauthorizedError('password', '비밀번호가 일치하지 않습니다.'); // ✅ path 추가
      }

      await prisma.group.delete({
        where: { id: Number(id) },
      });

      res.status(200).json({ message: '그룹이 성공적으로 삭제되었습니다.' });
    } catch (err) {
      next(err);
    }
  }

  //특정 group 수정
  async patchGroup(req, res, next) {
    try {
      const { id } = req.params;
      const { ownerPassword, ...updateData } = req.body; // ✅ pw → ownerPassword
      let dataToUpdate = { ...updateData };

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
        throw new UnauthorizedError('password', '비밀번호가 일치하지 않습니다.'); // ✅ path 추가
      }

      if (!updateData.name) {
        throw new ValidationError('name', '그룹명은 필수입니다'); // ✅ path 추가
      }

      // console.log 제거
      dataToUpdate.goalRep = parseInt(updateData.goalRep);
      if (!Number.isInteger(dataToUpdate.goalRep) || dataToUpdate.goalRep < 0) {
        throw new ValidationError('goalRep', '목표 횟수는 0 이상의 정수여야 합니다'); // ✅ 수정
      }

      // 미들웨어를 사용하여 이미지 파일 받아오기
      const mainImgs = req.files;

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

      // Group Img 경로 제공을 위해 response 값 변환
      const baseUrl = process.env.BASE_URL || '';
      const groupResponse = {
        ...group,
        photoUrl: group.photoUrl ? `${baseUrl}/${group.photoUrl}` : null,
      };

      // 명세서에 맞게 직접 객체 반환
      res.status(200).json(groupResponse);
    } catch (err) {
      next(err);
    }
  }
}

export default new GroupController();
