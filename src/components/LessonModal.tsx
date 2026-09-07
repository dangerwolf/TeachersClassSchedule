import React, { useState, useEffect } from 'react';
import {
  ClassInfo,
  CourseLesson,
  DayOfWeek,
  TimeSlot,
  WeekType,
} from '../types';
import { DAYS_CONFIG } from '../utils/colorPalette';
import {
  formatLessonSlotSpan,
  formatWeekRange,
  getTeachingSlots,
  checkLessonsConflict,
} from '../utils/lessonHelper';
import {
  X,
  AlertTriangle,
  BookOpen,
  MapPin,
  Calendar,
  Clock,
  Layers,
  Sparkles,
  Check,
  CheckCircle2,
  Info,
} from 'lucide-react';

interface LessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (lessonData: Partial<CourseLesson>) => void;
  initialLesson?: CourseLesson | null;
  initialDay?: DayOfWeek;
  initialSlotId?: string;
  classes: ClassInfo[];
  timeSlots: TimeSlot[];
  existingLessons: CourseLesson[];
  totalWeeks?: number;
}

const COMMON_UNIVERSITY_SUBJECTS = [
  '高等数学(A)',
  '大学物理(含实验)',
  '线性代数',
  '离散数学',
  '数据结构与算法',
  '计算机组成原理',
  '操作系统',
  '计算机网络',
  '微机原理与接口技术',
  '电路分析基础',
  '人工智能导论',
  '数字信号处理',
  '数据库系统原理',
  '工程伦理与学术规范',
];

export const LessonModal: React.FC<LessonModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialLesson,
  initialDay = 1,
  initialSlotId,
  classes,
  timeSlots,
  existingLessons,
  totalWeeks = 20,
}) => {
  const teachingSlots = getTeachingSlots(timeSlots);

  // Form states
  const [subject, setSubject] = useState('');
  const [classId, setClassId] = useState('');
  const [classroom, setClassroom] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>(initialDay);
  const [timeSlotId, setTimeSlotId] = useState(
    initialSlotId || (teachingSlots[0]?.id || 'slot-1')
  );
  const [durationSlots, setDurationSlots] = useState<number>(2); // 高校最常见的默认连上2节
  const [startWeek, setStartWeek] = useState<number>(1);
  const [endWeek, setEndWeek] = useState<number>(16);
  const [weekType, setWeekType] = useState<WeekType>('all');
  const [customWeeks, setCustomWeeks] = useState<number[]>([]);
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showCustomWeekSelector, setShowCustomWeekSelector] = useState(false);

  useEffect(() => {
    if (initialLesson) {
      setSubject(initialLesson.subject);
      setClassId(initialLesson.classId);
      setClassroom(initialLesson.classroom);
      setDayOfWeek(initialLesson.dayOfWeek);
      setTimeSlotId(initialLesson.timeSlotId);
      setDurationSlots(initialLesson.durationSlots || 1);
      setStartWeek(initialLesson.startWeek || 1);
      setEndWeek(initialLesson.endWeek || 16);
      setWeekType(initialLesson.weekType || 'all');
      setCustomWeeks(initialLesson.customWeeks || []);
      setShowCustomWeekSelector(initialLesson.weekType === 'custom');
      setNotes(initialLesson.notes || '');
    } else {
      setSubject('');
      setClassId(classes[0]?.id || '');
      setClassroom(classes[0]?.classroomDefault || '');
      setDayOfWeek(initialDay);
      setTimeSlotId(initialSlotId || (teachingSlots[0]?.id || 'slot-1'));
      setDurationSlots(2); // 默认为2节连堂
      setStartWeek(1);
      setEndWeek(16);
      setWeekType('all');
      setCustomWeeks([]);
      setShowCustomWeekSelector(false);
      setNotes('');
    }
    setErrorMsg('');
  }, [initialLesson, initialDay, initialSlotId, isOpen, classes, timeSlots]);

  // 当选择班级时，如果教室为空则自动填充班级默认教室
  const handleClassSelect = (newClassId: string) => {
    setClassId(newClassId);
    const selectedClass = classes.find((c) => c.id === newClassId);
    if (selectedClass?.classroomDefault && (!classroom || classroom.trim() === '')) {
      setClassroom(selectedClass.classroomDefault);
    }
  };

  // 快捷应用高校开课周次模板
  const applyWeekTemplate = (
    start: number,
    end: number,
    type: WeekType,
    label: string
  ) => {
    setStartWeek(start);
    setEndWeek(end);
    setWeekType(type);
    setShowCustomWeekSelector(false);
  };

  // 临时构造当前编辑中的假 lesson 对象，用于冲突检测与时间预览
  const draftLesson: CourseLesson = {
    id: initialLesson?.id || 'draft-new',
    subject: subject.trim() || '当前课程',
    classId,
    classroom: classroom.trim(),
    dayOfWeek,
    timeSlotId,
    durationSlots,
    startWeek,
    endWeek,
    weekType,
    customWeeks,
  };

  const spanPreview = formatLessonSlotSpan(draftLesson, timeSlots);
  const weekDescPreview = formatWeekRange(draftLesson);

  // 真实大学排课冲突检测 (只有当星期相同 + 连堂时段重叠 + 上课周次有交集时才算冲突)
  const realConflictingLessons = existingLessons.filter((other) =>
    checkLessonsConflict(draftLesson, other, timeSlots, totalWeeks)
  );

  // 查找同一时段但周次错峰的课程 (例如 1-8周 与 9-16周)
  const staggeredLessons = existingLessons.filter((other) => {
    if (other.id === initialLesson?.id) return false;
    if (other.dayOfWeek !== dayOfWeek) return false;
    // 节次有交集
    const currentSlots = spanPreview.duration;
    // 检查是否有节次重叠但无真实冲突
    const slotsA = [timeSlotId];
    return other.timeSlotId === timeSlotId && !checkLessonsConflict(draftLesson, other, timeSlots, totalWeeks);
  });

  const toggleCustomWeek = (weekNum: number) => {
    if (customWeeks.includes(weekNum)) {
      setCustomWeeks(customWeeks.filter((w) => w !== weekNum));
    } else {
      setCustomWeeks([...customWeeks, weekNum].sort((a, b) => a - b));
    }
  };

  if (!isOpen) return null;

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
      setErrorMsg('请输入上课教室/实验室地点');
      return;
    }
    if (startWeek > endWeek) {
      setErrorMsg('起始周不能大于结束周');
      return;
    }

    onSave({
      id: initialLesson?.id,
      subject: subject.trim(),
      classId,
      classroom: classroom.trim(),
      dayOfWeek,
      timeSlotId,
      durationSlots,
      startWeek,
      endWeek,
      weekType,
      customWeeks: weekType === 'custom' ? customWeeks : undefined,
      notes: notes.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-xl overflow-hidden border border-slate-200 my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/90">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {initialLesson ? '编辑高校课程设置' : '添加高校教学课程'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              支持 1~2节/5~8节多节连堂、1~10周/12~20周等复杂周次设置
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. 课程名称 */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>课程名称 *</span>
            </label>
            <input
              type="text"
              required
              placeholder="例如：大学物理(A)、数据结构与算法、力学实验"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden transition-all"
            />
            {/* 常用高校课程快速填入 */}
            <div className="flex items-center gap-1.5 flex-wrap mt-2">
              <span className="text-[11px] text-slate-400">快速填入:</span>
              {COMMON_UNIVERSITY_SUBJECTS.slice(0, 5).map((subj) => (
                <button
                  type="button"
                  key={subj}
                  onClick={() => setSubject(subj)}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 rounded-md text-[11px] transition-colors"
                >
                  {subj}
                </button>
              ))}
            </div>
          </div>

          {/* 2. 班级与上课地点 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 班级选择 */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                <span>授课班级 *</span>
              </label>
              <select
                value={classId}
                onChange={(e) => handleClassSelect(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden transition-all"
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} {cls.grade ? `(${cls.grade})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* 教室/实验室 */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>上课地点 / 实验室 *</span>
              </label>
              <input
                type="text"
                required
                placeholder="例如：第一教学楼 A201、物理实验室402"
                value={classroom}
                onChange={(e) => setClassroom(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden transition-all"
              />
            </div>
          </div>

          {/* 3. 节次与连堂设置 (大学核心功能: 1~2节, 5~8节等) */}
          <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/90 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>星期与节次跨度 (连堂设置) *</span>
              </label>
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                {spanPreview.slotName} ({spanPreview.timeRange})
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* 星期 */}
              <div>
                <span className="text-[11px] text-slate-500 block mb-1">上课星期</span>
                <select
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(Number(e.target.value) as DayOfWeek)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  {DAYS_CONFIG.map((d) => (
                    <option key={d.day} value={d.day}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 起始节次 */}
              <div>
                <span className="text-[11px] text-slate-500 block mb-1">起始节次</span>
                <select
                  value={timeSlotId}
                  onChange={(e) => setTimeSlotId(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  {teachingSlots.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.startTime}-{s.endTime})
                    </option>
                  ))}
                </select>
              </div>

              {/* 连上节数 */}
              <div>
                <span className="text-[11px] text-slate-500 block mb-1">连上节数</span>
                <select
                  value={durationSlots}
                  onChange={(e) => setDurationSlots(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-bold text-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  <option value={1}>1 节 (单节课)</option>
                  <option value={2}>2 节连堂 (如 1~2节, 3~4节)</option>
                  <option value={3}>3 节连堂 (如 5~7节)</option>
                  <option value={4}>4 节大课/实验 (如 5~8节)</option>
                </select>
              </div>
            </div>

            {/* 连堂快捷选项胶囊按钮 */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[10px] text-slate-400">高校连堂常用:</span>
              {[
                { label: '2节连堂', duration: 2 },
                { label: '4节实验大课', duration: 4 },
                { label: '3节研讨', duration: 3 },
                { label: '单节', duration: 1 },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.duration}
                  onClick={() => setDurationSlots(opt.duration)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all ${
                    durationSlots === opt.duration
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4. 开课周次设置 (大学核心需求: 1~10周, 12~20周, 单双周) */}
          <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/90 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                <span>开课周次设置 (高校周段与单双周) *</span>
              </label>
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                {weekDescPreview}
              </span>
            </div>

            {/* 高校常见周段快捷模板 */}
            <div>
              <div className="text-[10px] text-slate-500 mb-1.5">高校常用开课模板:</div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { label: '1-16周 (全学期)', s: 1, e: 16, t: 'all' as WeekType },
                  { label: '1-8周 (前半学期)', s: 1, e: 8, t: 'all' as WeekType },
                  { label: '9-16周 (后半学期)', s: 9, e: 16, t: 'all' as WeekType },
                  { label: '1-10周 (前十周)', s: 1, e: 10, t: 'all' as WeekType },
                  { label: '12-20周 (后半段)', s: 12, e: 20, t: 'all' as WeekType },
                  { label: '1-16周 (单周)', s: 1, e: 16, t: 'single' as WeekType },
                  { label: '2-16周 (双周)', s: 2, e: 16, t: 'double' as WeekType },
                ].map((tpl) => (
                  <button
                    type="button"
                    key={tpl.label}
                    onClick={() => applyWeekTemplate(tpl.s, tpl.e, tpl.t, tpl.label)}
                    className="px-2 py-1 bg-white hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 rounded-md text-[11px] font-medium transition-colors shadow-2xs"
                  >
                    {tpl.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 起始周、结束周与周频选择 */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="text-[11px] text-slate-500 block mb-1">起始周</span>
                <input
                  type="number"
                  min={1}
                  max={totalWeeks}
                  value={startWeek}
                  onChange={(e) => {
                    setStartWeek(Math.max(1, Number(e.target.value)));
                    setWeekType((prev) => (prev === 'custom' ? 'all' : prev));
                  }}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-center font-bold"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block mb-1">结束周</span>
                <input
                  type="number"
                  min={1}
                  max={totalWeeks}
                  value={endWeek}
                  onChange={(e) => {
                    setEndWeek(Math.min(totalWeeks, Number(e.target.value)));
                    setWeekType((prev) => (prev === 'custom' ? 'all' : prev));
                  }}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-center font-bold"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block mb-1">周次规律</span>
                <select
                  value={weekType}
                  onChange={(e) => {
                    const val = e.target.value as WeekType;
                    setWeekType(val);
                    setShowCustomWeekSelector(val === 'custom');
                    if (val === 'custom' && customWeeks.length === 0) {
                      // 预填 startWeek 到 endWeek
                      const arr = [];
                      for (let i = startWeek; i <= endWeek; i++) arr.push(i);
                      setCustomWeeks(arr);
                    }
                  }}
                  className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-medium"
                >
                  <option value="all">每周上课</option>
                  <option value="single">单周上课 (单号周)</option>
                  <option value="double">双周上课 (双号周)</option>
                  <option value="custom">指定周次 (点选勾选)</option>
                </select>
              </div>
            </div>

            {/* 自定义周次点选面板 (1~20周小方格) */}
            {weekType === 'custom' && (
              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-slate-700">点选指定开课周次:</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const arr = Array.from({ length: totalWeeks }, (_, i) => i + 1);
                        setCustomWeeks(arr);
                      }}
                      className="text-[10px] text-indigo-600 hover:underline"
                    >
                      全选
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomWeeks([])}
                      className="text-[10px] text-slate-400 hover:underline"
                    >
                      清空
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-10 gap-1">
                  {Array.from({ length: totalWeeks }, (_, i) => i + 1).map((w) => {
                    const isChecked = customWeeks.includes(w);
                    return (
                      <button
                        type="button"
                        key={w}
                        onClick={() => toggleCustomWeek(w)}
                        className={`h-7 rounded text-[11px] font-semibold transition-all ${
                          isChecked
                            ? 'bg-indigo-600 text-white shadow-2xs'
                            : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                        }`}
                      >
                        {w}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 5. 智能排课检测提示 (冲突 vs 错峰) */}
          {realConflictingLessons.length > 0 && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>存在时间冲突的课程 ({realConflictingLessons.length}门)</span>
              </div>
              <div className="text-[11px] text-rose-600 pl-5 space-y-0.5">
                {realConflictingLessons.map((c) => (
                  <div key={c.id}>
                    • 冲突课程: <strong>{c.subject}</strong> ({formatLessonSlotSpan(c, timeSlots).slotName}, {formatWeekRange(c)})
                  </div>
                ))}
              </div>
            </div>
          )}

          {staggeredLessons.length > 0 && realConflictingLessons.length === 0 && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                提示：同节次检测到已有课程，但开课周次完全错开，属于高校前后半学期正常轮换排课，无冲突。
              </span>
            </div>
          )}

          {/* 6. 备课重点 / 实验器材耗材备注 */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              备课说明 / 实验耗材器材 / 课后作业 (选填)
            </label>
            <textarea
              rows={2}
              placeholder="例如：需提前15分钟到实验室准备示波器，课后布置习题册第三章单号题"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden transition-all"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{initialLesson ? '保存修改' : '确认添加'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
