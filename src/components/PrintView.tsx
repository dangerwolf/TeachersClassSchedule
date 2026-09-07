import React, { useState } from 'react';
import {
  ClassInfo,
  CourseLesson,
  DayOfWeek,
  TeacherProfile,
  TimeSlot,
  TimetableConfig,
} from '../types';
import { DAYS_CONFIG } from '../utils/colorPalette';
import {
  formatLessonSlotSpan,
  formatWeekRange,
  getSlotsOccupiedByLesson,
  isLessonActiveInWeek,
} from '../utils/lessonHelper';
import {
  Printer,
  X,
  Layout,
  FileText,
  CheckSquare,
  Sparkles,
  School,
  GraduationCap,
  Layers,
} from 'lucide-react';

interface PrintViewProps {
  isOpen: boolean;
  onClose: () => void;
  lessons: CourseLesson[];
  classes: ClassInfo[];
  timeSlots: TimeSlot[];
  profile: TeacherProfile;
  config: TimetableConfig;
}

export const PrintView: React.FC<PrintViewProps> = ({
  isOpen,
  onClose,
  lessons,
  classes,
  timeSlots,
  profile,
  config,
}) => {
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [showNotes, setShowNotes] = useState(true);
  const [showColorDots, setShowColorDots] = useState(true);
  const [showTeacherSignature, setShowTeacherSignature] = useState(true);
  const [printWeek, setPrintWeek] = useState<number | 'all'>(
    config.selectedWeek ?? 'all'
  );
  const [customPrintTitle, setCustomPrintTitle] = useState(
    `${profile.school} 大学教学课表`
  );

  if (!isOpen) return null;

  const totalWeeks = config.totalWeeks || 20;

  const visibleDays = config.showWeekends
    ? DAYS_CONFIG
    : DAYS_CONFIG.filter((d) => d.day <= 5);

  const getClassById = (id: string) => classes.find((c) => c.id === id);

  // 过滤打印的课程
  const activePrintLessons = lessons.filter((l) =>
    isLessonActiveInWeek(l, printWeek, totalWeeks)
  );

  // 计算周教学总课时 (连堂累计)
  const totalHours = activePrintLessons.reduce(
    (sum, l) => sum + (l.durationSlots || 1),
    0
  );

  const handleTriggerPrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden border border-slate-200 my-4 flex flex-col max-h-[96vh] print:max-h-none print:border-none print:shadow-none print:rounded-none">
        {/* Modal Controls Header (Hidden when printing) */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">课表在线打印与排版预览</h3>
              <p className="text-xs text-slate-500">
                专为标准 A4 纸张打印优化，支持多节连堂、开课周段与教研室签名栏
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTriggerPrint}
              className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>立即调用打印机 (A4)</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Print Settings Toolbar (Hidden when printing) */}
        <div className="px-6 py-3 bg-indigo-50/50 border-b border-indigo-100 flex items-center justify-between flex-wrap gap-4 text-xs print:hidden shrink-0">
          {/* Print Target Week */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">打印周次:</span>
            <select
              value={printWeek}
              onChange={(e) =>
                setPrintWeek(
                  e.target.value === 'all' ? 'all' : Number(e.target.value)
                )
              }
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-medium"
            >
              <option value="all">全学期全景课表 (显示所有周段)</option>
              {Array.from({ length: totalWeeks }, (_, i) => i + 1).map((w) => (
                <option key={w} value={w}>
                  第 {w} 教学周课表
                </option>
              ))}
            </select>
          </div>

          {/* Orientation */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">纸张方向:</span>
            <div className="flex items-center bg-white rounded-lg border border-slate-200 p-0.5">
              <button
                onClick={() => setOrientation('landscape')}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  orientation === 'landscape'
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-600'
                }`}
              >
                A4 横向 (高校推荐)
              </button>
              <button
                onClick={() => setOrientation('portrait')}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  orientation === 'portrait'
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-600'
                }`}
              >
                A4 纵向
              </button>
            </div>
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showNotes}
                onChange={(e) => setShowNotes(e.target.checked)}
                className="rounded text-indigo-600"
              />
              <span className="text-slate-700 font-medium">打印备课/实验备注</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showColorDots}
                onChange={(e) => setShowColorDots(e.target.checked)}
                className="rounded text-indigo-600"
              />
              <span className="text-slate-700 font-medium">打印班级色彩标记</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showTeacherSignature}
                onChange={(e) => setShowTeacherSignature(e.target.checked)}
                className="rounded text-indigo-600"
              />
              <span className="text-slate-700 font-medium">教研室审核签名栏</span>
            </label>
          </div>
        </div>

        {/* Printable Canvas Area */}
        <div className="p-6 sm:p-10 overflow-y-auto flex-1 bg-slate-100/70 print:p-0 print:bg-white flex justify-center">
          <div
            className={`bg-white p-6 sm:p-8 shadow-lg print:shadow-none border border-slate-200 print:border-none w-full ${
              orientation === 'landscape' ? 'max-w-[1020px]' : 'max-w-[800px]'
            }`}
          >
            {/* School Header */}
            <div className="text-center border-b-2 border-slate-900 pb-4 mb-4">
              <div className="flex items-center justify-center gap-2 text-slate-900 font-extrabold text-xl sm:text-2xl tracking-tight">
                <School className="w-6 h-6 print:hidden" />
                <span>{customPrintTitle}</span>
              </div>

              <div className="flex items-center justify-center gap-4 sm:gap-6 text-xs text-slate-700 font-semibold mt-2 flex-wrap">
                <span>任课教师：<strong>{profile.name}</strong> ({profile.title})</span>
                <span>•</span>
                <span>学期：{profile.semester}</span>
                <span>•</span>
                <span>
                  课表范围：
                  {printWeek === 'all' ? '全学期全景' : `第 ${printWeek} 教学周`}
                </span>
                <span>•</span>
                <span>
                  周授课学时：<strong>{totalHours} 学时</strong>
                </span>
                <span>•</span>
                <span>打印日期：{new Date().toLocaleDateString('zh-CN')}</span>
              </div>
            </div>

            {/* Print Grid Table */}
            <table className="w-full border-collapse border border-slate-900 text-left text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-900 border-b border-slate-900">
                  <th className="border border-slate-900 p-2 text-center w-24 font-bold">
                    节次 / 时间
                  </th>
                  {visibleDays.map((d) => (
                    <th key={d.day} className="border border-slate-900 p-2 text-center font-bold">
                      {d.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((slot) => {
                  if (slot.isBreak) {
                    return (
                      <tr key={slot.id} className="bg-slate-50 text-slate-600">
                        <td className="border border-slate-900 p-1 text-center font-semibold text-[10px]">
                          {slot.name}
                        </td>
                        <td
                          colSpan={visibleDays.length}
                          className="border border-slate-900 p-1 text-center text-[10px] italic"
                        >
                          {slot.name} ({slot.startTime} ~ {slot.endTime})
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={slot.id}>
                      {/* Period Header */}
                      <td className="border border-slate-900 p-1.5 text-center bg-slate-50/80 align-middle">
                        <div className="font-bold text-slate-900 text-xs">{slot.name}</div>
                        <div className="text-[10px] font-mono text-slate-600">
                          {slot.startTime}-{slot.endTime}
                        </div>
                      </td>

                      {/* Day Cells */}
                      {visibleDays.map((d) => {
                        const cellLessons = activePrintLessons.filter(
                          (l) => l.dayOfWeek === d.day && l.timeSlotId === slot.id
                        );

                        // 查找是否有其他连堂课跨越并占用本节次
                        const coveringLessons = activePrintLessons.filter((l) => {
                          if (l.dayOfWeek !== d.day || l.timeSlotId === slot.id) return false;
                          const occupied = getSlotsOccupiedByLesson(l, timeSlots);
                          return occupied.some((s) => s.id === slot.id);
                        });

                        return (
                          <td
                            key={d.day}
                            className="border border-slate-900 p-1.5 align-top min-h-[50px] w-[14%]"
                          >
                            {cellLessons.length === 0 && coveringLessons.length > 0 && (
                              <div className="text-[10px] text-slate-400 italic">
                                {coveringLessons.map((p) => (
                                  <div key={p.id}>
                                    [承接 {formatLessonSlotSpan(p, timeSlots).slotName} 连堂: {p.subject}]
                                  </div>
                                ))}
                              </div>
                            )}

                            {cellLessons.map((lesson) => {
                              const cls = getClassById(lesson.classId);
                              const span = formatLessonSlotSpan(lesson, timeSlots);
                              const weekDesc = formatWeekRange(lesson);
                              const isMultiSlot = (lesson.durationSlots || 1) > 1;

                              return (
                                <div key={lesson.id} className="space-y-0.5">
                                  <div className="flex items-center gap-1">
                                    {showColorDots && (
                                      <span
                                        className="w-2 h-2 rounded-full shrink-0"
                                        style={{ backgroundColor: cls?.color || '#000000' }}
                                      />
                                    )}
                                    <span className="font-bold text-slate-900 text-[11px] truncate">
                                      {cls?.name || ''}
                                    </span>
                                    {isMultiSlot && (
                                      <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1 rounded">
                                        {span.slotName}
                                      </span>
                                    )}
                                  </div>

                                  <div className="font-bold text-slate-800 text-[11px] leading-tight">
                                    {lesson.subject}
                                  </div>

                                  <div className="text-[10px] text-indigo-900 font-semibold">
                                    📅 {weekDesc}
                                  </div>

                                  <div className="text-[10px] text-slate-600 font-medium">
                                    📍 {lesson.classroom}
                                  </div>

                                  {showNotes && lesson.notes && (
                                    <div className="text-[9px] text-slate-500 italic border-t border-slate-200 mt-0.5 pt-0.5">
                                      {lesson.notes}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Class Color Legend in Print */}
            <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-600 flex-wrap gap-2">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-bold text-slate-800">授课班级图例：</span>
                {classes.map((cls) => (
                  <span key={cls.id} className="inline-flex items-center gap-1">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{ backgroundColor: cls.color }}
                    />
                    <span>{cls.name}</span>
                  </span>
                ))}
              </div>
              <div className="font-mono text-slate-400">
                高校排课管理系统 · A4标准输出
              </div>
            </div>

            {/* Teacher Signature & Department Approval */}
            {showTeacherSignature && (
              <div className="mt-8 pt-4 border-t border-dashed border-slate-300 grid grid-cols-3 gap-6 text-xs text-slate-700">
                <div>
                  任课教师确认签名：__________________
                </div>
                <div>
                  教研室主任审核：__________________
                </div>
                <div className="text-right">
                  学院教学办盖章：__________________
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
