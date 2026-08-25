import React, { useState, useEffect } from 'react';
import { ClassInfo, CourseLesson, DayOfWeek, TimeSlot, WeekType } from '../types';
import { DAYS_CONFIG } from '../utils/colorPalette';
import { X, MapPin, AlertTriangle, Calendar, Clock, BookOpen, StickyNote, Check } from 'lucide-react';

interface LessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (lesson: Omit<CourseLesson, 'id'> & { id?: string }) => void;
  classes: ClassInfo[];
  timeSlots: TimeSlot[];
  existingLessons: CourseLesson[];
  initialLesson?: CourseLesson | null;
  initialDay?: DayOfWeek;
  initialSlotId?: string;
}

const COMMON_SUBJECT_CHIPS = [
  '高中物理',
  '高中数学',
  '高中语文',
  '高中英语',
  '高中化学',
  '生物实验',
  '物理专题强化',
  '力学探究',
  '电磁学实验',
  '晚自习答疑',
  '课后辅导',
];

export const LessonModal: React.FC<LessonModalProps> = ({
  isOpen,
  onClose,
  onSave,
  classes,
  timeSlots,
  existingLessons,
  initialLesson,
  initialDay,
  initialSlotId,
}) => {
  const [subject, setSubject] = useState('');
  const [classId, setClassId] = useState('');
  const [classroom, setClassroom] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>(1);
  const [timeSlotId, setTimeSlotId] = useState('');
  const [weekType, setWeekType] = useState<WeekType>('all');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Collect distinct classrooms for auto-fill suggestions
  const existingClassrooms = Array.from(
    new Set(
      [
        ...classes.map((c) => c.classroomDefault).filter(Boolean),
        ...existingLessons.map((l) => l.classroom).filter(Boolean),
      ]
    )
  ) as string[];

  useEffect(() => {
    if (initialLesson) {
      setSubject(initialLesson.subject);
      setClassId(initialLesson.classId);
      setClassroom(initialLesson.classroom);
      setDayOfWeek(initialLesson.dayOfWeek);
      setTimeSlotId(initialLesson.timeSlotId);
      setWeekType(initialLesson.weekType);
      setNotes(initialLesson.notes || '');
    } else {
      setSubject('高中物理');
      setClassId(classes[0]?.id || '');
      setClassroom(classes[0]?.classroomDefault || '笃行楼 101室');
      setDayOfWeek(initialDay || 1);
      setTimeSlotId(initialSlotId || timeSlots[1]?.id || 'slot-1');
      setWeekType('all');
      setNotes('');
    }
    setErrorMsg('');
  }, [initialLesson, initialDay, initialSlotId, isOpen, classes, timeSlots]);

  // When class changes, auto-fill default classroom if empty
  const handleClassSelect = (newClassId: string) => {
    setClassId(newClassId);
    const selectedClass = classes.find((c) => c.id === newClassId);
    if (selectedClass?.classroomDefault && (!classroom || classroom.trim() === '')) {
      setClassroom(selectedClass.classroomDefault);
    }
  };

  if (!isOpen) return null;

  // Conflict Detection
  const conflictingLessons = existingLessons.filter(
    (l) =>
      l.id !== initialLesson?.id &&
      l.dayOfWeek === dayOfWeek &&
      l.timeSlotId === timeSlotId &&
      (l.weekType === 'all' || weekType === 'all' || l.weekType === weekType)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      setErrorMsg('请输入课程名称');
      return;
    }
    if (!classId) {
      setErrorMsg('请选择授课班级');
      return;
    }
    if (!classroom.trim()) {
      setErrorMsg('请输入上课教室/地点');
      return;
    }

    onSave({
      id: initialLesson?.id,
      subject: subject.trim(),
      classId,
      classroom: classroom.trim(),
      dayOfWeek,
      timeSlotId,
      weekType,
      notes: notes.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {initialLesson ? '编辑排课' : '添加新课程'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              填写课程信息、教室、时间与班级颜色标记
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Time Conflict Warning (Non-blocking but helpful alert) */}
          {conflictingLessons.length > 0 && (
            <div className="p-3 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <strong className="font-semibold">注意：该时间段已有其他课程排课</strong>
                <p className="mt-0.5 text-amber-700">
                  {conflictingLessons.map((cl) => {
                    const cInfo = classes.find((c) => c.id === cl.classId);
                    return `「${cInfo?.name || ''} - ${cl.subject}」`;
                  }).join('、')}
                  （如为合班上课或单双周交替，可正常保存）。
                </p>
              </div>
            </div>
          )}

          {/* Subject Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              课程名称 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="例如：高中物理 (必修一)"
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 font-medium"
            />
            {/* Quick Chips */}
            <div className="flex items-center gap-1.5 flex-wrap mt-2">
              <span className="text-[11px] text-slate-400">常用快捷词:</span>
              {COMMON_SUBJECT_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setSubject(chip)}
                  className="px-2 py-0.5 text-[11px] bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 rounded-md transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Class Selector (with Colors) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              授课班级 (自动应用专属颜色) <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {classes.map((cls) => {
                const isSelected = classId === cls.id;
                return (
                  <button
                    key={cls.id}
                    type="button"
                    onClick={() => handleClassSelect(cls.id)}
                    style={{
                      backgroundColor: isSelected ? cls.bgLightColor : '#f8fafc',
                      borderColor: isSelected ? cls.color : '#e2e8f0',
                      borderWidth: isSelected ? '2px' : '1px',
                    }}
                    className={`p-2.5 rounded-xl text-left transition-all relative flex flex-col justify-between ${
                      isSelected ? 'shadow-xs' : 'hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: cls.color }}
                      />
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-indigo-600" />
                      )}
                    </div>
                    <div className="font-bold text-xs text-slate-900 mt-1 truncate">
                      {cls.name}
                    </div>
                    {cls.grade && (
                      <div className="text-[10px] text-slate-500 truncate">
                        {cls.grade}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Classroom Location */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              上课教室 / 教学地点 <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={classroom}
                onChange={(e) => setClassroom(e.target.value)}
                placeholder="例如：笃行楼 101教室 / 电学实验室"
                className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 font-medium"
              />
            </div>
            {/* Quick existing classroom chips */}
            {existingClassrooms.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                <span className="text-[11px] text-slate-400">已有教室:</span>
                {existingClassrooms.slice(0, 4).map((room) => (
                  <button
                    key={room}
                    type="button"
                    onClick={() => setClassroom(room)}
                    className="px-2 py-0.5 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors truncate max-w-[140px]"
                  >
                    {room}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Day of Week & Period Slot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Day */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                星期几 <span className="text-rose-500">*</span>
              </label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(Number(e.target.value) as DayOfWeek)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              >
                {DAYS_CONFIG.map((d) => (
                  <option key={d.day} value={d.day}>
                    {d.full}
                  </option>
                ))}
              </select>
            </div>

            {/* Time Slot */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                上课节次 / 时间 <span className="text-rose-500">*</span>
              </label>
              <select
                value={timeSlotId}
                onChange={(e) => setTimeSlotId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              >
                {timeSlots
                  .filter((s) => !s.isBreak)
                  .map((slot) => (
                    <option key={slot.id} value={slot.id}>
                      {slot.name} ({slot.startTime} ~ {slot.endTime})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Week Type Cycle */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              单双周排课周期
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'all', name: '每周' },
                { id: 'single', name: '单周 (第1,3,5...周)' },
                { id: 'double', name: '双周 (第2,4,6...周)' },
              ].map((wt) => (
                <button
                  key={wt.id}
                  type="button"
                  onClick={() => setWeekType(wt.id as WeekType)}
                  className={`py-1.5 px-2 text-xs font-semibold rounded-xl border transition-all ${
                    weekType === wt.id
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {wt.name}
                </button>
              ))}
            </div>
          </div>

          {/* Notes & Reminders */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              备课重点 / 作业提醒 (选填)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="例如：准备力学实验演示教具、布置第3章课后习题"
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
            >
              {initialLesson ? '保存修改' : '确认添加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
