import React, { useState } from 'react';
import { ClassInfo, CourseLesson } from '../types';
import { CLASS_PALETTES, ClassColorOption } from '../utils/colorPalette';
import { X, Plus, Trash2, Edit2, Palette, Check, Users, Building, AlertCircle } from 'lucide-react';

interface ClassManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: ClassInfo[];
  lessons: CourseLesson[];
  onSaveClasses: (classes: ClassInfo[]) => void;
}

export const ClassManagerModal: React.FC<ClassManagerModalProps> = ({
  isOpen,
  onClose,
  classes,
  lessons,
  onSaveClasses,
}) => {
  const [editingClass, setEditingClass] = useState<ClassInfo | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const [studentCount, setStudentCount] = useState<number>(45);
  const [classroomDefault, setClassroomDefault] = useState('');
  const [remarks, setRemarks] = useState('');
  const [selectedPalette, setSelectedPalette] = useState<ClassColorOption>(CLASS_PALETTES[0]);

  if (!isOpen) return null;

  const startCreate = () => {
    // Pick an unused palette if possible
    const usedColors = new Set(classes.map((c) => c.color));
    const available = CLASS_PALETTES.find((p) => !usedColors.has(p.color)) || CLASS_PALETTES[0];

    setName('');
    setGrade('高一年级');
    setStudentCount(45);
    setClassroomDefault('');
    setRemarks('');
    setSelectedPalette(available);
    setIsCreating(true);
    setEditingClass(null);
  };

  const startEdit = (cls: ClassInfo) => {
    setEditingClass(cls);
    setName(cls.name);
    setGrade(cls.grade || '');
    setStudentCount(cls.studentCount || 45);
    setClassroomDefault(cls.classroomDefault || '');
    setRemarks(cls.remarks || '');

    const foundPalette = CLASS_PALETTES.find((p) => p.color === cls.color) || {
      id: 'custom',
      name: '自定义色',
      color: cls.color,
      bgLightColor: cls.bgLightColor,
      textColor: cls.textColor,
      borderColor: cls.borderColor,
      badgeBg: cls.bgLightColor,
      badgeText: cls.textColor,
    };
    setSelectedPalette(foundPalette);
    setIsCreating(false);
  };

  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (isCreating) {
      const newClass: ClassInfo = {
        id: `class-${Date.now()}`,
        name: name.trim(),
        grade: grade.trim(),
        studentCount,
        classroomDefault: classroomDefault.trim(),
        remarks: remarks.trim(),
        color: selectedPalette.color,
        bgLightColor: selectedPalette.bgLightColor,
        textColor: selectedPalette.textColor,
        borderColor: selectedPalette.borderColor,
      };
      onSaveClasses([...classes, newClass]);
      setIsCreating(false);
    } else if (editingClass) {
      const updated = classes.map((c) =>
        c.id === editingClass.id
          ? {
              ...c,
              name: name.trim(),
              grade: grade.trim(),
              studentCount,
              classroomDefault: classroomDefault.trim(),
              remarks: remarks.trim(),
              color: selectedPalette.color,
              bgLightColor: selectedPalette.bgLightColor,
              textColor: selectedPalette.textColor,
              borderColor: selectedPalette.borderColor,
            }
          : c
      );
      onSaveClasses(updated);
      setEditingClass(null);
    }
  };

  const handleDeleteClass = (classId: string) => {
    const classLessons = lessons.filter((l) => l.classId === classId);
    if (classLessons.length > 0) {
      if (
        !confirm(
          `该班级当前有 ${classLessons.length} 门关联课程。删除班级将保留课程数据，但可能失去专属颜色标记。确定删除吗？`
        )
      ) {
        return;
      }
    }
    onSaveClasses(classes.filter((c) => c.id !== classId));
    if (editingClass?.id === classId) {
      setEditingClass(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200 my-8 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">班级与色彩管理</h3>
              <p className="text-xs text-slate-500">
                为每个班级设定专属标识色，让课表一目了然
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Create or Edit Form */}
          {(isCreating || editingClass) ? (
            <form onSubmit={handleSaveClass} className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900">
                  {isCreating ? '➕ 添加新班级' : `✏️ 编辑班级：${editingClass?.name}`}
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingClass(null);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  取消返回
                </button>
              </div>

              {/* Class Name & Grade */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    班级名称 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="例如：高一(5)班"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    所属年级 / 类别
                  </label>
                  <input
                    type="text"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    placeholder="例如：高一年级 / 实验班"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Default Classroom & Student Count */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    固定/默认教室
                  </label>
                  <input
                    type="text"
                    value={classroomDefault}
                    onChange={(e) => setClassroomDefault(e.target.value)}
                    placeholder="例如：笃行楼 105室"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    学生人数 (人)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="200"
                    value={studentCount}
                    onChange={(e) => setStudentCount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Color Palette Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  选择班级专属主题色 (预设高对比度色彩)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {CLASS_PALETTES.map((palette) => {
                    const isSelected = selectedPalette.color === palette.color;
                    return (
                      <button
                        key={palette.id}
                        type="button"
                        onClick={() => setSelectedPalette(palette)}
                        style={{
                          backgroundColor: palette.bgLightColor,
                          borderColor: isSelected ? palette.color : palette.borderColor,
                          borderWidth: isSelected ? '2px' : '1px',
                        }}
                        className={`p-2 rounded-xl flex items-center gap-2 text-left transition-all ${
                          isSelected ? 'shadow-xs ring-2 ring-offset-1 ring-slate-400' : 'hover:opacity-90'
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center text-white"
                          style={{ backgroundColor: palette.color }}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5" />}
                        </span>
                        <span
                          style={{ color: palette.textColor }}
                          className="text-xs font-bold truncate"
                        >
                          {palette.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="pt-1">
                <div className="text-xs text-slate-500 mb-1 font-semibold">课表卡片视觉预览：</div>
                <div
                  style={{
                    backgroundColor: selectedPalette.bgLightColor,
                    borderColor: selectedPalette.borderColor,
                  }}
                  className="p-3 rounded-2xl border flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        style={{
                          backgroundColor: selectedPalette.color,
                          color: '#ffffff',
                        }}
                        className="px-2.5 py-0.5 rounded-full text-xs font-bold shadow-2xs"
                      >
                        {name || '示例班级'}
                      </span>
                      <span className="text-xs font-bold text-slate-900">高中物理 (必修一)</span>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-1 flex items-center gap-2">
                      <span>📍 {classroomDefault || '笃行楼 101室'}</span>
                      <span>•</span>
                      <span>学生: {studentCount}人</span>
                    </div>
                  </div>
                  <span
                    style={{ color: selectedPalette.textColor }}
                    className="text-xs font-bold"
                  >
                    {selectedPalette.name}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingClass(null);
                  }}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-xl"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
                >
                  保存班级
                </button>
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                当前已有班级 ({classes.length} 个)
              </span>
              <button
                onClick={startCreate}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>添加新班级</span>
              </button>
            </div>
          )}

          {/* Classes List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {classes.map((cls) => {
              const classLessons = lessons.filter((l) => l.classId === cls.id);

              return (
                <div
                  key={cls.id}
                  style={{
                    backgroundColor: cls.bgLightColor,
                    borderColor: cls.borderColor,
                  }}
                  className="p-4 rounded-2xl border transition-all relative flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs"
                          style={{ backgroundColor: cls.color }}
                        />
                        <span className="font-bold text-sm text-slate-900">
                          {cls.name}
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEdit(cls)}
                          className="p-1.5 bg-white/80 hover:bg-white text-slate-600 hover:text-indigo-600 rounded-lg shadow-2xs transition-colors"
                          title="编辑班级"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClass(cls.id)}
                          className="p-1.5 bg-white/80 hover:bg-white text-slate-600 hover:text-rose-600 rounded-lg shadow-2xs transition-colors"
                          title="删除班级"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 mt-2 space-y-1">
                      {cls.grade && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400">年级:</span>
                          <span>{cls.grade}</span>
                        </div>
                      )}
                      {cls.classroomDefault && (
                        <div className="flex items-center gap-1.5">
                          <Building className="w-3 h-3 text-slate-400" />
                          <span className="truncate">{cls.classroomDefault}</span>
                        </div>
                      )}
                      {cls.remarks && (
                        <div className="text-[11px] text-slate-500 truncate italic">
                          {cls.remarks}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-black/5 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">
                      学生: {cls.studentCount || 0} 人
                    </span>
                    <span
                      style={{ color: cls.textColor }}
                      className="font-bold font-mono"
                    >
                      {classLessons.length} 节排课
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
};
