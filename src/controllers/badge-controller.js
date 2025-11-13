import prisma from '../utils/prisma.js';
import { debugError } from '../utils/debug.js';

export async function updateGroupBaddges(groupId) {
  try {
    const [participantCount, recordCount, group] = await Promise.all([
      //필요한 값( 참여자 수, 운동기록 수, 그룹) 가져오기
      prisma.participant.count({ where: { groupId: Number(groupId) } }),
      prisma.record.count({ where: { groupId: Number(groupId) } }),
      prisma.group.findUnique({
        where: { id: Number(groupId) },
        select: { id: true, badges: true, likeCount: true },
      }),
    ]);

    //그룹이 없으면 그냥 빠져나감
    if (!group) return null;

    //뱃지 만들기
    const badgesSet = new Set(group.badges || []);

    //뱃지 조건 확인 - 추가, 제거
    participantCount >= 10 ? badgesSet.add('PARTICIPANT_10') : badgesSet.delete('PARTICIPANT_10');
    recordCount >= 100 ? badgesSet.add('RECORD_100') : badgesSet.delete('RECORD_100');
    group.likeCount >= 100 ? badgesSet.add('LIKE_100') : badgesSet.delete('LIKECOUNT_100');

    const newBadges = badgesSet;
    const oldBadges = group.badges || [];

    if (newBadges.length === oldBadges.length) {
      return { updated: false, badges: oldBadges };
    }

    const updated = await prisma.group.update({
      where: { id: group.id },
      data: { badges: Array.from(newBadges) },
    });
  } catch (err) {
    console.log(err);
  }
}
