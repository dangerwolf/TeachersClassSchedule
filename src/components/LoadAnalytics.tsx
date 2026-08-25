import React from 'react';
import { ClassInfo, CourseLesson, TeacherProfile, TimeSlot } from '../types';
import { DAYS_CONFIG } from '../utils/colorPalette';
import { BarChart3, Users, BookOpen, Clock, Building, Award, Target, Flame } from 'lucide-react';

interface LoadAnalyticsProps {
  lessons: CourseLesson[];
  classes: ClassInfo[];
  timeSlots: TimeSlot[];
  profile: TeacherProfile;
}

export const LoadAnalytics: React.FC<LoadAnalyticsProps> = ({
  lessons,
  classes,
  timeSlots,
  profile,
}) => {
  const totalLessons = lessons.length;
  const targetLessons = profile.totalWeeklyTarget || 14;
  const progressPercent = Math.min(100, Math.round((totalLessons / targetLessons) * 100));

  // Total students reached
  const totalStudents = classes.reduce((sum, cls) => sum + (cls.studentCount || 0), 0);

  // Distinct classrooms
  const classrooms = Array.from(new Set(lessons.map((l) => l.classroom).filter(Boolean)));

  // Class lesson counts
  const classBreakdown = classes.map((cls) => {
    const count = lessons.filter((l) => l.classId === cls.id).length;
    const pct = totalLessons > 0 ? Math.round((count / totalLessons) * 100) : 0;
    return {
      cls,
      count,
      pct,
    };
  });

  // Daily lesson counts
  const dailyBreakdown = DAYS_CONFIG.slice(0, 5).map((d) => {
    const count = lessons.filter((l) => l.dayOfWeek === d.day).length;
    return {
      day: d,
      count,
    };
  });
  const maxDayCount = Math.max(1, ...dailyBreakdown.map((d) => d.count));

  // Morning vs Afternoon vs Evening
  const morningCount = lessons.filter((l) => {
    const slot = timeSlots.find((s) => s.id === l.timeSlotId);
    return slot?.section === 'morning';
  }).length;

  const afternoonCount = lessons.filter((l) => {
    const slot = timeSlots.find((s) => s.id === l.timeSlotId);
    return slot?.section === 'afternoon';
  }).length;

  const eveningCount = lessons.filter((l) => {
    const slot = timeSlots.find((s) => s.id === l.timeSlotId);
    return slot?.section === 'evening';
  }).length;

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
            <div className="text-xs font-semibold text-slate-500">周总课时 / 计划</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">
              {totalLessons} <span className="text-xs font-normal text-slate-500">/ {targetLessons} 节</span>
            </div>
            <div className="text-[11px] font-medium text-emerald-600 mt-0.5 flex items-center gap-1">
              <span>达成率: {progressPercent}%</span>
            </div>
          </div>
        </div>

        {/* Card 2: Student Population */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">覆盖学生总数</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">
              {totalStudents} <span className="text-xs font-normal text-slate-500">人</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              分布在 {classes.length} 个班级
            </div>
          </div>
        </div>

        {/* Card 3: Classrooms */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">授课场所 / 教室</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">
              {classrooms.length} <span className="text-xs font-normal text-slate-500">间</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[140px]">
              实验室、多媒体等
            </div>
          </div>
        </div>

        {/* Card 4: Daily Average */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">日均授课负荷</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">
              {(totalLessons / 5).toFixed(1)} <span className="text-xs font-normal text-slate-500">节/天</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              工作日标准负荷
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Class Workload Breakdown with Brand Colors */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-600" />
              <span>各班级课时分布与占比</span>
            </h3>
            <span className="text-xs text-slate-400 font-medium">按班级色彩标记</span>
          </div>

          <div className="space-y-4">
            {classBreakdown.map(({ cls, count, pct }) => (
              <div key={cls.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: cls.color }}
                    />
                    <span className="text-slate-800">{cls.name}</span>
                    {cls.grade && (
                      <span className="text-[11px] text-slate-400 font-normal">({cls.grade})</span>
                    )}
                  </div>
                  <div className="text-slate-600 font-mono">
                    <strong className="text-slate-900">{count}</strong> 节 ({pct}%)
                  </div>
                </div>

                {/* Progress bar with class's specific color */}
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
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

        {/* Daily Distribution Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                <span>工作日授课节奏 (周一至周五)</span>
              </h3>
              <span className="text-xs text-slate-400 font-medium">每日课时对比</span>
            </div>

            {/* Bar Chart Visual */}
            <div className="grid grid-cols-5 gap-3 pt-6 pb-2 items-end min-h-[160px]">
              {dailyBreakdown.map(({ day, count }) => {
                const barHeight = Math.max(15, Math.round((count / maxDayCount) * 100));
                return (
                  <div key={day.day} className="flex flex-col items-center gap-2 h-full justify-end">
                    <span className="text-xs font-bold text-slate-800 font-mono">{count}节</span>
                    <div className="w-full max-w-[48px] bg-slate-100 rounded-t-xl overflow-hidden flex flex-col justify-end h-28">
                      <div
                        style={{ height: `${barHeight}%` }}
                        className={`w-full rounded-t-xl transition-all duration-500 ${
                          count >= 4
                            ? 'bg-gradient-to-t from-rose-500 to-rose-400'
                            : count >= 2
                            ? 'bg-gradient-to-t from-indigo-600 to-indigo-400'
                            : 'bg-gradient-to-t from-sky-400 to-sky-300'
                        }`}
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-600">{day.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Time Section Breakdown (Morning vs Afternoon vs Evening) */}
          <div className="pt-4 mt-4 border-t border-slate-200/80 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-amber-50/70 border border-amber-200/60 p-2.5 rounded-xl">
              <div className="text-amber-800 font-bold">上午课程</div>
              <div className="text-base font-extrabold text-amber-900 mt-0.5">{morningCount} 节</div>
            </div>
            <div className="bg-sky-50/70 border border-sky-200/60 p-2.5 rounded-xl">
              <div className="text-sky-800 font-bold">下午课程</div>
              <div className="text-base font-extrabold text-sky-900 mt-0.5">{afternoonCount} 节</div>
            </div>
            <div className="bg-indigo-50/70 border border-indigo-200/60 p-2.5 rounded-xl">
              <div className="text-indigo-800 font-bold">晚自习/辅导</div>
              <div className="text-base font-extrabold text-indigo-900 mt-0.5">{eveningCount} 节</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
