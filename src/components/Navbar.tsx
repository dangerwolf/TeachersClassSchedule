import React from 'react';
import {
  Calendar,
  Clock,
  ListFilter,
  BarChart3,
  Plus,
  Printer,
  Download,
  Palette,
  Settings,
  Sparkles,
  School,
  GraduationCap
} from 'lucide-react';
import { TeacherProfile, TimetableConfig, ViewMode } from '../types';

interface NavbarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  config: TimetableConfig;
  onConfigChange: (config: TimetableConfig) => void;
  profile: TeacherProfile;
  onOpenProfile: () => void;
  onAddLesson: () => void;
  onOpenClassManager: () => void;
  onOpenTimeSlots: () => void;
  onOpenPrint: () => void;
  onOpenExport: () => void;
  totalLessonsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  viewMode,
  onViewModeChange,
  config,
  onConfigChange,
  profile,
  onOpenProfile,
  onAddLesson,
  onOpenClassManager,
  onOpenTimeSlots,
  onOpenPrint,
  onOpenExport,
  totalLessonsCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & School/Teacher Title */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-sky-600 text-white flex items-center justify-center shadow-sm shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 truncate tracking-tight">
                  {profile.name}
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200/60 rounded-md">
                  {profile.title || '教师'}
                </span>
                <span className="hidden md:inline-block text-xs text-slate-500 font-medium truncate max-w-[180px]">
                  • {profile.school}
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                <span>{profile.semester}</span>
                <span className="text-slate-300">•</span>
                <span className="text-indigo-600 font-medium">周课时: {totalLessonsCount}节</span>
              </p>
            </div>
          </div>

          {/* Center: View Switcher Tabs */}
          <div className="hidden lg:flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/80">
            <button
              id="tab-grid-view"
              onClick={() => onViewModeChange('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>周课表矩阵</span>
            </button>
            <button
              id="tab-today-view"
              onClick={() => onViewModeChange('today')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'today'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>今日聚焦</span>
            </button>
            <button
              id="tab-list-view"
              onClick={() => onViewModeChange('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>课程清单</span>
            </button>
            <button
              id="tab-analytics-view"
              onClick={() => onViewModeChange('analytics')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'analytics'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>教学统计</span>
            </button>
          </div>

          {/* Right: Quick Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Weekdays Toggle 5天/7天 */}
            <button
              id="toggle-weekend-btn"
              onClick={() => onConfigChange({ ...config, showWeekends: !config.showWeekends })}
              title={config.showWeekends ? '当前显示7天（含周末），点击切换为5天工作日' : '当前显示5天，点击展开周末'}
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>{config.showWeekends ? '7天制' : '5天制'}</span>
            </button>

            {/* Class & Color Management */}
            <button
              id="open-class-mgr-btn"
              onClick={onOpenClassManager}
              title="班级与颜色管理"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 hover:text-indigo-600 transition-colors"
            >
              <Palette className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">班级颜色</span>
            </button>

            {/* Print */}
            <button
              id="open-print-btn"
              onClick={onOpenPrint}
              title="在线打印课表"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 hover:text-indigo-600 transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">打印</span>
            </button>

            {/* Export & Backup */}
            <button
              id="open-export-btn"
              onClick={onOpenExport}
              title="数据导出与备份"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 hover:text-indigo-600 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">导出</span>
            </button>

            {/* Settings & Periods */}
            <button
              id="open-settings-btn"
              onClick={onOpenTimeSlots}
              title="作息时间与节次设置"
              className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg border border-slate-200 bg-white transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Add Lesson Main Button */}
            <button
              id="add-lesson-main-btn"
              onClick={onAddLesson}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>添加课程</span>
            </button>
          </div>
        </div>

        {/* Mobile View Switcher Tabs Bar */}
        <div className="flex lg:hidden items-center justify-around border-t border-slate-200/80 py-2">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${
              viewMode === 'grid' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>周课表</span>
          </button>
          <button
            onClick={() => onViewModeChange('today')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${
              viewMode === 'today' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>今日</span>
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${
              viewMode === 'list' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>清单</span>
          </button>
          <button
            onClick={() => onViewModeChange('analytics')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${
              viewMode === 'analytics' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>统计</span>
          </button>
        </div>
      </div>
    </header>
  );
};
