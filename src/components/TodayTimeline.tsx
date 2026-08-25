import React, { useState, useEffect } from 'react';
import { ClassInfo, CourseLesson, DayOfWeek, TimeSlot } from '../types';
import { DAYS_CONFIG } from '../utils/colorPalette';
import { Clock, MapPin, CheckCircle2, AlertCircle, ChevronRight, Calendar as CalendarIcon, StickyNote, BellRing, Sparkles } from 'lucide-react';

interface TodayTimelineProps {
  lessons: CourseLesson[];
  classes: ClassInfo[];
  timeSlots: TimeSlot[];
  onEditLesson: (lesson: CourseLesson) => void;
  onAddLessonAt: (day: DayOfWeek, timeSlotId: string) => void;
}

export const TodayTimeline: React.FC<TodayTimelineProps> = ({
  lessons,
  classes,
  timeSlots,
  onEditLesson,
  onAddLessonAt,
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [activeDay, setActiveDay] = useState<DayOfWeek>(() => {
    const d = new Date().getDay();
    return (d === 0 ? 7 : d) as DayOfWeek;
  });

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentDayOfWeek = (currentTime.getDay() === 0 ? 7 : currentTime.getDay()) as DayOfWeek;
  const isViewingToday = activeDay === currentDayOfWeek;

  // Filter lessons for active day and sort by slot time
  const dayLessons = lessons
    .filter((l) => l.dayOfWeek === activeDay)
    .sort((a, b) => {
      const slotA = timeSlots.find((s) => s.id === a.timeSlotId);
      const slotB = timeSlots.find((s) => s.id === b.timeSlotId);
      return (slotA?.startTime || '').localeCompare(slotB?.startTime || '');
    });

  const getClassById = (id: string) => classes.find((c) => c.id === id);

  // Time calculations for live status
  const currentHours = currentTime.getHours();
  const currentMinutes = currentTime.getMinutes();
  const currentMinutesFromMidnight = currentHours * 60 + currentMinutes;

  // Find currently active or next lesson
  let currentLesson: { lesson: CourseLesson; slot: TimeSlot } | null = null;
  let nextLesson: { lesson: CourseLesson; slot: TimeSlot; minutesUntil: number } | null = null;

  if (isViewingToday) {
    for (const lesson of dayLessons) {
      const slot = timeSlots.find((s) => s.id === lesson.timeSlotId);
      if (!slot) continue;

      const [startH, startM] = slot.startTime.split(':').map(Number);
      const [endH, endM] = slot.endTime.split(':').map(Number);
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;

      if (currentMinutesFromMidnight >= startMinutes && currentMinutesFromMidnight <= endMinutes) {
        currentLesson = { lesson, slot };
        break;
      } else if (currentMinutesFromMidnight < startMinutes) {
        if (!nextLesson || startMinutes - currentMinutesFromMidnight < nextLesson.minutesUntil) {
          nextLesson = {
            lesson,
            slot,
            minutesUntil: startMinutes - currentMinutesFromMidnight,
          };
        }
      }
    }
  }

  const formatTimeString = (d: Date) => {
    return d.toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Day Selector Pill Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between gap-1 overflow-x-auto">
        {DAYS_CONFIG.map((d) => {
          const isSelected = activeDay === d.day;
          const isRealToday = currentDayOfWeek === d.day;
          const count = lessons.filter((l) => l.dayOfWeek === d.day).length;

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
                    className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-amber-300' : 'bg-indigo-600'}`}
                  />
                )}
              </div>
              <span className={`text-[11px] font-mono mt-0.5 ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                {count}节课
              </span>
            </button>
          );
        })}
      </div>

      {/* Live Status Hero Header (If viewing today) */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="absolute left-1/2 -top-12 w-64 h-64 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-indigo-200 text-xs sm:text-sm font-medium mb-1">
              <CalendarIcon className="w-4 h-4" />
              <span>{formatDateString(currentTime)}</span>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono text-white flex items-baseline gap-3">
              <span>{formatTimeString(currentTime)}</span>
              {isViewingToday && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-sans font-medium animate-pulse">
                  ● 课表实时同步
                </span>
              )}
            </div>
          </div>

          {/* Real-time Class Callout */}
          {isViewingToday && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 min-w-[280px]">
              {currentLesson ? (
                <div>
                  <div className="flex items-center justify-between text-xs text-amber-300 font-semibold mb-1">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                      正在上课中 ({currentLesson.slot.startTime} - {currentLesson.slot.endTime})
                    </span>
                  </div>
                  <div className="text-base font-bold text-white">
                    {currentLesson.lesson.subject}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-indigo-100 mt-1">
                    <span className="font-semibold">{getClassById(currentLesson.lesson.classId)?.name}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-amber-300" />
                      {currentLesson.lesson.classroom}
                    </span>
                  </div>
                </div>
              ) : nextLesson ? (
                <div>
                  <div className="flex items-center justify-between text-xs text-sky-300 font-semibold mb-1">
                    <span className="flex items-center gap-1">
                      <BellRing className="w-3.5 h-3.5" />
                      下一节课预告
                    </span>
                    <span className="px-2 py-0.5 bg-sky-400/20 text-sky-200 rounded-full font-mono">
                      约 {nextLesson.minutesUntil} 分钟后
                    </span>
                  </div>
                  <div className="text-base font-bold text-white">
                    {nextLesson.lesson.subject}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-indigo-100 mt-1">
                    <span className="font-semibold">{getClassById(nextLesson.lesson.classId)?.name}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-sky-300" />
                      {nextLesson.lesson.classroom}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-indigo-200 text-sm py-1">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>今日课程均已结束或暂无待上课程，辛苦啦！</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Timeline of Lessons for Selected Day */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>{DAYS_CONFIG.find((d) => d.day === activeDay)?.full} 课程安排</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
              共 {dayLessons.length} 节
            </span>
          </h2>
          <button
            onClick={() => onAddLessonAt(activeDay, timeSlots[1]?.id || 'slot-1')}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
          >
            <span>+ 为今天加课</span>
          </button>
        </div>

        {dayLessons.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">今天没有排课</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              好好休息或处理备课工作。点击上方按钮可为这一天添加课程。
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {dayLessons.map((lesson, idx) => {
              const cls = getClassById(lesson.classId);
              const slot = timeSlots.find((s) => s.id === lesson.timeSlotId);

              // Calculate status
              let statusText = '待上课';
              let statusBadgeClass = 'bg-slate-100 text-slate-600';
              if (isViewingToday && slot) {
                const [startH, startM] = slot.startTime.split(':').map(Number);
                const [endH, endM] = slot.endTime.split(':').map(Number);
                const startMins = startH * 60 + startM;
                const endMins = endH * 60 + endM;

                if (currentMinutesFromMidnight > endMins) {
                  statusText = '已结束';
                  statusBadgeClass = 'bg-slate-100 text-slate-400';
                } else if (currentMinutesFromMidnight >= startMins && currentMinutesFromMidnight <= endMins) {
                  statusText = '正在上课';
                  statusBadgeClass = 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold';
                } else if (startMins - currentMinutesFromMidnight <= 30) {
                  statusText = '即将开始';
                  statusBadgeClass = 'bg-amber-100 text-amber-800 border border-amber-300 font-bold';
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
                    <div className="w-24 shrink-0">
                      <div className="text-xs font-bold text-slate-900">
                        {slot?.name || '第' + (idx + 1) + '节'}
                      </div>
                      <div className="text-xs font-mono text-slate-500 mt-0.5">
                        {slot ? `${slot.startTime} - ${slot.endTime}` : ''}
                      </div>
                      <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] rounded-md ${statusBadgeClass}`}>
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
                        {lesson.weekType !== 'all' && (
                          <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                            {lesson.weekType === 'single' ? '单周' : '双周'}
                          </span>
                        )}
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
                      <span>编辑 / 备课详情</span>
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
