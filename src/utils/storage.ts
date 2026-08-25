import { ClassInfo, CourseLesson, TeacherProfile, TimeSlot, TimetableConfig } from '../types';
import { CLASS_PALETTES } from './colorPalette';

export const DEFAULT_CLASSES: ClassInfo[] = [
  {
    id: 'class-1',
    name: '高一(1)班',
    grade: '高一年级',
    color: CLASS_PALETTES[0].color,
    bgLightColor: CLASS_PALETTES[0].bgLightColor,
    textColor: CLASS_PALETTES[0].textColor,
    borderColor: CLASS_PALETTES[0].borderColor,
    studentCount: 48,
    classroomDefault: '笃行楼 101室',
    remarks: '班长：张小华 (13800000001)',
  },
  {
    id: 'class-2',
    name: '高一(3)班',
    grade: '高一年级',
    color: CLASS_PALETTES[1].color,
    bgLightColor: CLASS_PALETTES[1].bgLightColor,
    textColor: CLASS_PALETTES[1].textColor,
    borderColor: CLASS_PALETTES[1].borderColor,
    studentCount: 46,
    classroomDefault: '笃行楼 103室',
    remarks: '理科重点班，注重课堂实验',
  },
  {
    id: 'class-3',
    name: '高二(2)班',
    grade: '高二年级',
    color: CLASS_PALETTES[2].color,
    bgLightColor: CLASS_PALETTES[2].bgLightColor,
    textColor: CLASS_PALETTES[2].textColor,
    borderColor: CLASS_PALETTES[2].borderColor,
    studentCount: 50,
    classroomDefault: '致远楼 202室',
    remarks: '多媒体教室使用',
  },
  {
    id: 'class-4',
    name: '高三培优班',
    grade: '高三年级',
    color: CLASS_PALETTES[3].color,
    bgLightColor: CLASS_PALETTES[3].bgLightColor,
    textColor: CLASS_PALETTES[3].textColor,
    borderColor: CLASS_PALETTES[3].borderColor,
    studentCount: 35,
    classroomDefault: '弘毅楼 301阶梯教室',
    remarks: '高考强化冲刺班',
  },
  {
    id: 'class-5',
    name: '物理实验(拓展)',
    grade: '全校选修',
    color: CLASS_PALETTES[5].color,
    bgLightColor: CLASS_PALETTES[5].bgLightColor,
    textColor: CLASS_PALETTES[5].textColor,
    borderColor: CLASS_PALETTES[5].borderColor,
    studentCount: 30,
    classroomDefault: '科技实验楼 402电学实验室',
    remarks: '需提前10分钟准备实验仪器',
  },
];

export const DEFAULT_TIME_SLOTS: TimeSlot[] = [
  { id: 'slot-0', name: '早读', startTime: '07:30', endTime: '08:00', section: 'morning' },
  { id: 'slot-1', name: '第1节', startTime: '08:00', endTime: '08:45', section: 'morning' },
  { id: 'slot-2', name: '第2节', startTime: '08:55', endTime: '09:40', section: 'morning' },
  { id: 'slot-break-1', name: '大课间·操场跑操', startTime: '09:40', endTime: '10:10', section: 'break', isBreak: true },
  { id: 'slot-3', name: '第3节', startTime: '10:10', endTime: '10:55', section: 'morning' },
  { id: 'slot-4', name: '第4节', startTime: '11:05', endTime: '11:50', section: 'morning' },
  { id: 'slot-lunch', name: '午餐与午休', startTime: '11:50', endTime: '14:00', section: 'break', isBreak: true },
  { id: 'slot-5', name: '第5节', startTime: '14:00', endTime: '14:45', section: 'afternoon' },
  { id: 'slot-6', name: '第6节', startTime: '14:55', endTime: '15:40', section: 'afternoon' },
  { id: 'slot-7', name: '第7节', startTime: '15:55', endTime: '16:40', section: 'afternoon' },
  { id: 'slot-8', name: '第8节·答疑/自习', startTime: '16:50', endTime: '17:35', section: 'afternoon' },
  { id: 'slot-9', name: '晚自习辅导', startTime: '19:00', endTime: '21:00', section: 'evening' },
];

export const DEFAULT_LESSONS: CourseLesson[] = [
  // 周一
  {
    id: 'lesson-1',
    subject: '高中物理 (必修一)',
    classId: 'class-1',
    classroom: '笃行楼 101室',
    dayOfWeek: 1,
    timeSlotId: 'slot-1',
    weekType: 'all',
    notes: '牛顿第二定律公式推导与随堂演练',
  },
  {
    id: 'lesson-2',
    subject: '高中物理 (必修一)',
    classId: 'class-2',
    classroom: '笃行楼 103室',
    dayOfWeek: 1,
    timeSlotId: 'slot-2',
    weekType: 'all',
    notes: '讲评上周周测试卷第一大题',
  },
  {
    id: 'lesson-3',
    subject: '物理专题强化',
    classId: 'class-4',
    classroom: '弘毅楼 301阶梯教室',
    dayOfWeek: 1,
    timeSlotId: 'slot-5',
    weekType: 'all',
    notes: '带电粒子在复合场中的运动轨迹分析',
  },
  // 周二
  {
    id: 'lesson-4',
    subject: '电磁学综合 (选修)',
    classId: 'class-3',
    classroom: '致远楼 202室',
    dayOfWeek: 2,
    timeSlotId: 'slot-3',
    weekType: 'all',
    notes: '楞次定律与法拉第电磁感应定律',
  },
  {
    id: 'lesson-5',
    subject: '高中物理 (必修一)',
    classId: 'class-1',
    classroom: '笃行楼 101室',
    dayOfWeek: 2,
    timeSlotId: 'slot-4',
    weekType: 'all',
    notes: '摩擦力实验验证与习题订正',
  },
  {
    id: 'lesson-6',
    subject: '物理实验(拓展探究)',
    classId: 'class-5',
    classroom: '科技实验楼 402电学实验室',
    dayOfWeek: 2,
    timeSlotId: 'slot-7',
    weekType: 'all',
    notes: '分组实验：示波器的使用与波形调试',
  },
  // 周三
  {
    id: 'lesson-7',
    subject: '高中物理 (必修一)',
    classId: 'class-2',
    classroom: '笃行楼 103室',
    dayOfWeek: 3,
    timeSlotId: 'slot-1',
    weekType: 'all',
    notes: '自由落体运动规律解析',
  },
  {
    id: 'lesson-8',
    subject: '电磁学综合 (选修)',
    classId: 'class-3',
    classroom: '致远楼 202室',
    dayOfWeek: 3,
    timeSlotId: 'slot-2',
    weekType: 'all',
    notes: '电容器充放电曲线演示',
  },
  {
    id: 'lesson-9',
    subject: '晚自习值班与个别答疑',
    classId: 'class-1',
    classroom: '笃行楼 101室',
    dayOfWeek: 3,
    timeSlotId: 'slot-9',
    weekType: 'all',
    notes: '收取第3单元课后作业并现场答疑',
  },
  // 周四
  {
    id: 'lesson-10',
    subject: '物理专题强化',
    classId: 'class-4',
    classroom: '弘毅楼 301阶梯教室',
    dayOfWeek: 4,
    timeSlotId: 'slot-3',
    weekType: 'all',
    notes: '高考压轴力电综合题型模型拆解',
  },
  {
    id: 'lesson-11',
    subject: '高中物理 (必修一)',
    classId: 'class-1',
    classroom: '笃行楼 101室',
    dayOfWeek: 4,
    timeSlotId: 'slot-6',
    weekType: 'all',
    notes: '章节知识点树状导图串讲',
  },
  // 周五
  {
    id: 'lesson-12',
    subject: '高中物理 (必修一)',
    classId: 'class-2',
    classroom: '笃行楼 103室',
    dayOfWeek: 5,
    timeSlotId: 'slot-2',
    weekType: 'all',
    notes: '力学微型单元自测 (25分钟)',
  },
  {
    id: 'lesson-13',
    subject: '电磁学综合 (选修)',
    classId: 'class-3',
    classroom: '致远楼 202室',
    dayOfWeek: 5,
    timeSlotId: 'slot-4',
    weekType: 'all',
    notes: '电磁感应中动力学与能量守恒分析',
  },
  {
    id: 'lesson-14',
    subject: '课后个别辅导答疑',
    classId: 'class-2',
    classroom: '笃行楼 103室',
    dayOfWeek: 5,
    timeSlotId: 'slot-8',
    weekType: 'all',
    notes: '针对力学弱项学生进行个别辅导',
  },
];

export const DEFAULT_PROFILE: TeacherProfile = {
  name: '张明远 老师',
  title: '高级物理教师 / 物理教研组组长',
  school: '第一实验高级中学',
  semester: '2025-2026学年 第二学期',
  phone: '139-8888-6666',
  totalWeeklyTarget: 14,
};

export const DEFAULT_CONFIG: TimetableConfig = {
  showWeekends: false, // 默认周一至周五，可一键切换7天
  activeWeekType: 'all',
  currentWeekNumber: 3,
  totalWeeks: 20,
};

const STORAGE_KEYS = {
  CLASSES: 'teacher_timetable_classes_v1',
  TIME_SLOTS: 'teacher_timetable_slots_v1',
  LESSONS: 'teacher_timetable_lessons_v1',
  PROFILE: 'teacher_timetable_profile_v1',
  CONFIG: 'teacher_timetable_config_v1',
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
    if (raw) return JSON.parse(raw);
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
    if (raw) return JSON.parse(raw);
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

// 导出为 CSV / Excel 友好格式
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

  const headers = ['星期', '节次', '上课时间', '课程名称', '授课班级', '上课教室', '单双周', '备课/作业备注'];
  const rows = lessons.map((lesson) => {
    const cls = classes.find((c) => c.id === lesson.classId);
    const slot = slots.find((s) => s.id === lesson.timeSlotId);
    const dayStr = dayNames[lesson.dayOfWeek] || `周${lesson.dayOfWeek}`;
    const slotName = slot?.name || '';
    const timeStr = slot ? `${slot.startTime}-${slot.endTime}` : '';
    const className = cls?.name || '未知班级';
    const weekTypeStr = lesson.weekType === 'all' ? '每周' : lesson.weekType === 'single' ? '单周' : '双周';
    const notesStr = (lesson.notes || '').replace(/[\r\n,]/g, ' ');

    return [
      dayStr,
      `"${slotName}"`,
      `"${timeStr}"`,
      `"${lesson.subject}"`,
      `"${className}"`,
      `"${lesson.classroom}"`,
      `"${weekTypeStr}"`,
      `"${notesStr}"`,
    ].join(',');
  });

  const titleRow = `"${profile.school} - ${profile.name} 教师课表 (${profile.semester})"`;
  return '\uFEFF' + [titleRow, '', headers.join(','), ...rows].join('\n');
}

// 导出为 iCalendar (.ics) 日历格式 (供苹果日历、Google日历、Outlook导入)
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
  const monday = new Date(today);
  monday.setDate(today.getDate() - currentDay + 1);

  const events = lessons
    .map((lesson) => {
      const cls = classes.find((c) => c.id === lesson.classId);
      const slot = slots.find((s) => s.id === lesson.timeSlotId);
      if (!slot) return '';

      const targetDate = new Date(monday);
      targetDate.setDate(monday.getDate() + (lesson.dayOfWeek - 1));

      const [startH, startM] = slot.startTime.split(':').map(Number);
      const [endH, endM] = slot.endTime.split(':').map(Number);

      const dtStart = `${targetDate.getFullYear()}${pad(targetDate.getMonth() + 1)}${pad(targetDate.getDate())}T${pad(startH)}${pad(startM)}00`;
      const dtEnd = `${targetDate.getFullYear()}${pad(targetDate.getMonth() + 1)}${pad(targetDate.getDate())}T${pad(endH)}${pad(endM)}00`;

      const dayCode = icsDays[lesson.dayOfWeek % 7];

      return [
        'BEGIN:VEVENT',
        `UID:lesson-${lesson.id}-${Date.now()}@teacher-schedule`,
        `DTSTAMP:${nowStr}`,
        `DTSTART;TZID=Asia/Shanghai:${dtStart}`,
        `DTEND;TZID=Asia/Shanghai:${dtEnd}`,
        `RRULE:FREQ=WEEKLY;BYDAY=${dayCode};COUNT=20`,
        `SUMMARY:[${cls?.name || '班级'}] ${lesson.subject}`,
        `LOCATION:${lesson.classroom}`,
        `DESCRIPTION:教师: ${profile.name}\\n教室: ${lesson.classroom}\\n班级: ${cls?.name || ''}\\n备注: ${lesson.notes || '无'}`,
        'BEGIN:VALARM',
        'TRIGGER:-PT10M',
        'ACTION:DISPLAY',
        `DESCRIPTION:即将开始: [${cls?.name || ''}] ${lesson.subject}`,
        'END:VALARM',
        'END:VEVENT',
      ].join('\r\n');
    })
    .filter(Boolean)
    .join('\r\n');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Teacher Timetable System//CN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${profile.name} - 教学课表`,
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
