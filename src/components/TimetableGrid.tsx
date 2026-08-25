import React, { useState } from 'react';
import { ClassInfo, CourseLesson, DayOfWeek, TimeSlot, TimetableConfig } from '../types';
import { DAYS_CONFIG } from '../utils/colorPalette';
import { MapPin, Plus, Edit2, Trash2, AlertTriangle, BookOpen, Clock, StickyNote, Sparkles } from 'lucide-react';

interface TimetableGridProps {
  lessons: CourseLesson[];
  classes: ClassInfo[];
  timeSlots: TimeSlot[];
  config: TimetableConfig;
  selectedClassId: string | null;
  onAddLessonAt: (day: DayOfWeek, timeSlotId: string) => void;
  onEditLesson: (lesson: CourseLesson) => void;
  onDeleteLesson: (lessonId: string) => void;
}

export const TimetableGrid: React.FC<TimetableGridProps> = ({
  lessons,
  classes,
  timeSlots,
  config,
  selectedClassId,
  onAddLessonAt,
  onEditLesson,
  onDeleteLesson,
}) => {
  const [hoveredLessonId, setHoveredLessonId] = useState<string | null>(null);

  // Determine current day of week (1=Monday, 7=Sunday)
  const today = new Date();
  const currentDayOfWeek = (today.getDay() === 0 ? 7 : today.getDay()) as DayOfWeek;

  // Filter visible days
  const visibleDays = config.showWeekends
    ? DAYS_CONFIG
    : DAYS_CONFIG.filter((d) => d.day <= 5);

  // Group lessons by `dayOfWeek-timeSlotId` to detect conflicts easily
  const lessonsMap = new Map<string, CourseLesson[]>();
  lessons.forEach((l) => {
    const key = `${l.dayOfWeek}-${l.timeSlotId}`;
    const list = lessonsMap.get(key) || [];
    list.push(l);
    lessonsMap.set(key, list);
  });

  const getClassById = (id: string): ClassInfo | undefined => {
    return classes.find((c) => c.id === id);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Timetable Grid Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[760px] text-left">
          {/* Header Days */}
          <thead>
            <tr className="bg-slate-50/90 border-b border-slate-200">
              <th className="w-24 sm:w-28 p-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider border-r border-slate-200/80 bg-slate-100/50">
                <div className="flex flex-col items-center justify-center gap-0.5">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>节次 / 时间</span>
                </div>
              </th>
              {visibleDays.map((d) => {
                const isToday = d.day === currentDayOfWeek;
                return (
                  <th
                    key={d.day}
                    className={`p-3 text-center border-r border-slate-200/80 last:border-r-0 transition-colors ${
                      isToday ? 'bg-indigo-50/70' : ''
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span className={`text-sm font-bold ${isToday ? 'text-indigo-700' : 'text-slate-800'}`}>
                        {d.name}
                      </span>
                      {isToday && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-indigo-600 text-white rounded-md tracking-wider">
                          今日
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Time Slot Rows */}
          <tbody className="divide-y divide-slate-200/80">
            {timeSlots.map((slot) => {
              // Special Break Rows (e.g. Lunch or Morning Exercise)
              if (slot.isBreak) {
                return (
                  <tr key={slot.id} className="bg-slate-50/60 text-slate-500">
                    <td className="p-2 text-center text-xs font-semibold border-r border-slate-200/80 bg-slate-100/30">
                      <div className="font-medium text-slate-600">{slot.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {slot.startTime}-{slot.endTime}
                      </div>
                    </td>
                    <td
                      colSpan={visibleDays.length}
                      className="p-2 text-center text-xs font-medium text-slate-400 tracking-wide bg-gradient-to-r from-slate-50 via-slate-100/40 to-slate-50 border-r border-slate-200/80 last:border-r-0"
                    >
                      <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-slate-200/60 text-slate-600 text-[11px]">
                        ☕ {slot.name} ({slot.startTime} ~ {slot.endTime})
                      </span>
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={slot.id} className="hover:bg-slate-50/30 transition-colors">
                  {/* Period Time Column */}
                  <td className="p-2.5 sm:p-3 text-center border-r border-slate-200/80 bg-slate-50/40 align-middle">
                    <div className="text-xs sm:text-sm font-bold text-slate-800 tracking-tight">
                      {slot.name}
                    </div>
                    <div className="text-[11px] font-medium text-slate-500 font-mono mt-0.5">
                      {slot.startTime} - {slot.endTime}
                    </div>
                    <span
                      className={`inline-block mt-1 px-1.5 py-0.2 rounded text-[10px] font-medium ${
                        slot.section === 'morning'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                          : slot.section === 'afternoon'
                          ? 'bg-sky-50 text-sky-700 border border-sky-200/60'
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-200/60'
                      }`}
                    >
                      {slot.section === 'morning' ? '上午' : slot.section === 'afternoon' ? '下午' : '晚间'}
                    </span>
                  </td>

                  {/* Day Cells */}
                  {visibleDays.map((d) => {
                    const key = `${d.day}-${slot.id}`;
                    const slotLessons = lessonsMap.get(key) || [];
                    const hasConflict = slotLessons.length > 1;
                    const isToday = d.day === currentDayOfWeek;

                    return (
                      <td
                        key={d.day}
                        className={`p-1.5 sm:p-2 border-r border-slate-200/80 last:border-r-0 align-top relative group min-h-[96px] ${
                          isToday ? 'bg-indigo-50/20' : ''
                        }`}
                      >
                        {slotLessons.length === 0 ? (
                          // Empty Slot - Quick Add on Hover
                          <div
                            onClick={() => onAddLessonAt(d.day, slot.id)}
                            className="w-full h-full min-h-[82px] rounded-xl border border-dashed border-transparent group-hover:border-slate-300 group-hover:bg-slate-50/80 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all p-2 text-slate-300 group-hover:text-indigo-600"
                            title={`点击为 ${d.name} ${slot.name} 添加课程`}
                          >
                            <div className="w-6 h-6 rounded-full bg-transparent group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
                              <Plus className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <span className="text-[11px] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                              添加课程
                            </span>
                          </div>
                        ) : (
                          // Lesson Cards
                          <div className="space-y-1.5">
                            {hasConflict && (
                              <div className="flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-md text-[10px] font-bold">
                                <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                                <span>时间冲突 ({slotLessons.length}门课)</span>
                              </div>
                            )}

                            {slotLessons.map((lesson) => {
                              const cls = getClassById(lesson.classId);
                              const isDimmed =
                                selectedClassId !== null && selectedClassId !== lesson.classId;
                              const isHovered = hoveredLessonId === lesson.id;

                              return (
                                <div
                                  key={lesson.id}
                                  onMouseEnter={() => setHoveredLessonId(lesson.id)}
                                  onMouseLeave={() => setHoveredLessonId(null)}
                                  style={{
                                    backgroundColor: cls?.bgLightColor || '#f8fafc',
                                    borderColor: cls?.borderColor || '#e2e8f0',
                                  }}
                                  className={`rounded-xl border p-2.5 transition-all relative shadow-2xs group/card ${
                                    isDimmed ? 'opacity-30 grayscale-40' : 'opacity-100'
                                  } ${isHovered ? 'shadow-md ring-2 ring-offset-1 ring-slate-300 scale-[1.02] z-10' : ''}`}
                                >
                                  {/* Class Name Badge & Week Type */}
                                  <div className="flex items-center justify-between gap-1 mb-1">
                                    <span
                                      style={{
                                        backgroundColor: cls?.color || '#4f46e5',
                                        color: '#ffffff',
                                      }}
                                      className="px-2 py-0.5 rounded-full text-[10px] font-bold truncate max-w-[120px] shadow-2xs"
                                    >
                                      {cls?.name || '未知班级'}
                                    </span>

                                    {lesson.weekType !== 'all' && (
                                      <span className="text-[9px] font-semibold px-1.5 py-0.2 bg-white/80 text-slate-700 border border-slate-200 rounded-md">
                                        {lesson.weekType === 'single' ? '单周' : '双周'}
                                      </span>
                                    )}
                                  </div>

                                  {/* Subject Title */}
                                  <div className="font-bold text-xs sm:text-sm text-slate-900 leading-tight my-1 truncate">
                                    {lesson.subject}
                                  </div>

                                  {/* Classroom Location */}
                                  <div className="flex items-center gap-1 text-[11px] font-medium text-slate-600 mt-1 truncate">
                                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                    <span className="truncate">{lesson.classroom || '未定教室'}</span>
                                  </div>

                                  {/* Notes preview if available */}
                                  {lesson.notes && (
                                    <div
                                      title={lesson.notes}
                                      className="mt-1.5 pt-1 border-t border-slate-200/60 flex items-start gap-1 text-[10px] text-slate-600 line-clamp-1 italic"
                                    >
                                      <StickyNote className="w-2.5 h-2.5 text-amber-500 shrink-0 mt-0.5" />
                                      <span className="truncate">{lesson.notes}</span>
                                    </div>
                                  )}

                                  {/* Quick Action Buttons (Edit / Delete) on Hover */}
                                  <div className="absolute top-1.5 right-1.5 opacity-0 group-hover/card:opacity-100 flex items-center gap-1 bg-white/95 rounded-lg shadow-sm border border-slate-200 p-0.5 transition-opacity">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onEditLesson(lesson);
                                      }}
                                      className="p-1 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                                      title="编辑课程"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm(`确定要删除 ${cls?.name || ''} 的「${lesson.subject}」吗？`)) {
                                          onDeleteLesson(lesson.id);
                                        }
                                      }}
                                      className="p-1 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                      title="删除课程"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}

                            {/* Option to add another course to the same slot (for single/double alternate week) */}
                            <button
                              onClick={() => onAddLessonAt(d.day, slot.id)}
                              className="w-full py-1 text-[10px] font-medium text-slate-400 hover:text-indigo-600 hover:bg-slate-100/80 rounded-md border border-dashed border-slate-200 flex items-center justify-center gap-1 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                              <span>添加合班/单双周</span>
                            </button>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Grid Footer Info */}
      <div className="p-3 bg-slate-50/90 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>提示：点击空白单元格可快速为对应时间段排课；支持各班独立色彩区分。</span>
        </div>
        <div className="flex items-center gap-3">
          <span>共 {lessons.length} 节课</span>
          <span>•</span>
          <span>{classes.length} 个授课班级</span>
        </div>
      </div>
    </div>
  );
};
