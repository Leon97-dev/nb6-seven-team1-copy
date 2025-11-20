// src/utils/date-range.js
export function getRange(duration = 'weekly') {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  if (duration === 'weekly') {
    const start = new Date(end);
    start.setDate(start.getDate() - 6); // 최근 7일(오늘 포함)
    start.setHours(0, 0, 0, 0);
    return { start, end };
  }

  if (duration === 'monthly') {
    const start = new Date(end);
    start.setDate(start.getDate() - 29); // 최근 30일(오늘 포함)
    start.setHours(0, 0, 0, 0);
    return { start, end };
  }

  return null;
}
