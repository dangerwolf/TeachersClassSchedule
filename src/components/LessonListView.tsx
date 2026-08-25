import React, { useState, useMemo } from 'react';
import { ClassInfo, CourseLesson, DayOfWeek, TimeSlot } from '../types';
import { DAYS_CONFIG } from '../utils/colorPalette';
import { Search, Filter, Plus, Edit2, Trash2, MapPin, Calendar, Clock, BookOpen, StickyNote } from 'lucide-react';

interface LessonListViewProps {
  lessons: CourseLesson[];
  classes: ClassInfo[];
  timeSlots: TimeSlot[];
  onAddLesson: () => void;
  onEditLesson: (lesson: CourseLesson) => void;
  onDeleteLesson: (lessonId: string) => void;
}

export const LessonListView: React.FC<LessonListViewProps> = ({
  lessons,
  classes,
  timeSlots,
  onAddLesson,
  onEditLesson,
  onDeleteLesson,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDay, setFilterDay] = useState<number | 'all'>('all');
  const [filterClass, setFilterClass] = useState<string | 'all'>('all');

  const getClassById = (id: string) => classes.find((c) => c.id === id);
  const getSlotById = (id: string) => timeSlots.find((s) => s.id === id);

  const filteredLessons = useMemo(() => {
    return lessons
      .filter((lesson) => {
        const cls = getClassById(lesson.classId);
        const slot = getSlotById(lesson.timeSlotId);

        // Day match
        if (filterDay !== 'all' && lesson.dayOfWeek !== filterDay) return false;
        // Class match
        if (filterClass !== 'all' && lesson.classId !== filterClass) return false;

        // Search match
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchSubject = lesson.subject.toLowerCase().includes(q);
          const matchClass = cls?.name.toLowerCase().includes(q) || false;
          const matchRoom = lesson.classroom.toLowerCase().includes(q);
          const matchNotes = lesson.notes?.toLowerCase().includes(q) || false;
          const matchSlot = slot?.name.toLowerCase().includes(q) || false;

          return matchSubject || matchClass || matchRoom || matchNotes || matchSlot;
        }

        return true;
      })
      .sort((a, b) => {
        if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
        const slotA = getSlotById(a.timeSlotId);
        const slotB = getSlotById(b.timeSlotId);
        return (slotA?.startTime || '').localeCompare(slotB?.startTime || '');
      });
  }, [lessons, classes, timeSlots, searchTerm, filterDay, filterClass]);

  return (
    <div className="space-y-4">
      {/* Search & Filter Control Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索课程名称、教室、班级、备课笔记..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 placeholder:text-slate-400"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {/* Day of Week Filter */}
          <select
            value={filterDay}
            onChange={(e) => setFilterDay(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="all">全部星期 (周一至周日)</option>
            {DAYS_CONFIG.map((d) => (
              <option key={d.day} value={d.day}>
                {d.full}
              </option>
            ))}
          </select>

          {/* Class Filter */}
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="all">全部授课班级</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name} ({cls.grade || ''})
              </option>
            ))}
          </select>

          {/* Add Lesson Action */}
          <button
            onClick={onAddLesson}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shrink-0 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>新建课程</span>
          </button>
        </div>
      </div>

      {/* Results Count & Filter Reset */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          共找到 <strong className="text-slate-800 font-bold">{filteredLessons.length}</strong> 门匹配课程
        </span>
        {(searchTerm || filterDay !== 'all' || filterClass !== 'all') && (
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterDay('all');
              setFilterClass('all');
            }}
            className="text-indigo-600 hover:underline font-medium"
          >
            重置所有筛选条件
          </button>
        )}
      </div>

      {/* Course List Table / Cards */}
      {filteredLessons.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-800">未找到相关课程</h3>
          <p className="text-xs text-slate-500 mt-1">请尝试修改搜索词或筛选条件</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-3.5 w-24">星期</th>
                  <th className="p-3.5 w-32">节次时间</th>
                  <th className="p-3.5">课程名称</th>
                  <th className="p-3.5">授课班级</th>
                  <th className="p-3.5">上课教室</th>
                  <th className="p-3.5">周期</th>
                  <th className="p-3.5 min-w-[200px]">备课/作业提醒</th>
                  <th className="p-3.5 text-right w-24">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70">
                {filteredLessons.map((lesson) => {
                  const cls = getClassById(lesson.classId);
                  const slot = getSlotById(lesson.timeSlotId);
                  const dayObj = DAYS_CONFIG.find((d) => d.day === lesson.dayOfWeek);

                  return (
                    <tr key={lesson.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Day */}
                      <td className="p-3.5 font-bold text-slate-900">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{dayObj?.name}</span>
                        </span>
                      </td>

                      {/* Period Time */}
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-800">{slot?.name || '未知节次'}</div>
                        <div className="text-slate-400 font-mono text-[11px]">
                          {slot ? `${slot.startTime}-${slot.endTime}` : ''}
                        </div>
                      </td>

                      {/* Course Subject */}
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 text-sm">{lesson.subject}</div>
                      </td>

                      {/* Class Badge */}
                      <td className="p-3.5">
                        <span
                          style={{
                            backgroundColor: cls?.bgLightColor || '#eef2ff',
                            color: cls?.textColor || '#4338ca',
                            borderColor: cls?.borderColor || '#c7d2fe',
                          }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold border"
                        >
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: cls?.color || '#4f46e5' }}
                          />
                          <span>{cls?.name || '未关联班级'}</span>
                        </span>
                      </td>

                      {/* Classroom */}
                      <td className="p-3.5 font-medium text-slate-700">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{lesson.classroom}</span>
                        </div>
                      </td>

                      {/* Week Type */}
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                            lesson.weekType === 'all'
                              ? 'bg-slate-100 text-slate-600'
                              : lesson.weekType === 'single'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {lesson.weekType === 'all' ? '每周' : lesson.weekType === 'single' ? '单周' : '双周'}
                        </span>
                      </td>

                      {/* Notes */}
                      <td className="p-3.5 text-slate-600">
                        {lesson.notes ? (
                          <div className="flex items-start gap-1">
                            <StickyNote className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                            <span className="line-clamp-2">{lesson.notes}</span>
                          </div>
                        ) : (
                          <span className="text-slate-300 italic">无备注</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onEditLesson(lesson)}
                            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="编辑"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`确定要删除「${lesson.subject}」吗？`)) {
                                onDeleteLesson(lesson.id);
                              }
                            }}
                            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="删除"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
