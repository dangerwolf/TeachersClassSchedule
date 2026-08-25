import React from 'react';
import { ClassInfo, CourseLesson } from '../types';
import { Palette, Plus, Check } from 'lucide-react';

interface ClassBadgeBarProps {
  classes: ClassInfo[];
  lessons: CourseLesson[];
  selectedClassId: string | null;
  onSelectClass: (classId: string | null) => void;
  onOpenClassManager: () => void;
}

export const ClassBadgeBar: React.FC<ClassBadgeBarProps> = ({
  classes,
  lessons,
  selectedClassId,
  onSelectClass,
  onOpenClassManager,
}) => {
  return (
    <div className="bg-slate-50/80 border-b border-slate-200/90 py-2.5 px-4 sm:px-6 lg:px-8 print:hidden">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            班级快速筛选:
          </span>

          {/* All Classes Filter */}
          <button
            id="filter-class-all"
            onClick={() => onSelectClass(null)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 ${
              selectedClassId === null
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span>全部班级</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedClassId === null ? 'bg-slate-700 text-slate-100' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {lessons.length}节
            </span>
          </button>

          {/* Class Badges with Custom Colors */}
          {classes.map((cls) => {
            const classLessonsCount = lessons.filter((l) => l.classId === cls.id).length;
            const isSelected = selectedClassId === cls.id;

            return (
              <button
                key={cls.id}
                id={`filter-class-${cls.id}`}
                onClick={() => onSelectClass(isSelected ? null : cls.id)}
                style={{
                  backgroundColor: isSelected ? cls.color : cls.bgLightColor,
                  color: isSelected ? '#ffffff' : cls.textColor,
                  borderColor: cls.borderColor,
                }}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all shrink-0 flex items-center gap-1.5 ${
                  isSelected ? 'shadow-xs scale-105 ring-2 ring-offset-1 ring-slate-400' : 'hover:opacity-90'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 border border-white/60"
                  style={{ backgroundColor: isSelected ? '#ffffff' : cls.color }}
                />
                <span>{cls.name}</span>
                <span
                  style={{
                    backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.06)',
                    color: isSelected ? '#ffffff' : cls.textColor,
                  }}
                  className="text-[10px] px-1.5 py-0.2 rounded-full font-mono"
                >
                  {classLessonsCount}节
                </span>
                {isSelected && <Check className="w-3 h-3 ml-0.5" />}
              </button>
            );
          })}
        </div>

        {/* Color Management Button */}
        <button
          onClick={onOpenClassManager}
          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium shrink-0 flex items-center gap-1 hover:underline ml-2"
        >
          <Palette className="w-3.5 h-3.5" />
          <span>自定义颜色与班级</span>
        </button>
      </div>
    </div>
  );
};
