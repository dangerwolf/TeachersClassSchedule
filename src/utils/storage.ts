import { ClassInfo, CourseLesson, TeacherProfile, TimeSlot, TimetableConfig } from '../types';
import { CLASS_PALETTES } from './colorPalette';
import {
  formatLessonSlotSpan,
  formatWeekRange,
  getLessonActiveWeeks,
  getSlotsOccupiedByLesson,
} from './lessonHelper';

export const DEFAULT_CLASSES: ClassInfo[] = [
  {
    id: 'class-1',
    name: '计算机2301班',
    grade: '大二 (2023级)',
    color: CLASS_PALETTES[0].color,
    bgLightColor: CLASS_PALETTES[0].bgLightColor,
    textColor: CLASS_PALETTES[0].textColor,
    borderColor: CLASS_PALETTES[0].borderColor,
    studentCount: 42,
    classroomDefault: '第一教学楼 A201',
    remarks: '学委：陈思源 (13800110001)',
  },
  {
    id: 'class-2',
    name: '软件工程2302班',
    grade: '大二 (2023级)',
    color: CLASS_PALETTES[1].color,
    bgLightColor: CLASS_PALETTES[1].bgLightColor,
    textColor: CLASS_PALETTES[1].textColor,
    borderColor: CLASS_PALETTES[1].borderColor,
    studentCount: 45,
    classroomDefault: '第一教学楼 A203',
    remarks: '卓越工程师培养计划班',
  },
  {
    id: 'class-3',
    name: '人工智能拔尖班',
    grade: '大二 (2023级)',
    color: CLASS_PALETTES[2].color,
    bgLightColor: CLASS_PALETTES[2].bgLightColor,
    textColor: CLASS_PALETTES[2].textColor,
    borderColor: CLASS_PALETTES[2].borderColor,
    studentCount: 32,
    classroomDefault: '信息实验楼 502机房',
    remarks: '配套高性能GPU算力实验室',
  },
  {
    id: 'class-4',
    name: '微电子2201班',
    grade: '大三 (2022级)',
    color: CLASS_PALETTES[3].color,
    bgLightColor: CLASS_PALETTES[3].bgLightColor,
    textColor: CLASS_PALETTES[3].textColor,
    borderColor: CLASS_PALETTES[3].borderColor,
    studentCount: 38,
    classroomDefault: '逸夫科技馆 301阶梯教室',
    remarks: '考研重点关注班级',
  },
  {
    id: 'class-5',
    name: '综合物理实验(全校选修)',
    grade: '通识与前沿选修',
    color: CLASS_PALETTES[5].color,
    bgLightColor: CLASS_PALETTES[5].bgLightColor,
    textColor: CLASS_PALETTES[5].textColor,
    borderColor: CLASS_PALETTES[5].borderColor,
    studentCount: 30,
    classroomDefault: '物理实验大楼 402实验室',
    remarks: '需提前15分钟调试仪器',
  },
];

export const DEFAULT_TIME_SLOTS: TimeSlot[] = [
  { id: 'slot-1', name: '第1节', startTime: '08:00', endTime: '08:45', section: 'morning' },
  { id: 'slot-2', name: '第2节', startTime: '08:55', endTime: '09:40', section: 'morning' },
  { id: 'slot-break-1', name: '大课间·操场/课间休息', startTime: '09:40', endTime: '10:05', section: 'break', isBreak: true },
  { id: 'slot-3', name: '第3节', startTime: '10:05', endTime: '10:50', section: 'morning' },
  { id: 'slot-4', name: '第4节', startTime: '11:00', endTime: '11:45', section: 'morning' },
  { id: 'slot-lunch', name: '午餐与午休', startTime: '11:45', endTime: '13:30', section: 'break', isBreak: true },
  { id: 'slot-5', name: '第5节', startTime: '13:30', endTime: '14:15', section: 'afternoon' },
  { id: 'slot-6', name: '第6节', startTime: '14:25', endTime: '15:10', section: 'afternoon' },
  { id: 'slot-break-2', name: '下午课间茶歇', startTime: '15:10', endTime: '15:25', section: 'break', isBreak: true },
  { id: 'slot-7', name: '第7节', startTime: '15:25', endTime: '16:10', section: 'afternoon' },
  { id: 'slot-8', name: '第8节', startTime: '16:20', endTime: '17:05', section: 'afternoon' },
  { id: 'slot-dinner', name: '晚餐与休息', startTime: '17:05', endTime: '18:30', section: 'break', isBreak: true },
  { id: 'slot-9', name: '第9节(晚)', startTime: '18:30', endTime: '19:15', section: 'evening' },
  { id: 'slot-10', name: '第10节(晚)', startTime: '19:25', endTime: '20:10', section: 'evening' },
];

export const DEFAULT_LESSONS: CourseLesson[] = [
  // 周一: 1~2节连堂 (1-16周全学期)
  {
    id: 'lesson-1',
    subject: '大学物理(A)1',
    classId: 'class-1',
    classroom: '第一教学楼 A201',
    dayOfWeek: 1,
    timeSlotId: 'slot-1',
    durationSlots: 2, // 1~2节连上
    startWeek: 1,
    endWeek: 16,
    weekType: 'all',
    notes: '牛顿力学与刚体转动定律公式推导',
  },
  // 周一: 5~6节连堂 (1-10周，前半学期)
  {
    id: 'lesson-2',
    subject: '近代物理导论',
    classId: 'class-2',
    classroom: '第一教学楼 A203',
    dayOfWeek: 1,
    timeSlotId: 'slot-5',
    durationSlots: 2, // 5~6节连上
    startWeek: 1,
    endWeek: 10,
    weekType: 'all',
    notes: '狭义相对论时空观与光电效应实验',
  },
  // 周二: 3~4节连堂 (1-10周 前半学期)
  {
    id: 'lesson-3',
    subject: '数字逻辑设计',
    classId: 'class-3',
    classroom: '逸夫科技馆 301阶梯教室',
    dayOfWeek: 2,
    timeSlotId: 'slot-3',
    durationSlots: 2, // 3~4节连上
    startWeek: 1,
    endWeek: 10,
    weekType: 'all',
    notes: '卡诺图化简与组合逻辑电路设计 (前半学期)',
  },
  // 周二: 3~4节连堂 (11-18周 后半学期，与上门课错峰不冲突！)
  {
    id: 'lesson-4',
    subject: '现代微处理器架构',
    classId: 'class-3',
    classroom: '逸夫科技馆 301阶梯教室',
    dayOfWeek: 2,
    timeSlotId: 'slot-3',
    durationSlots: 2, // 3~4节连上
    startWeek: 11,
    endWeek: 18,
    weekType: 'all',
    notes: '流水线冒险与分支预测机制 (后半学期接力开课)',
  },
  // 周三: 5~8节 4节大课/实验实训连堂 (1-8周 前半学期)
  {
    id: 'lesson-5',
    subject: '大学物理综合实验 (4节大课)',
    classId: 'class-5',
    classroom: '物理实验大楼 402实验室',
    dayOfWeek: 3,
    timeSlotId: 'slot-5',
    durationSlots: 4, // 5~8节连上4节
    startWeek: 1,
    endWeek: 8,
    weekType: 'all',
    notes: '分组实验：示波器波形观测与迈克尔逊干涉仪调试',
  },
  // 周三: 5~8节 4节大课/实训 (9-16周 后半学期接力，同一时段合理错峰！)
  {
    id: 'lesson-6',
    subject: '电子工艺与嵌入式实训 (4节大课)',
    classId: 'class-5',
    classroom: '工程实训中心 208实训室',
    dayOfWeek: 3,
    timeSlotId: 'slot-5',
    durationSlots: 4, // 5~8节连上4节
    startWeek: 9,
    endWeek: 16,
    weekType: 'all',
    notes: 'PCB板焊接制作与单片机最小系统烧录测试',
  },
  // 周四: 1~2节连堂 (1-16周)
  {
    id: 'lesson-7',
    subject: '大学物理(A)1',
    classId: 'class-2',
    classroom: '第一教学楼 A203',
    dayOfWeek: 4,
    timeSlotId: 'slot-1',
    durationSlots: 2, // 1~2节连上
    startWeek: 1,
    endWeek: 16,
    weekType: 'all',
    notes: '热力学第一定律与卡诺循环效率分析',
  },
  // 周四: 7~8节连堂 (1-16周 单周上课)
  {
    id: 'lesson-8',
    subject: '电磁场与微波技术',
    classId: 'class-4',
    classroom: '第一教学楼 A201',
    dayOfWeek: 4,
    timeSlotId: 'slot-7',
    durationSlots: 2, // 7~8节连上
    startWeek: 1,
    endWeek: 16,
    weekType: 'single', // 单周
    notes: '麦克斯韦方程组微分形式解析 (仅单周授课)',
  },
  // 周五: 3~4节连堂 (12-20周 双周学术讲座)
  {
    id: 'lesson-9',
    subject: '量子信息与前沿讲座',
    classId: 'class-3',
    classroom: '逸夫科技馆 301阶梯教室',
    dayOfWeek: 5,
    timeSlotId: 'slot-3',
    durationSlots: 2, // 3~4节连上
    startWeek: 12,
    endWeek: 20,
    weekType: 'double', // 双周
    notes: '前沿学术研讨：量子纠缠态与量子密钥分发 QKD',
  },
  // 周五: 9~10节晚间连堂 (1-8周)
  {
    id: 'lesson-10',
    subject: '工程伦理与科学精神',
    classId: 'class-1',
    classroom: '第一教学楼 A201',
    dayOfWeek: 5,
    timeSlotId: 'slot-9',
    durationSlots: 2, // 9~10节晚间连堂
    startWeek: 1,
    endWeek: 8,
    weekType: 'all',
    notes: '人工智能算法伦理与学术规范研讨案例',
  },
];

export const DEFAULT_PROFILE: TeacherProfile = {
  name: '张明远 教授',
  title: '博士生导师 / 计算机与物理教研室主任',
  school: '华东理工大学 / 信息与物理学院',
  semester: '2025-2026学年 第二学期',
  phone: '139-8888-6666',
  totalWeeklyTarget: 16,
};

export const DEFAULT_CONFIG: TimetableConfig = {
  showWeekends: false, // 默认周一至周五，可一键切换7天
  activeWeekType: 'all',
  currentWeekNumber: 3, // 当前实际第3教学周
  selectedWeek: 'all', // 默认展示全景周课表，也可点选具体第X周
  totalWeeks: 20, // 大学常见 16-20 周
};

const STORAGE_KEYS = {
  CLASSES: 'teacher_timetable_classes_v2',
  TIME_SLOTS: 'teacher_timetable_slots_v2',
  LESSONS: 'teacher_timetable_lessons_v2',
  PROFILE: 'teacher_timetable_profile_v2',
  CONFIG: 'teacher_timetable_config_v2',
};

export function loadClasses(): ClassInfo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CLASSES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_CLASSES;
}

export function saveClasses(classes: ClassInfo[]) {
  localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
}

export function loadTimeSlots(): TimeSlot[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TIME_SLOTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_TIME_SLOTS;
}

export function saveTimeSlots(slots: TimeSlot[]) {
  localStorage.setItem(STORAGE_KEYS.TIME_SLOTS, JSON.stringify(slots));
}

export function loadLessons(): CourseLesson[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LESSONS);
    if (raw) {
      const parsed: CourseLesson[] = JSON.parse(raw);
      // 兼容老数据升级补丁
      return parsed.map((l) => ({
        ...l,
        durationSlots: l.durationSlots || 1,
        startWeek: l.startWeek || 1,
        endWeek: l.endWeek || 16,
        weekType: l.weekType || 'all',
      }));
    }
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_LESSONS;
}

export function saveLessons(lessons: CourseLesson[]) {
  localStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(lessons));
}

export function loadProfile(): TeacherProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_PROFILE;
}

export function saveProfile(profile: TeacherProfile) {
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
}

export function loadConfig(): TimetableConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_CONFIG,
        ...parsed,
        selectedWeek: parsed.selectedWeek !== undefined ? parsed.selectedWeek : 'all',
      };
    }
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_CONFIG;
}

export function saveConfig(config: TimetableConfig) {
  localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
}

export function resetToDefaults() {
  localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(DEFAULT_CLASSES));
  localStorage.setItem(STORAGE_KEYS.TIME_SLOTS, JSON.stringify(DEFAULT_TIME_SLOTS));
  localStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(DEFAULT_LESSONS));
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(DEFAULT_PROFILE));
  localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(DEFAULT_CONFIG));
}

// 导出为 CSV / Excel 友好格式 (包含连堂节次与开课周次)
export function exportToCSV(
  lessons: CourseLesson[],
  classes: ClassInfo[],
  slots: TimeSlot[],
  profile: TeacherProfile
): string {
  const dayNames: Record<number, string> = {
    1: '周一',
    2: '周二',
    3: '周三',
    4: '周四',
    5: '周五',
    6: '周六',
    7: '周日',
  };

  const headers = [
    '星期',
    '节次范围',
    '上课时间',
    '连上节数',
    '课程名称',
    '授课班级',
    '上课教室/实验室',
    '开课周次',
    '备课/实验备注',
  ];

  const rows = lessons.map((lesson) => {
    const cls = classes.find((c) => c.id === lesson.classId);
    const span = formatLessonSlotSpan(lesson, slots);
    const dayStr = dayNames[lesson.dayOfWeek] || `周${lesson.dayOfWeek}`;
    const className = cls?.name || '未知班级';
    const weekStr = formatWeekRange(lesson);
    const notesStr = (lesson.notes || '').replace(/[\r\n,]/g, ' ');

    return [
      dayStr,
      `"${span.slotName}"`,
      `"${span.timeRange}"`,
      `"${span.duration}节"`,
      `"${lesson.subject}"`,
      `"${className}"`,
      `"${lesson.classroom}"`,
      `"${weekStr}"`,
      `"${notesStr}"`,
    ].join(',');
  });

  const titleRow = `"${profile.school} - ${profile.name} 大学教学课表 (${profile.semester})"`;
  return '\uFEFF' + [titleRow, '', headers.join(','), ...rows].join('\n');
}

// 导出为 iCalendar (.ics) 日历格式 (包含精确连堂起止时间与周次循环)
export function exportToICS(
  lessons: CourseLesson[],
  classes: ClassInfo[],
  slots: TimeSlot[],
  profile: TeacherProfile
): string {
  const now = new Date();
  const pad = (n: number) => (n < 10 ? '0' + n : '' + n);
  const nowStr = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;

  const icsDays = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']; // 1=MO (Monday)

  // 找一个基准周一 (比如当前周的周一)
  const today = new Date();
  const currentDay = today.getDay() === 0 ? 7 : today.getDay(); // 1=Mon, 7=Sun
  const baseMonday = new Date(today);
  baseMonday.setDate(today.getDate() - currentDay + 1);

  const events = lessons
    .map((lesson) => {
      const cls = classes.find((c) => c.id === lesson.classId);
      const span = formatLessonSlotSpan(lesson, slots);
      if (!span.startSlot || !span.endSlot) return '';

      // 根据起始周微调初次开课日期
      const startWeek = lesson.startWeek || 1;
      const endWeek = lesson.endWeek || 16;
      const durationWeeks = Math.max(1, endWeek - startWeek + 1);

      const targetDate = new Date(baseMonday);
      targetDate.setDate(baseMonday.getDate() + (lesson.dayOfWeek - 1));

      const [startH, startM] = span.startSlot.startTime.split(':').map(Number);
      const [endH, endM] = span.endSlot.endTime.split(':').map(Number);

      const dtStart = `${targetDate.getFullYear()}${pad(targetDate.getMonth() + 1)}${pad(targetDate.getDate())}T${pad(startH)}${pad(startM)}00`;
      const dtEnd = `${targetDate.getFullYear()}${pad(targetDate.getMonth() + 1)}${pad(targetDate.getDate())}T${pad(endH)}${pad(endM)}00`;

      const dayCode = icsDays[lesson.dayOfWeek % 7];
      const interval = lesson.weekType === 'single' || lesson.weekType === 'double' ? 2 : 1;
      const weekDesc = formatWeekRange(lesson);

      return [
        'BEGIN:VEVENT',
        `UID:lesson-${lesson.id}-${Date.now()}@teacher-schedule`,
        `DTSTAMP:${nowStr}`,
        `DTSTART;TZID=Asia/Shanghai:${dtStart}`,
        `DTEND;TZID=Asia/Shanghai:${dtEnd}`,
        `RRULE:FREQ=WEEKLY;INTERVAL=${interval};BYDAY=${dayCode};COUNT=${durationWeeks}`,
        `SUMMARY:[${cls?.name || '班级'}] ${lesson.subject} (${span.slotName})`,
        `LOCATION:${lesson.classroom}`,
        `DESCRIPTION:教师: ${profile.name}\\n周次: ${weekDesc}\\n节次: ${span.slotName} (${span.timeRange})\\n教室: ${lesson.classroom}\\n班级: ${cls?.name || ''}\\n备注: ${lesson.notes || '无'}`,
        'BEGIN:VALARM',
        'TRIGGER:-PT15M',
        'ACTION:DISPLAY',
        `DESCRIPTION:即将开始: [${cls?.name || ''}] ${lesson.subject} (${span.slotName})`,
        'END:VALARM',
        'END:VEVENT',
      ].join('\r\n');
    })
    .filter(Boolean)
    .join('\r\n');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//University Teacher Timetable System//CN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${profile.name} - 大学教学课表`,
    'X-WR-TIMEZONE:Asia/Shanghai',
    events,
    'END:VCALENDAR',
  ].join('\r\n');
}

// 下载通用文件
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
