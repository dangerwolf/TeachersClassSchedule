import React from 'react';
import { ClassInfo, CourseLesson, TeacherProfile, TimeSlot, TimetableConfig } from '../types';
import { DAYS_CONFIG } from '../utils/colorPalette';
import {
  formatLessonSlotSpan,
  getLessonActiveWeeks,
  getSlotsOccupiedByLesson,
} from '../utils/lessonHelper';
import {
  Users,
  BookOpen,
  Clock,
  Building,
  Award,
  Target,
  Flame,
  Layers,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface LoadAnalyticsProps {
  lessons: CourseLesson[];
  classes: ClassInfo[];
  timeSlots: TimeSlot[];
  profile: TeacherProfile;
  config?: TimetableConfig;
}

export const LoadAnalytics: React.FC<LoadAnalyticsProps> = ({
  lessons,
  classes,
  timeSlots,
  profile,
  config,
}) => {
  const totalWeeks = config?.totalWeeks || 20;

  // 1. 周均标准教学课时 (连堂课按连上的实际节数核算，如2节连堂算2课时，4节实验算4课时)
  const totalWeeklyTeachingHours = lessons.reduce(
    (sum, l) => sum + (l.durationSlots || 1),
    0
  );
  const targetLessons = profile.totalWeeklyTarget || 16;
  const progressPercent = Math.min(
    100,
    Math.round((totalWeeklyTeachingHours / targetLessons) * 100)
  );

  // 2. 学期总教学学时 (每门课每次学时 * 实际开课周数)
  const semesterTotalHours = lessons.reduce((sum, l) => {
    const activeWeeks = getLessonActiveWeeks(l, totalWeeks);
    const duration = l.durationSlots || 1;
    return sum + duration * activeWeeks.length;
  }, 0);

  // 3. 覆盖学生总数
  const totalStudents = classes.reduce((sum, cls) => sum + (cls.studentCount || 0), 0);

  // 4. 上课教室/实验室
  const classrooms = Array.from(new Set(lessons.map((l) => l.classroom).filter(Boolean)));

  // 5. 连堂模式分布统计 (高校特征: 4节大课/实验, 2节连堂, 3节研讨, 1节单课)
  const multiSlotStats = {
    fourSlot: lessons.filter((l) => (l.durationSlots || 1) === 4),
    threeSlot: lessons.filter((l) => (l.durationSlots || 1) === 3),
    twoSlot: lessons.filter((l) => (l.durationSlots || 1) === 2),
    singleSlot: lessons.filter((l) => (l.durationSlots || 1) === 1),
  };

  // 6. 前后半学期学时分布
  const firstHalfHours = lessons.reduce((sum, l) => {
    const activeWeeks = getLessonActiveWeeks(l, totalWeeks).filter((w) => w <= 8);
    return sum + (l.durationSlots || 1) * activeWeeks.length;
  }, 0);

  const secondHalfHours = lessons.reduce((sum, l) => {
    const activeWeeks = getLessonActiveWeeks(l, totalWeeks).filter((w) => w >= 9);
    return sum + (l.durationSlots || 1) * activeWeeks.length;
  }, 0);

  // 7. 各班级课时与学期总学时分布
  const classBreakdown = classes.map((cls) => {
    const classLessons = lessons.filter((l) => l.classId === cls.id);
    const weeklyHours = classLessons.reduce(
      (sum, l) => sum + (l.durationSlots || 1),
      0
    );
    const totalClassHours = classLessons.reduce((sum, l) => {
      const activeWeeks = getLessonActiveWeeks(l, totalWeeks);
      return sum + (l.durationSlots || 1) * activeWeeks.length;
    }, 0);
    const pct =
      totalWeeklyTeachingHours > 0
        ? Math.round((weeklyHours / totalWeeklyTeachingHours) * 100)
        : 0;

    return {
      cls,
      lessonCount: classLessons.length,
      weeklyHours,
      totalClassHours,
      pct,
    };
  });

  // 8. 每日课时分布 (周一至周五)
  const dailyBreakdown = DAYS_CONFIG.slice(0, 5).map((d) => {
    const dayLessons = lessons.filter((l) => l.dayOfWeek === d.day);
    const hours = dayLessons.reduce((sum, l) => sum + (l.durationSlots || 1), 0);
    return {
      day: d,
      hours,
      count: dayLessons.length,
    };
  });
  const maxDayHours = Math.max(1, ...dailyBreakdown.map((d) => d.hours));

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Weekly Hours */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">周总学时 (含连堂)</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">
              {totalWeeklyTeachingHours}{' '}
              <span className="text-xs font-normal text-slate-500">
                / {targetLessons} 学时
              </span>
            </div>
            <div className="text-[11px] font-medium text-emerald-600 mt-0.5 flex items-center gap-1">
              <span>达成率: {progressPercent}%</span>
            </div>
          </div>
        </div>

        {/* Card 2: Semester Total Hours */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">学期总计划学时</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">
              {semesterTotalHours}{' '}
              <span className="text-xs font-normal text-slate-500">学时</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              按实际开课周数精准累计
            </div>
          </div>
        </div>

        {/* Card 3: Student Population */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">覆盖学生总数</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">
              {totalStudents}{' '}
              <span className="text-xs font-normal text-slate-500">人</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              分布在 {classes.length} 个班级
            </div>
          </div>
        </div>

        {/* Card 4: Classrooms */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">授课场所 / 实验室</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">
              {classrooms.length}{' '}
              <span className="text-xs font-normal text-slate-500">间</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[140px]">
              实验室、多媒体教室等
            </div>
          </div>
        </div>
      </div>

      {/* 高校连堂与学段分布卡片 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* 连堂大课结构分布 */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>授课节次连堂结构</span>
            </h3>
            <span className="text-[11px] text-slate-400">高校教学特征</span>
          </div>

          <div className="space-y-3">
            <div className="p-2.5 bg-indigo-50/60 border border-indigo-100 rounded-xl flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-indigo-950">2节连堂课</div>
                <div className="text-[10px] text-indigo-700">如1~2节, 3~4节常规大课</div>
              </div>
              <div className="text-right">
                <span className="text-base font-bold text-indigo-700 font-mono">
                  {multiSlotStats.twoSlot.length}
                </span>
                <span className="text-[10px] text-slate-500 ml-1">门</span>
              </div>
            </div>

            <div className="p-2.5 bg-sky-50/60 border border-sky-100 rounded-xl flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-sky-950">4节大课 / 综合实验</div>
                <div className="text-[10px] text-sky-700">如5~8节连续实验实训</div>
              </div>
              <div className="text-right">
                <span className="text-base font-bold text-sky-700 font-mono">
                  {multiSlotStats.fourSlot.length}
                </span>
                <span className="text-[10px] text-slate-500 ml-1">门</span>
              </div>
            </div>

            <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900">单节常规课</div>
                <div className="text-[10px] text-slate-500">单独1课时教学</div>
              </div>
              <div className="text-right">
                <span className="text-base font-bold text-slate-700 font-mono">
                  {multiSlotStats.singleSlot.length}
                </span>
                <span className="text-[10px] text-slate-500 ml-1">门</span>
              </div>
            </div>
          </div>
        </div>

        {/* 前后半学期教学工作量均衡度 */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-amber-600" />
              <span>学期阶段负荷分布 (前后半期)</span>
            </h3>
            <span className="text-[11px] text-slate-400">周段开课分析</span>
          </div>

          <div className="space-y-3.5">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">前半学期 (第1~8周)</span>
                <span className="font-bold text-slate-900 font-mono">
                  {firstHalfHours} 学时
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  style={{
                    width: `${
                      semesterTotalHours > 0
                        ? (firstHalfHours / semesterTotalHours) * 100
                        : 0
                    }%`,
                  }}
                  className="h-full bg-amber-500 rounded-full"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">后半学期 (第9~16周及以后)</span>
                <span className="font-bold text-slate-900 font-mono">
                  {secondHalfHours} 学时
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  style={{
                    width: `${
                      semesterTotalHours > 0
                        ? (secondHalfHours / semesterTotalHours) * 100
                        : 0
                    }%`,
                  }}
                  className="h-full bg-indigo-600 rounded-full"
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
              精确支持如 1~10 周基础课结课后，11~18 周进阶实训无缝接力。
            </p>
          </div>
        </div>

        {/* 每日课时负荷分布 */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-rose-600" />
              <span>工作日课时负荷 (周一至周五)</span>
            </h3>
            <span className="text-[11px] text-slate-400">学时负荷</span>
          </div>

          <div className="space-y-2">
            {dailyBreakdown.map(({ day, hours, count }) => {
              const pct = Math.round((hours / maxDayHours) * 100);
              return (
                <div key={day.day} className="flex items-center gap-2 text-xs">
                  <span className="w-10 text-slate-600 font-medium shrink-0">
                    {day.name}
                  </span>
                  <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className={`h-full rounded-full transition-all ${
                        hours >= 6
                          ? 'bg-rose-500'
                          : hours >= 4
                          ? 'bg-indigo-600'
                          : 'bg-emerald-500'
                      }`}
                    />
                  </div>
                  <span className="w-16 text-right font-mono font-bold text-slate-800 shrink-0">
                    {hours} 学时
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Class Workload Breakdown with Brand Colors */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-600" />
            <span>各授课班级工作量与学期总学时统计</span>
          </h3>
          <span className="text-xs text-slate-400 font-medium">包含连堂核算</span>
        </div>

        <div className="space-y-4">
          {classBreakdown.map(({ cls, weeklyHours, totalClassHours, pct, lessonCount }) => (
            <div key={cls.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: cls.color }}
                  />
                  <span className="text-slate-800">{cls.name}</span>
                  {cls.grade && (
                    <span className="text-[11px] text-slate-400 font-normal">
                      ({cls.grade})
                    </span>
                  )}
                </div>
                <div className="text-slate-600 font-mono text-[11px]">
                  周课时: <strong>{weeklyHours}</strong> 节 | 学期总计:{' '}
                  <strong className="text-indigo-600">{totalClassHours}</strong> 学时
                </div>
              </div>

              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: cls.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
