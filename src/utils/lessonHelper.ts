import { CourseLesson, TimeSlot, WeekType } from '../types';

/**
 * 获取教学用有效节次列表 (排除纯大课间与午餐等 isBreak 节次)
 */
export function getTeachingSlots(timeSlots: TimeSlot[]): TimeSlot[] {
  return timeSlots.filter((s) => !s.isBreak);
}

/**
 * 计算一门课程所有实际开课的教学周次列表
 */
export function getLessonActiveWeeks(lesson: CourseLesson, totalWeeks = 20): number[] {
  const start = Math.max(1, lesson.startWeek || 1);
  const end = Math.min(totalWeeks, lesson.endWeek || totalWeeks);

  if (lesson.weekType === 'custom' && lesson.customWeeks && lesson.customWeeks.length > 0) {
    return Array.from(new Set(lesson.customWeeks))
      .filter((w) => w >= 1 && w <= totalWeeks)
      .sort((a, b) => a - b);
  }

  const weeks: number[] = [];
  for (let w = start; w <= end; w++) {
    if (lesson.weekType === 'all') {
      weeks.push(w);
    } else if (lesson.weekType === 'single' && w % 2 === 1) {
      weeks.push(w);
    } else if (lesson.weekType === 'double' && w % 2 === 0) {
      weeks.push(w);
    }
  }
  return weeks;
}

/**
 * 判定一门课程在指定的某一周 (或全景 'all') 是否开课
 */
export function isLessonActiveInWeek(
  lesson: CourseLesson,
  targetWeek: number | 'all',
  totalWeeks = 20
): boolean {
  if (targetWeek === 'all') return true;
  const activeWeeks = getLessonActiveWeeks(lesson, totalWeeks);
  return activeWeeks.includes(targetWeek);
}

/**
 * 人性化格式化周次范围描述文本 (高校通用规范)
 * 例如: "第1-10周", "第12-20周", "第1-16周(单)", "第2-18周(双)"
 */
export function formatWeekRange(lesson: CourseLesson): string {
  const start = lesson.startWeek || 1;
  const end = lesson.endWeek || 16;
  const type = lesson.weekType;

  if (type === 'custom' && lesson.customWeeks && lesson.customWeeks.length > 0) {
    const sorted = [...lesson.customWeeks].sort((a, b) => a - b);
    if (sorted.length <= 4) {
      return `第${sorted.join(',')}周`;
    }
    return `指定${sorted.length}周(${sorted[0]}-${sorted[sorted.length - 1]}周)`;
  }

  const rangeStr = start === end ? `第${start}周` : `第${start}-${end}周`;

  if (type === 'single') {
    return `${rangeStr}(单)`;
  }
  if (type === 'double') {
    return `${rangeStr}(双)`;
  }
  return rangeStr;
}

/**
 * 获取这门连堂课程所占用的所有 TimeSlot 节次对象
 * 针对高校 1~2 节、5~8 节连上的情况
 */
export function getSlotsOccupiedByLesson(
  lesson: CourseLesson,
  timeSlots: TimeSlot[]
): TimeSlot[] {
  const teachingSlots = getTeachingSlots(timeSlots);
  const startIndex = teachingSlots.findIndex((s) => s.id === lesson.timeSlotId);
  if (startIndex === -1) {
    const fallback = timeSlots.find((s) => s.id === lesson.timeSlotId);
    return fallback ? [fallback] : [];
  }

  const duration = Math.max(1, lesson.durationSlots || 1);
  const occupied = teachingSlots.slice(startIndex, startIndex + duration);
  return occupied.length > 0 ? occupied : [teachingSlots[startIndex]];
}

/**
 * 格式化连堂节次与起止时间
 * 例如: { slotName: "第1-2节", timeRange: "08:00 - 09:35", duration: 2 }
 * 例如: { slotName: "第5-8节", timeRange: "13:30 - 16:55", duration: 4 }
 */
export function formatLessonSlotSpan(
  lesson: CourseLesson,
  timeSlots: TimeSlot[]
): {
  slotName: string;
  timeRange: string;
  duration: number;
  startSlot: TimeSlot | undefined;
  endSlot: TimeSlot | undefined;
} {
  const occupiedSlots = getSlotsOccupiedByLesson(lesson, timeSlots);
  if (occupiedSlots.length === 0) {
    const startSlot = timeSlots.find((s) => s.id === lesson.timeSlotId);
    return {
      slotName: startSlot?.name || '未知节次',
      timeRange: startSlot ? `${startSlot.startTime}-${startSlot.endTime}` : '',
      duration: 1,
      startSlot,
      endSlot: startSlot,
    };
  }

  const startSlot = occupiedSlots[0];
  const endSlot = occupiedSlots[occupiedSlots.length - 1];
  const duration = occupiedSlots.length;

  let slotName = startSlot.name;
  if (duration > 1) {
    const startNumMatch = startSlot.name.match(/\d+/);
    const endNumMatch = endSlot.name.match(/\d+/);
    if (startNumMatch && endNumMatch) {
      slotName = `第${startNumMatch[0]}-${endNumMatch[0]}节`;
    } else {
      slotName = `${startSlot.name} ~ ${endSlot.name}`;
    }
  }

  const timeRange = `${startSlot.startTime} - ${endSlot.endTime}`;

  return {
    slotName,
    timeRange,
    duration,
    startSlot,
    endSlot,
  };
}

/**
 * 严格的高校排课冲突检测
 * 判定规则: 星期相同 + 连堂节次区间有交集 + 上课周次有交集
 * (注意: 即使同一天同一节次，若一个在1-8周，一个在9-16周，则互不冲突！)
 */
export function checkLessonsConflict(
  lessonA: CourseLesson,
  lessonB: CourseLesson,
  timeSlots: TimeSlot[],
  totalWeeks = 20
): boolean {
  if (lessonA.id === lessonB.id) return false;
  if (lessonA.dayOfWeek !== lessonB.dayOfWeek) return false;

  // 1. 节次交集检测
  const slotsA = getSlotsOccupiedByLesson(lessonA, timeSlots).map((s) => s.id);
  const slotsB = getSlotsOccupiedByLesson(lessonB, timeSlots).map((s) => s.id);
  const hasSlotOverlap = slotsA.some((id) => slotsB.includes(id));
  if (!hasSlotOverlap) return false;

  // 2. 周次交集检测
  const weeksA = getLessonActiveWeeks(lessonA, totalWeeks);
  const weeksB = getLessonActiveWeeks(lessonB, totalWeeks);
  const hasWeekOverlap = weeksA.some((w) => weeksB.includes(w));

  return hasWeekOverlap;
}

/**
 * 找出与指定课程有时间冲突的所有课程
 */
export function findConflictingLessons(
  targetLesson: CourseLesson,
  allLessons: CourseLesson[],
  timeSlots: TimeSlot[],
  totalWeeks = 20
): CourseLesson[] {
  return allLessons.filter((other) =>
    checkLessonsConflict(targetLesson, other, timeSlots, totalWeeks)
  );
}
