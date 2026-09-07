import React, { useState } from 'react';
import { ClassInfo, CourseLesson, DayOfWeek, TimeSlot, TimetableConfig } from '../types';
import { DAYS_CONFIG } from '../utils/colorPalette';
import {
  formatLessonSlotSpan,
  formatWeekRange,
  getSlotsOccupiedByLesson,
  isLessonActiveInWeek,
  checkLessonsConflict,
} from '../utils/lessonHelper';
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  Clock,
  StickyNote,
  Layers,
  ChevronLeft,
  ChevronRight,
  Filter,
  Check,
} from 'lucide-react';

interface TimetableGridProps {
  lessons: CourseLesson[];
  classes: ClassInfo[];
  timeSlots: TimeSlot[];
  config: TimetableConfig;
  onConfigChange?: (config: TimetableConfig) => void;
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
  onConfigChange,
  selectedClassId,
  onAddLessonAt,
  onEditLesson,
  onDeleteLesson,
}) => {
  const [hoveredLessonId, setHoveredLessonId] = useState<string | null>(null);

  // 当前真实系统星期 (1=周一 ~ 7=周日)
  const today = new Date();
  const currentDayOfWeek = (today.getDay() === 0 ? 7 : today.getDay()) as DayOfWeek;

  // 过滤可见星期 (5天 vs 7天)
  const visibleDays = config.showWeekends
    ? DAYS_CONFIG
    : DAYS_CONFIG.filter((d) => d.day <= 5);

  const totalWeeks = config.totalWeeks || 20;
  const selectedWeek = config.selectedWeek ?? 'all';

  // 根据当前选择的周次过滤有效课程
  const activeLessons = lessons.filter((lesson) =>
    isLessonActiveInWeek(lesson, selectedWeek, totalWeeks)
  );

  const getClassById = (id: string): ClassInfo | undefined => {
    return classes.find((c) => c.id === id);
  };

  // 查找在特定星期、特定节次起始或占用的课程
  const getLessonsStartingAt = (day: DayOfWeek, slotId: string) => {
    return activeLessons.filter(
      (l) => l.dayOfWeek === day && l.timeSlotId === slotId
    );
  };

  // 查找是否有前面的连堂课跨越并占用了这个格子 (作为延续节次)
  const getCoveringParentLessons = (day: DayOfWeek, currentSlot: TimeSlot) => {
    return activeLessons.filter((l) => {
      if (l.dayOfWeek !== day || l.timeSlotId === currentSlot.id) return false;
      const occupied = getSlotsOccupiedByLesson(l, timeSlots);
      return occupied.some((s) => s.id === currentSlot.id);
    });
  };

  // 切换教学周次
  const handleSelectWeek = (week: number | 'all') => {
    if (onConfigChange) {
      onConfigChange({
        ...config,
        selectedWeek: week,
      });
    }
  };

  return (
    <div className="space-y-3">
      {/* 大学周次快速切换控制条 (University Semester Week Bar) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3 shadow-2xs print:hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          {/* Left: Current Active Week Status */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">
                  {selectedWeek === 'all'
                    ? '全学期课表总览 (全部周)'
                    : `第 ${selectedWeek} 教学周课表`}
                </span>
                {selectedWeek !== 'all' && selectedWeek === config.currentWeekNumber && (
                  <span className="px-2 py-0.2 bg-indigo-600 text-white text-[10px] font-bold rounded-full">
                    当前教学周
                  </span>
                )}
                {selectedWeek !== 'all' && (
                  <span className="text-[11px] text-slate-500">
                    ({selectedWeek % 2 === 1 ? '单周' : '双周'})
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                支持 1~10 周、12~20 周等分段开课与 1~2节、5~8节连堂跨行显示
              </p>
            </div>
          </div>

          {/* Right: Quick Week Pills (All / Week 1..20) */}
          <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
            <button
              onClick={() => handleSelectWeek('all')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                selectedWeek === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
              }`}
            >
              全部周 (全景)
            </button>

            {/* Jump to current week */}
            <button
              onClick={() => handleSelectWeek(config.currentWeekNumber)}
              title="快速查看本教学周课表"
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
                selectedWeek === config.currentWeekNumber
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'border-indigo-200 text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100'
              }`}
            >
              本周 (第{config.currentWeekNumber}周)
            </button>

            {/* Week Selector Dropdown / Scrollable Pills */}
            <div className="flex items-center gap-1 overflow-x-auto max-w-full sm:max-w-md py-0.5">
              {Array.from({ length: totalWeeks }, (_, i) => i + 1).map((w) => {
                const isSelected = selectedWeek === w;
                const isCurrent = w === config.currentWeekNumber;
                return (
                  <button
                    key={w}
                    onClick={() => handleSelectWeek(w)}
                    title={`查看第 ${w} 周 (${w % 2 === 1 ? '单周' : '双周'})${isCurrent ? ' - 当前周' : ''}`}
                    className={`min-w-[28px] h-7 px-1.5 flex items-center justify-center text-[11px] rounded-md font-medium transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white font-bold shadow-xs'
                        : isCurrent
                        ? 'bg-indigo-100/80 text-indigo-700 font-bold border border-indigo-300'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-200/60'
                    }`}
                  >
                    {w}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Timetable Matrix Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[800px] text-left">
            {/* Header: Days of the Week */}
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

            {/* Timetable Rows */}
            <tbody className="divide-y divide-slate-200/80">
              {timeSlots.map((slot) => {
                // Break Rows (Lunch, Morning Exercise, Dinner, etc.)
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
                    {/* Time Slot Label Column */}
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
                      const startingLessons = getLessonsStartingAt(d.day, slot.id);
                      const coveringLessons = getCoveringParentLessons(d.day, slot);
                      const isToday = d.day === currentDayOfWeek;

                      // 冲突检测: 仅当起始课程之间存在真实的“周次有交集”时报警
                      const hasRealConflict =
                        startingLessons.length > 1 &&
                        startingLessons.some((lA, idx) =>
                          startingLessons.slice(idx + 1).some((lB) =>
                            checkLessonsConflict(lA, lB, timeSlots, totalWeeks)
                          )
                        );

                      // 是否是前后半学期交替 (例如 1-8周 与 9-16周 在同一时间段无缝接力)
                      const isStaggeredShift =
                        startingLessons.length > 1 && !hasRealConflict;

                      return (
                        <td
                          key={d.day}
                          className={`p-1.5 sm:p-2 border-r border-slate-200/80 last:border-r-0 align-top relative group min-h-[96px] ${
                            isToday ? 'bg-indigo-50/20' : ''
                          }`}
                        >
                          {startingLessons.length === 0 && coveringLessons.length === 0 ? (
                            // 空白节次 - 鼠标悬停快捷加课
                            <div
                              onClick={() => onAddLessonAt(d.day, slot.id)}
                              className="w-full h-full min-h-[82px] rounded-xl border border-dashed border-transparent group-hover:border-slate-300 group-hover:bg-slate-50/80 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all p-2 text-slate-300 group-hover:text-indigo-600"
                              title={`点击为 ${d.name} ${slot.name} 排课 (可设置多节连上)`}
                            >
                              <div className="w-6 h-6 rounded-full bg-transparent group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
                                <Plus className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                              <span className="text-[11px] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                添加课程
                              </span>
                            </div>
                          ) : (
                            <div className="space-y-1.5">
                              {/* 连堂延续提示 (如果被上节连堂课程覆盖，且当前没有新课程以此节作为首节) */}
                              {startingLessons.length === 0 && coveringLessons.length > 0 && (
                                <div className="space-y-1">
                                  {coveringLessons.map((parent) => {
                                    const cls = getClassById(parent.classId);
                                    const span = formatLessonSlotSpan(parent, timeSlots);
                                    return (
                                      <div
                                        key={parent.id}
                                        onClick={() => onEditLesson(parent)}
                                        style={{
                                          backgroundColor: `${cls?.bgLightColor || '#f8fafc'}90`,
                                          borderColor: cls?.borderColor || '#cbd5e1',
                                        }}
                                        className="border border-dashed rounded-xl p-2 cursor-pointer hover:shadow-xs transition-all flex items-center justify-between text-xs"
                                        title={`承接 ${span.slotName}「${parent.subject}」连堂授课，点击编辑`}
                                      >
                                        <div className="flex items-center gap-1.5 truncate">
                                          <span
                                            style={{ backgroundColor: cls?.color || '#4f46e5' }}
                                            className="w-2 h-2 rounded-full shrink-0"
                                          />
                                          <span className="text-[11px] font-semibold text-slate-700 truncate">
                                            🔗 连堂中: {parent.subject}
                                          </span>
                                        </div>
                                        <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                                          {span.slotName}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              {/* 冲突提示条 */}
                              {hasRealConflict && (
                                <div className="flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-md text-[10px] font-bold">
                                  <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                                  <span>排课时间冲突 (周次重叠)</span>
                                </div>
                              )}

                              {/* 前后半学期错峰交替提示 (非冲突，合理排课) */}
                              {isStaggeredShift && (
                                <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-[10px] font-semibold">
                                  <span>分段交替开课 ({startingLessons.length}门)</span>
                                </div>
                              )}

                              {/* 渲染以此节为首节的所有课程卡片 */}
                              {startingLessons.map((lesson) => {
                                const cls = getClassById(lesson.classId);
                                const isDimmed =
                                  selectedClassId !== null && selectedClassId !== lesson.classId;
                                const isHovered = hoveredLessonId === lesson.id;
                                const span = formatLessonSlotSpan(lesson, timeSlots);
                                const weekRangeStr = formatWeekRange(lesson);
                                const isMultiSlot = (lesson.durationSlots || 1) > 1;

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
                                    } ${
                                      isHovered
                                        ? 'shadow-md ring-2 ring-offset-1 ring-slate-300 scale-[1.01] z-10'
                                        : ''
                                    }`}
                                  >
                                    {/* Top Row: Class Badge & Slot Range */}
                                    <div className="flex items-center justify-between gap-1 mb-1">
                                      <span
                                        style={{
                                          backgroundColor: cls?.color || '#4f46e5',
                                          color: '#ffffff',
                                        }}
                                        className="px-2 py-0.5 rounded-full text-[10px] font-bold truncate max-w-[110px] shadow-2xs"
                                      >
                                        {cls?.name || '未知班级'}
                                      </span>

                                      {/* 连堂节次与起止时间徽章 */}
                                      {isMultiSlot ? (
                                        <span className="text-[9px] font-bold px-1.5 py-0.5 bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-md shrink-0">
                                          {span.slotName}连堂
                                        </span>
                                      ) : (
                                        <span className="text-[9px] font-medium px-1 py-0.2 bg-white/80 text-slate-500 border border-slate-200 rounded-md shrink-0">
                                          单节
                                        </span>
                                      )}
                                    </div>

                                    {/* Subject Title */}
                                    <div className="font-bold text-xs sm:text-sm text-slate-900 leading-tight my-1 truncate">
                                      {lesson.subject}
                                    </div>

                                    {/* Week Range Badge (大学周次: 如 第1-10周 / 第12-20周 / 单双周) */}
                                    <div className="flex items-center gap-1 my-1">
                                      <span className="px-1.5 py-0.5 bg-white/90 text-indigo-700 border border-indigo-200/80 rounded-md text-[10px] font-bold shadow-2xs">
                                        📅 {weekRangeStr}
                                      </span>
                                      {isMultiSlot && (
                                        <span className="text-[10px] text-slate-500 font-mono">
                                          {span.timeRange}
                                        </span>
                                      )}
                                    </div>

                                    {/* Classroom Location */}
                                    <div className="flex items-center gap-1 text-[11px] font-medium text-slate-600 mt-1 truncate">
                                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                      <span className="truncate">{lesson.classroom || '未定教室'}</span>
                                    </div>

                                    {/* Notes Preview */}
                                    {lesson.notes && (
                                      <div
                                        title={lesson.notes}
                                        className="mt-1.5 pt-1 border-t border-slate-200/60 flex items-start gap-1 text-[10px] text-slate-600 line-clamp-1 italic"
                                      >
                                        <StickyNote className="w-2.5 h-2.5 text-amber-500 shrink-0 mt-0.5" />
                                        <span className="truncate">{lesson.notes}</span>
                                      </div>
                                    )}

                                    {/* Hover Action Buttons */}
                                    <div className="absolute top-1.5 right-1.5 opacity-0 group-hover/card:opacity-100 flex items-center gap-1 bg-white/95 rounded-lg shadow-sm border border-slate-200 p-0.5 transition-opacity">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onEditLesson(lesson);
                                        }}
                                        className="p-1 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                                        title="编辑课程与连堂设置"
                                      >
                                        <Edit2 className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (confirm(`确定要删除「${lesson.subject}」(${span.slotName}, ${weekRangeStr})吗？`)) {
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
      </div>
    </div>
  );
};
