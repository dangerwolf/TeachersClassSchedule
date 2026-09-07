import React, { useState, useEffect } from 'react';
import { ClassInfo, CourseLesson, DayOfWeek, TimeSlot, TimetableConfig } from '../types';
import { DAYS_CONFIG } from '../utils/colorPalette';
import {
  formatLessonSlotSpan,
  formatWeekRange,
  isLessonActiveInWeek,
} from '../utils/lessonHelper';
import {
  Clock,
  MapPin,
  CheckCircle2,
  ChevronRight,
  Calendar as CalendarIcon,
  StickyNote,
  BellRing,
  Layers,
  Sparkles,
} from 'lucide-react';

interface TodayTimelineProps {
  lessons: CourseLesson[];
  classes: ClassInfo[];
  timeSlots: TimeSlot[];
  config?: TimetableConfig;
  onEditLesson: (lesson: CourseLesson) => void;
  onAddLessonAt: (day: DayOfWeek, timeSlotId: string) => void;
}

export const TodayTimeline: React.FC<TodayTimelineProps> = ({
  lessons,
  classes,
  timeSlots,
  config,
  onEditLesson,
  onAddLessonAt,
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [activeDay, setActiveDay] = useState<DayOfWeek>(() => {
    const d = new Date().getDay();
    return (d === 0 ? 7 : d) as DayOfWeek;
  });

  const totalWeeks = config?.totalWeeks || 20;
  // 教学周过滤：默认按照系统当前教学周过滤，也可切换为全景
  const [viewWeek, setViewWeek] = useState<number | 'all'>(
    config?.currentWeekNumber || 3
  );

  // 每秒更新当前时间
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentDayOfWeek = (currentTime.getDay() === 0 ? 7 : currentTime.getDay()) as DayOfWeek;
  const isViewingToday = activeDay === currentDayOfWeek;

  // 过滤出所选星期且符合指定周次（如果选了具体周）的课程
  const dayLessons = lessons
    .filter(
      (l) =>
        l.dayOfWeek === activeDay &&
        isLessonActiveInWeek(l, viewWeek, totalWeeks)
    )
    .sort((a, b) => {
      const spanA = formatLessonSlotSpan(a, timeSlots);
      const spanB = formatLessonSlotSpan(b, timeSlots);
      return (spanA.startSlot?.startTime || '').localeCompare(
        spanB.startSlot?.startTime || ''
      );
    });

  const getClassById = (id: string) => classes.find((c) => c.id === id);

  // 计算当前时间的分钟数 (0~1440)
  const currentHours = currentTime.getHours();
  const currentMinutes = currentTime.getMinutes();
  const currentMinutesFromMidnight = currentHours * 60 + currentMinutes;

  // 连堂时段识别：寻找当前正在进行或下一节开始的课程
  let currentActiveLesson: {
    lesson: CourseLesson;
    span: ReturnType<typeof formatLessonSlotSpan>;
  } | null = null;

  let nextUpcomingLesson: {
    lesson: CourseLesson;
    span: ReturnType<typeof formatLessonSlotSpan>;
    minutesUntil: number;
  } | null = null;

  if (isViewingToday) {
    for (const lesson of dayLessons) {
      const span = formatLessonSlotSpan(lesson, timeSlots);
      if (!span.startSlot || !span.endSlot) continue;

      const [startH, startM] = span.startSlot.startTime.split(':').map(Number);
      const [endH, endM] = span.endSlot.endTime.split(':').map(Number);
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;

      if (
        currentMinutesFromMidnight >= startMinutes &&
        currentMinutesFromMidnight <= endMinutes
      ) {
        currentActiveLesson = { lesson, span };
        break;
      } else if (currentMinutesFromMidnight < startMinutes) {
        const diff = startMinutes - currentMinutesFromMidnight;
        if (!nextUpcomingLesson || diff < nextUpcomingLesson.minutesUntil) {
          nextUpcomingLesson = { lesson, span, minutesUntil: diff };
        }
      }
    }
  }

  const formatTimeString = (d: Date) => {
    return d.toLocaleTimeString('zh-CN', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDateString = (d: Date) => {
    return d.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* 教学周筛选器 */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-800">
              {viewWeek === 'all'
                ? '全学期日程概览'
                : `第 ${viewWeek} 教学周授课日程`}
            </span>
            <span className="text-[11px] text-slate-500 ml-2">
              (系统当前为第 {config?.currentWeekNumber || 3} 周)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setViewWeek(config?.currentWeekNumber || 3)}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
              viewWeek === config?.currentWeekNumber
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
            }`}
          >
            看本周 (第{config?.currentWeekNumber || 3}周)
          </button>
          <button
            onClick={() => setViewWeek('all')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
              viewWeek === 'all'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            全部周
          </button>
        </div>
      </div>

      {/* 星期快捷切换药丸 */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between gap-1 overflow-x-auto">
        {DAYS_CONFIG.map((d) => {
          const isSelected = activeDay === d.day;
          const isRealToday = currentDayOfWeek === d.day;
          const count = lessons.filter(
            (l) =>
              l.dayOfWeek === d.day &&
              isLessonActiveInWeek(l, viewWeek, totalWeeks)
          ).length;

          return (
            <button
              key={d.day}
              onClick={() => setActiveDay(d.day)}
              className={`flex-1 min-w-[72px] py-2 px-3 rounded-xl flex flex-col items-center justify-center transition-all ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-xs font-semibold scale-102'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-1">
                <span className="text-xs">{d.name}</span>
                {isRealToday && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected ? 'bg-amber-300' : 'bg-indigo-600'
                    }`}
                  />
                )}
              </div>
              <span
                className={`text-[11px] font-mono mt-0.5 ${
                  isSelected ? 'text-indigo-100' : 'text-slate-400'
                }`}
              >
                {count}门课
              </span>
            </button>
          );
        })}
      </div>

      {/* 实时上课英雄状态卡 */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-md relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="absolute left-1/2 -top-12 w-64 h-64 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 text-indigo-200 text-xs sm:text-sm font-medium mb-1">
              <CalendarIcon className="w-4 h-4" />
              <span>{formatDateString(currentTime)}</span>
              <span className="text-indigo-300">
                (第{config?.currentWeekNumber || 3}周)
              </span>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono text-white flex items-baseline gap-3">
              <span>{formatTimeString(currentTime)}</span>
              {isViewingToday && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-sans font-medium animate-pulse">
                  ● 连堂实时检测
                </span>
              )}
            </div>
          </div>

          {/* 实时课程指示器 */}
          {isViewingToday && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 min-w-[280px]">
              {currentActiveLesson ? (
                <div>
                  <div className="flex items-center justify-between text-xs text-amber-300 font-semibold mb-1">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                      正在上课中 ({currentActiveLesson.span.slotName})
                    </span>
                    <span className="font-mono text-amber-200 text-[11px]">
                      {currentActiveLesson.span.timeRange}
                    </span>
                  </div>
                  <div className="text-base font-bold text-white">
                    {currentActiveLesson.lesson.subject}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-indigo-100 mt-1.5">
                    <span className="font-semibold">
                      {getClassById(currentActiveLesson.lesson.classId)?.name}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-amber-300" />
                      {currentActiveLesson.lesson.classroom}
                    </span>
                  </div>
                </div>
              ) : nextUpcomingLesson ? (
                <div>
                  <div className="flex items-center justify-between text-xs text-sky-300 font-semibold mb-1">
                    <span className="flex items-center gap-1">
                      <BellRing className="w-3.5 h-3.5" />
                      下一节课预告 ({nextUpcomingLesson.span.slotName})
                    </span>
                    <span className="px-2 py-0.5 bg-sky-400/20 text-sky-200 rounded-full font-mono text-[10px]">
                      约 {nextUpcomingLesson.minutesUntil} 分钟后
                    </span>
                  </div>
                  <div className="text-base font-bold text-white">
                    {nextUpcomingLesson.lesson.subject}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-indigo-100 mt-1.5">
                    <span className="font-semibold">
                      {getClassById(nextUpcomingLesson.lesson.classId)?.name}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-sky-300" />
                      {nextUpcomingLesson.lesson.classroom}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-indigo-200 text-sm py-1">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>今日课程均已授课完毕或暂无待上课程，辛苦啦！</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 课程列表 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>{DAYS_CONFIG.find((d) => d.day === activeDay)?.full} 课程安排</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
              共 {dayLessons.length} 门课程
            </span>
          </h2>
          <button
            onClick={() => onAddLessonAt(activeDay, timeSlots[0]?.id || 'slot-1')}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
          >
            <span>+ 为今天加课</span>
          </button>
        </div>

        {dayLessons.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-10 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">该天暂无开课安排</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              此教学周该天无课，可点击上方按钮添加新课程或切换其他教学周查看。
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {dayLessons.map((lesson) => {
              const cls = getClassById(lesson.classId);
              const span = formatLessonSlotSpan(lesson, timeSlots);
              const weekDesc = formatWeekRange(lesson);
              const isMultiSlot = (lesson.durationSlots || 1) > 1;

              // 计算当前课程实时状态
              let statusText = '待上课';
              let statusBadgeClass = 'bg-slate-100 text-slate-600';
              if (isViewingToday && span.startSlot && span.endSlot) {
                const [startH, startM] = span.startSlot.startTime.split(':').map(Number);
                const [endH, endM] = span.endSlot.endTime.split(':').map(Number);
                const startMins = startH * 60 + startM;
                const endMins = endH * 60 + endM;

                if (currentMinutesFromMidnight > endMins) {
                  statusText = '已结束';
                  statusBadgeClass = 'bg-slate-100 text-slate-400';
                } else if (
                  currentMinutesFromMidnight >= startMins &&
                  currentMinutesFromMidnight <= endMins
                ) {
                  statusText = '正在上课';
                  statusBadgeClass =
                    'bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold';
                } else if (startMins - currentMinutesFromMidnight <= 30) {
                  statusText = '即将开始';
                  statusBadgeClass =
                    'bg-amber-100 text-amber-800 border border-amber-300 font-bold';
                }
              }

              return (
                <div
                  key={lesson.id}
                  onClick={() => onEditLesson(lesson)}
                  style={{
                    borderLeftColor: cls?.color || '#4f46e5',
                    borderLeftWidth: '5px',
                  }}
                  className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    {/* Time Slot Column */}
                    <div className="w-28 shrink-0">
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                        <span>{span.slotName}</span>
                        {isMultiSlot && (
                          <span className="px-1 py-0.2 bg-indigo-50 text-indigo-700 text-[9px] font-bold rounded">
                            {span.duration}节连堂
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-mono text-slate-500 mt-0.5">
                        {span.timeRange}
                      </div>
                      <span
                        className={`inline-block mt-1 px-2 py-0.5 text-[10px] rounded-md ${statusBadgeClass}`}
                      >
                        {statusText}
                      </span>
                    </div>

                    {/* Class & Subject Details */}
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span
                          style={{
                            backgroundColor: cls?.color || '#4f46e5',
                            color: '#ffffff',
                          }}
                          className="px-2.5 py-0.5 rounded-full text-xs font-bold shadow-2xs"
                        >
                          {cls?.name || '班级'}
                        </span>
                        {cls?.grade && (
                          <span className="text-[11px] text-slate-500 font-medium">
                            {cls.grade}
                          </span>
                        )}
                        <span className="text-[10px] px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200/80 rounded font-semibold">
                          📅 {weekDesc}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {lesson.subject}
                      </h3>

                      <div className="flex items-center gap-4 text-xs text-slate-600 mt-1.5 flex-wrap">
                        <div className="flex items-center gap-1 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{lesson.classroom}</span>
                        </div>
                        {cls?.studentCount && (
                          <span className="text-slate-400">
                            学生: {cls.studentCount}人
                          </span>
                        )}
                      </div>

                      {/* Notes */}
                      {lesson.notes && (
                        <div className="mt-2 text-xs text-slate-600 bg-amber-50/70 border border-amber-200/60 rounded-xl p-2.5 flex items-start gap-1.5">
                          <StickyNote className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <span>{lesson.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-end sm:justify-center">
                    <span className="text-xs text-slate-400 group-hover:text-indigo-600 font-medium flex items-center gap-1">
                      <span>编辑课程</span>
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
