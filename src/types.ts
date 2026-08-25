export type DayOfWeek = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type SectionType = 'morning' | 'afternoon' | 'evening' | 'break';

export type WeekType = 'all' | 'single' | 'double'; // 全部周、单周、双周

export interface ClassInfo {
  id: string;
  name: string; // e.g. 高一(3)班
  grade?: string; // e.g. 高一年级
  color: string; // Hex color code or palette key
  bgLightColor: string; // Light background tint for card
  textColor: string; // High contrast text color
  borderColor: string;
  studentCount?: number;
  classroomDefault?: string; // 默认教室
  remarks?: string; // 班级备注或班长联系方式
}

export interface TimeSlot {
  id: string;
  name: string; // e.g. 早读, 第1节, 第2节
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  section: SectionType;
  isBreak?: boolean; // 是否是大课间/午休
}

export interface CourseLesson {
  id: string;
  subject: string; // 课程名称 (e.g. 高中物理、力学实验)
  classId: string; // 关联班级
  className?: string; // 班级名称
  classroom: string; // 上课教室 (e.g. 教学楼302、物理实验室)
  dayOfWeek: DayOfWeek; // 1=周一 ~ 7=周日
  timeSlotId: string; // 对应节次
  weekType: WeekType; // 全部周、单周、双周
  notes?: string; // 备课重点 / 作业提醒 / 实验器材
  updatedAt?: number;
}

export interface TeacherProfile {
  name: string; // 教师姓名
  title: string; // 职称/职务 (e.g. 高级物理教师)
  school: string; // 学校名称 (e.g. 实验高级中学)
  semester: string; // 学期 (e.g. 2025-2026学年第二学期)
  phone?: string;
  totalWeeklyTarget?: number; // 每周计划课时数
}

export interface TimetableConfig {
  showWeekends: boolean; // 是否显示周六日 (5天 vs 7天制)
  activeWeekType: WeekType; // 当前查看的周类型 (全部/单周/双周)
  currentWeekNumber: number; // 当前教学周 (第几周)
  totalWeeks: number; // 学期总周数 (默认20周)
}

export type ViewMode = 'grid' | 'today' | 'list' | 'analytics';
