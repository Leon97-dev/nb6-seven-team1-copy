import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const getImageUrl = (filename) => `uploads/${filename}`;

const PHOTO_LIBRARY = {
  run: ['sample-record-run-1.jpg', 'sample-record-run-2.jpg', 'test_image.jpg'],
  bike: ['sample-record-bike-1.jpg', 'test_image.jpg'],
  swim: ['sample-record-swim-1.jpg', 'test_image.jpg'],
  default: ['test_image.jpg'],
};

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const getRandomDateWithinPastDays = (minDaysAgo, maxDaysAgo) => {
  const daysAgo = randomInt(minDaysAgo, maxDaysAgo);
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(randomInt(5, 22), randomInt(0, 59), randomInt(0, 59), 0);
  return date;
};

const getRecordDateByIndex = (index) => {
  if (index % 3 === 0) return getRandomDateWithinPastDays(0, 6); // 이번 주
  if (index % 3 === 1) return getRandomDateWithinPastDays(7, 29); // 이번 달
  return getRandomDateWithinPastDays(30, 60); // 지난 달
};

const pickPhotoSet = (exerciseType) => {
  const pool = PHOTO_LIBRARY[exerciseType] || PHOTO_LIBRARY.default;
  const maxSelectable = pool.length === 1 ? 1 : Math.min(2, pool.length);
  const count = randomInt(1, maxSelectable);
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(getImageUrl);
};

async function main() {
  console.log('>>> SEED DATA GENERATION START');
  console.log('='.repeat(60));

  await prisma.$executeRawUnsafe('TRUNCATE TABLE "records" RESTART IDENTITY CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "participants" RESTART IDENTITY CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "groups" RESTART IDENTITY CASCADE');

  console.log('[OK] Database cleanup completed (ID reset to 1)');
  console.log('');

  // ============================================================
  // >>> GROUP 1: Morning Running Team
  // ============================================================

  const group1 = await prisma.group.create({
    data: {
      name: '[테스트] 새벽 러닝 팀',
      description: '매일 아침 6시에 모여서 함께 달려요! 초보자 환영',
      photoUrl: getImageUrl('sample-group-1.jpg'),
      goalRep: 100,
      tags: ['달리기', '새벽', '건강'],
      discordWebhookUrl: null,
      discordInviteUrl: null,
      likeCount: 45,
      badges: ['PARTICIPATION_10'],
      ownerId: null,
    },
  });

  await prisma.participant.createMany({
    data: [
      { nickname: '[샘플] 러닝고수', password: '1234', groupId: group1.id },
      { nickname: '[샘플] 초보러너', password: '1234', groupId: group1.id },
      { nickname: '[샘플] 마라톤왕', password: '1234', groupId: group1.id },
      { nickname: '[샘플] 달리기조아', password: '1234', groupId: group1.id },
      { nickname: '[샘플] 건강맨', password: '1234', groupId: group1.id },
      { nickname: '[샘플] 조깅러버', password: '1234', groupId: group1.id },
      { nickname: '[샘플] 아침형인간', password: '1234', groupId: group1.id },
      { nickname: '[샘플] 런런런', password: '1234', groupId: group1.id },
      { nickname: '[샘플] 페이스메이커', password: '1234', groupId: group1.id },
      { nickname: '[샘플] 스피드러너', password: '1234', groupId: group1.id },
    ],
  });

  const owner1 = await prisma.participant.findFirst({
    where: { groupId: group1.id, nickname: '[샘플] 러닝고수' },
  });
  await prisma.group.update({
    where: { id: group1.id },
    data: { ownerId: owner1.id },
  });

  const allParticipants1 = await prisma.participant.findMany({
    where: { groupId: group1.id },
  });

  for (let i = 0; i < 30; i++) {
    const author = allParticipants1[i % allParticipants1.length];
    const createdAt = getRecordDateByIndex(i);
    await prisma.record.create({
      data: {
        exerciseType: 'run',
        description: `[더미] ${i + 1}일차 러닝 완료! 오늘도 열심히 달렸습니다`,
        time: randomInt(1800, 5400),
        distance: Math.round((Math.random() * 5 + 3) * 100) / 100,
        photos: pickPhotoSet('run'),
        groupId: group1.id,
        authorId: author.id,
        createdAt,
      },
    });
  }

  console.log('[OK] Group 1 created (10 participants, 30 records)');

  // ============================================================
  // >>> GROUP 2: Weekend Cycling Club
  // ============================================================
  const group2 = await prisma.group.create({
    data: {
      name: '[테스트] 주말 자전거 동호회',
      description: '매주 토요일 한강에서 라이딩해요',
      photoUrl: getImageUrl('sample-group-2.jpg'),
      goalRep: 50,
      tags: ['자전거', '주말', '한강'],
      discordWebhookUrl: null,
      discordInviteUrl: null,
      likeCount: 28,
      badges: [],
      ownerId: null,
    },
  });

  await prisma.participant.createMany({
    data: [
      { nickname: '[샘플] 바이크마스터', password: '1234', groupId: group2.id },
      { nickname: '[샘플] 페달밟는사람', password: '1234', groupId: group2.id },
      { nickname: '[샘플] 사이클리스트', password: '1234', groupId: group2.id },
      { nickname: '[샘플] 라이더', password: '1234', groupId: group2.id },
      { nickname: '[샘플] 자전거조아', password: '1234', groupId: group2.id },
    ],
  });

  const owner2 = await prisma.participant.findFirst({
    where: { groupId: group2.id, nickname: '[샘플] 바이크마스터' },
  });
  await prisma.group.update({
    where: { id: group2.id },
    data: { ownerId: owner2.id },
  });

  const allParticipants2 = await prisma.participant.findMany({
    where: { groupId: group2.id },
  });

  for (let i = 0; i < 20; i++) {
    const author = allParticipants2[i % allParticipants2.length];
    const createdAt = getRecordDateByIndex(i + 30);
    await prisma.record.create({
      data: {
        exerciseType: 'bike',
        description: `[더미] ${i + 1}주차 라이딩 완료! 날씨 좋았어요`,
        time: randomInt(3600, 9000),
        distance: Math.round((Math.random() * 20 + 15) * 100) / 100,
        photos: pickPhotoSet('bike'),
        groupId: group2.id,
        authorId: author.id,
        createdAt,
      },
    });
  }

  console.log('[OK] Group 2 created (5 participants, 20 records)');

  // ============================================================
  // >>> GROUP 3: Swimming Beginners
  // ============================================================
  const group3 = await prisma.group.create({
    data: {
      name: '[테스트] 수영 왕초보',
      description: '천천히 배우는 수영 모임',
      photoUrl: getImageUrl('sample-group-3.jpg'),
      goalRep: 30,
      tags: ['수영', '초보', '실내'],
      discordWebhookUrl: null,
      discordInviteUrl: null,
      likeCount: 12,
      badges: [],
      ownerId: null,
    },
  });

  await prisma.participant.createMany({
    data: [
      { nickname: '[샘플] 수영선생', password: '1234', groupId: group3.id },
      { nickname: '[샘플] 물속고기', password: '1234', groupId: group3.id },
      { nickname: '[샘플] 헤엄치는사람', password: '1234', groupId: group3.id },
    ],
  });

  const owner3 = await prisma.participant.findFirst({
    where: { groupId: group3.id, nickname: '[샘플] 수영선생' },
  });
  await prisma.group.update({
    where: { id: group3.id },
    data: { ownerId: owner3.id },
  });

  const allParticipants3 = await prisma.participant.findMany({
    where: { groupId: group3.id },
  });

  for (let i = 0; i < 12; i++) {
    const author = allParticipants3[i % allParticipants3.length];
    const createdAt = getRecordDateByIndex(i + 60);
    await prisma.record.create({
      data: {
        exerciseType: 'swim',
        description: `[더미] ${i + 1}회차 수영 연습! 조금씩 늘어요`,
        time: randomInt(1200, 3000),
        distance: Math.round((Math.random() * 1 + 0.5) * 100) / 100,
        photos: pickPhotoSet('swim'),
        groupId: group3.id,
        authorId: author.id,
        createdAt,
      },
    });
  }

  console.log('[OK] Group 3 created (3 participants, 12 records)');

  // ============================================================
  // >>> GROUP 4: Solo But Consistent
  // ============================================================
  const group4 = await prisma.group.create({
    data: {
      name: '[테스트] 혼자서도 꾸준히',
      description: '운동 기록 공유하며 동기부여 받아요',
      photoUrl: getImageUrl('sample-group-4.jpg'),
      goalRep: 200,
      tags: ['혼자', '꾸준함', '동기부여'],
      discordWebhookUrl: null,
      discordInviteUrl: null,
      likeCount: 156,
      badges: ['LIKE_100', 'RECORD_100'],
      ownerId: null,
    },
  });

  await prisma.participant.createMany({
    data: [
      { nickname: '[샘플] 혼자운동', password: '1234', groupId: group4.id },
      { nickname: '[샘플] 자기관리왕', password: '1234', groupId: group4.id },
      { nickname: '[샘플] 루틴지키미', password: '1234', groupId: group4.id },
      { nickname: '[샘플] 꾸준왕', password: '1234', groupId: group4.id },
      { nickname: '[샘플] 오늘도운동', password: '1234', groupId: group4.id },
      { nickname: '[샘플] 건강체력', password: '1234', groupId: group4.id },
      { nickname: '[샘플] 매일매일', password: '1234', groupId: group4.id },
    ],
  });

  const owner4 = await prisma.participant.findFirst({
    where: { groupId: group4.id, nickname: '[샘플] 혼자운동' },
  });
  await prisma.group.update({
    where: { id: group4.id },
    data: { ownerId: owner4.id },
  });

  const allParticipants4 = await prisma.participant.findMany({
    where: { groupId: group4.id },
  });

  const exerciseTypes = ['run', 'bike', 'swim'];
  for (let i = 0; i < 150; i++) {
    const author = allParticipants4[i % allParticipants4.length];
    const exerciseType = exerciseTypes[i % exerciseTypes.length];
    const createdAt = getRecordDateByIndex(i + 100);

    await prisma.record.create({
      data: {
        exerciseType,
        description: `[더미] ${i + 1}일차 ${
          exerciseType === 'run' ? '달리기' : exerciseType === 'bike' ? '자전거' : '수영'
        } 완료!`,
        time: randomInt(1200, 4800),
        distance: Math.round((Math.random() * 10 + 2) * 100) / 100,
        photos: pickPhotoSet(exerciseType),
        groupId: group4.id,
        authorId: author.id,
        createdAt,
      },
    });
  }

  console.log('[OK] Group 4 created (7 participants, 150 records)');

  // ============================================================
  // >>> GROUP 5: Empty Group (Test Purpose)
  // ============================================================
  const group5 = await prisma.group.create({
    data: {
      name: '[테스트] 신규 그룹',
      description: '방금 만들어진 그룹입니다',
      photoUrl: null,
      goalRep: 50,
      tags: [],
      discordWebhookUrl: null,
      discordInviteUrl: null,
      likeCount: 0,
      badges: [],
      ownerId: null,
    },
  });

  const participant5 = await prisma.participant.create({
    data: {
      nickname: '[샘플] 신규그룹장',
      password: '1234',
      groupId: group5.id,
    },
  });

  await prisma.group.update({
    where: { id: group5.id },
    data: { ownerId: participant5.id },
  });

  console.log('[OK] Group 5 created (1 participant, no records)');

  // ============================================================
  // >>> GROUP 6: HIIT Crew (Test Purpose)
  // ============================================================
  const group6 = await prisma.group.create({
    data: {
      name: '[테스트] 실내 HIIT 챌린지',
      description: '실내에서도 땀 흘리는 고강도 운동 모임',
      photoUrl: getImageUrl('test_image.jpg'),
      goalRep: 80,
      tags: ['HIIT', '실내', '근력'],
      discordWebhookUrl: null,
      discordInviteUrl: null,
      likeCount: 72,
      badges: [],
      ownerId: null,
    },
  });

  await prisma.participant.createMany({
    data: [
      { nickname: '[샘플] 스쿼트장인', password: '1234', groupId: group6.id },
      { nickname: '[샘플] 버피왕', password: '1234', groupId: group6.id },
      { nickname: '[샘플] 점핑잭', password: '1234', groupId: group6.id },
      { nickname: '[샘플] 플랭크달인', password: '1234', groupId: group6.id },
      { nickname: '[샘플] 코어지킴이', password: '1234', groupId: group6.id },
      { nickname: '[샘플] 스텝터치', password: '1234', groupId: group6.id },
      { nickname: '[샘플] 점핑런지', password: '1234', groupId: group6.id },
      { nickname: '[샘플] 사이드킥', password: '1234', groupId: group6.id },
    ],
  });

  const owner6 = await prisma.participant.findFirst({
    where: { groupId: group6.id, nickname: '[샘플] 스쿼트장인' },
  });
  await prisma.group.update({
    where: { id: group6.id },
    data: { ownerId: owner6.id },
  });

  const allParticipants6 = await prisma.participant.findMany({
    where: { groupId: group6.id },
  });

  for (let i = 0; i < 45; i++) {
    const author = allParticipants6[i % allParticipants6.length];
    const createdAt = getRecordDateByIndex(i + 260);
    const exerciseType = i % 2 === 0 ? 'run' : 'bike';

    await prisma.record.create({
      data: {
        exerciseType,
        description: `[더미] HIIT ${i + 1}회차! 체력이 점점 좋아져요`,
        time: randomInt(900, 2400),
        distance: Math.round((Math.random() * 4 + 1) * 100) / 100,
        photos: pickPhotoSet(exerciseType),
        groupId: group6.id,
        authorId: author.id,
        createdAt,
      },
    });
  }

  console.log('[OK] Group 6 created (8 participants, 45 records)');
  console.log('');
  console.log('='.repeat(60));
  console.log('>>> SEED DATA GENERATION COMPLETE');
  console.log('--- Summary:');
  console.log('    6 groups created');
  console.log('    34 participants created');
  console.log('    257 exercise records created');
  console.log('='.repeat(60));
}

main()
  .catch((e) => {
    console.error('='.repeat(60));
    console.error('>>> SEED DATA GENERATION FAILED');
    console.error('--- Error:', e.message);
    console.error('='.repeat(60));
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
