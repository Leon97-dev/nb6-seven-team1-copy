import { PrismaClient } from "@prisma/client";
import { NotFoundError } from "../middlewares/error-handler.js";

const prisma = new PrismaClient();

class GroupLikeCount{
  async groupLikeCountUp(req, res) {

    const ID = Number(req.params.id);

    const findGroup = await prisma.group.findUnique({
      where: { id: ID },
    });

    if (!findGroup) {
      throw new NotFoundError("그룹을 찾을 수 없습니다");
    }

    const likeCountUp = await prisma.group.update({
      where: { id: ID },
      data: {
        likeCount: { increment: 1 },
      },
    });

    res.status(200).json({
      message: "그룹 추천 성공",
      data: {
        id: likeCountUp.id,
        likeCount: likeCountUp.likeCount,
      },
    });
  }

  async groupLikeCountDown(req, res) {

    const id = Number(req.params.id);

    const findGroup = await prisma.group.findUnique({
      where: { id },
    });

    if (!findGroup) {
      throw new NotFoundError("그룹을 찾을 수 없습니다");
    }

    const likeCountDown = await prisma.group.update({
      where: { id },
      data: {
        likeCount: { decrement: 1 },
      },
    });

    res.status(200).json({
      message: "그룹 추천 취소 성공",
      data: {
        id: likeCountDown.id,
        likeCount: likeCountDown.likeCount,
      },
    });
  }
}

export default new GroupLikeCount();
