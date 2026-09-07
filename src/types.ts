export type DayOfWeek = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type SectionType = 'morning' | 'afternoon' | 'evening' | 'break';

export type WeekType = 'all' | 'single' | 'double' | 'custom'; // 全部周、单周、双周、自定义周次

export interface ClassInfo {
  id: string;
  name: string; // e.g. 软件2301班 / 高一(3)班
  grade?: string; // e.g. 大二年级 / 本科2023级
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
  name: string; // e.g. 第1节, 第2节
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  section: SectionType;
  isBreak?: boolean; // 是否是大课间/午休
}

export interface CourseLesson {
  id: string;
  subject: string; // 课程名称 (e.g. 高等数学、大学物理实验)
  classId: string; // 关联班级
  className?: string; // 班级名称
  classroom: string; // 上课教室 (e.g. 仙林校区 教学楼J101)
  dayOfWeek: DayOfWeek; // 1=周一 ~ 7=周日
  timeSlotId: string; // 起始节次 ID (e.g. slot-1)
  durationSlots: number; // 连上节数 (1=单节, 2=连上2节(如1~2节), 3=连上3节, 4=4节大课/实验(如5~8节))
  endSlotId?: string; // 结束节次 ID (可选，与 durationSlots 对应)
  startWeek: number; // 起始周 (默认 1)
  endWeek: number; // 结束周 (默认 16 或 20)
  weekType: WeekType; // 'all' (全部周) | 'single' (单周) | 'double' (双周) | 'custom' (指定周)
  customWeeks?: number[]; // 自定义周次勾选 (如 [1, 2, 3, 5, 7])
  notes?: string; // 备课重点 / 实验耗材 / 课后作业
  updatedAt?: number;
}

export interface TeacherProfile {
  name: string; // 教师姓名
  title: string; // 职称/职务 (e.g. 副教授 / 计算机系教研室主任)
  school: string; // 学校名称 (e.g. 华东理工大学 / 计算机学院)
  semester: string; // 学期 (e.g. 2025-2026学年 第二学期)
  phone?: string;
  totalWeeklyTarget?: number; // 每周计划课时数
}

export interface TimetableConfig {
  showWeekends: boolean; // 是否显示周六日 (5天 vs 7天制)
  activeWeekType: WeekType; // 全部/单周/双周 (已兼容)
  currentWeekNumber: number; // 当前实际教学周 (第几周)
  selectedWeek: number | 'all'; // 课表当前筛选查看的周次 (数字表示第几周，'all'表示全部周全景)
  totalWeeks: number; // 学期总周数 (高校通常为 16-20 周，默认20周)
}

export type ViewMode = 'grid' | 'today' | 'list' | 'analytics';

