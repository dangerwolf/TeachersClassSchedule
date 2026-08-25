import React, { useState, useRef } from 'react';
import { ClassInfo, CourseLesson, TeacherProfile, TimeSlot } from '../types';
import { downloadFile, exportToCSV, exportToICS, resetToDefaults } from '../utils/storage';
import { Download, FileSpreadsheet, Calendar, FileJson, Upload, RefreshCw, X, Check, AlertCircle } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessons: CourseLesson[];
  classes: ClassInfo[];
  timeSlots: TimeSlot[];
  profile: TeacherProfile;
  onImportBackup: (data: {
    lessons: CourseLesson[];
    classes: ClassInfo[];
    timeSlots: TimeSlot[];
    profile: TeacherProfile;
  }) => void;
  onResetData: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  lessons,
  classes,
  timeSlots,
  profile,
  onImportBackup,
  onResetData,
}) => {
  const [copiedState, setCopiedState] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // 1. Export Excel / CSV
  const handleExportCSV = () => {
    const csvContent = exportToCSV(lessons, classes, timeSlots, profile);
    const fileName = `${profile.name}_课表_${profile.semester}.csv`;
    downloadFile(csvContent, fileName, 'text/csv;charset=utf-8;');
    setCopiedState('csv');
    setTimeout(() => setCopiedState(null), 2000);
  };

  // 2. Export ICS Calendar
  const handleExportICS = () => {
    const icsContent = exportToICS(lessons, classes, timeSlots, profile);
    const fileName = `${profile.name}_教学课表.ics`;
    downloadFile(icsContent, fileName, 'text/calendar;charset=utf-8;');
    setCopiedState('ics');
    setTimeout(() => setCopiedState(null), 2000);
  };

  // 3. Export JSON Full Backup
  const handleExportJSON = () => {
    const backupData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      profile,
      classes,
      timeSlots,
      lessons,
    };
    const jsonContent = JSON.stringify(backupData, null, 2);
    const fileName = `教师课表备份_${profile.name}_${new Date().toISOString().slice(0, 10)}.json`;
    downloadFile(jsonContent, fileName, 'application/json');
    setCopiedState('json');
    setTimeout(() => setCopiedState(null), 2000);
  };

  // 4. Import JSON Backup
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.classes || !parsed.lessons || !parsed.timeSlots) {
          throw new Error('无效的课表备份文件格式');
        }
        onImportBackup({
          classes: parsed.classes,
          lessons: parsed.lessons,
          timeSlots: parsed.timeSlots,
          profile: parsed.profile || profile,
        });
        alert('课表数据恢复成功！');
        onClose();
      } catch (err: any) {
        setImportError(err.message || '解析备份文件失败，请检查文件是否正确');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-xl overflow-hidden border border-slate-200 my-8 animate-in fade-in zoom-in-95 duration-200 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">数据导出与多端同步</h3>
              <p className="text-xs text-slate-500">
                支持导出 Excel 表格、手机日历同步文件及完整数据备份
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

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {importError && (
            <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{importError}</span>
            </div>
          )}

          {/* Export Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Option 1: Excel / CSV */}
            <button
              onClick={handleExportCSV}
              className="p-4 bg-emerald-50/60 hover:bg-emerald-50 border border-emerald-200/80 rounded-2xl text-left transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">导出为 Excel / CSV</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  适合用 WPS / Excel 打开打印或上报教务处
                </p>
              </div>
              <div className="mt-3 flex items-center text-xs font-bold text-emerald-700">
                {copiedState === 'csv' ? (
                  <span className="flex items-center gap-1 text-emerald-600">
                    <Check className="w-3.5 h-3.5" /> 已下载
                  </span>
                ) : (
                  <span>下载 .csv 文件 →</span>
                )}
              </div>
            </button>

            {/* Option 2: ICS Calendar */}
            <button
              onClick={handleExportICS}
              className="p-4 bg-sky-50/60 hover:bg-sky-50 border border-sky-200/80 rounded-2xl text-left transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                  <Calendar className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">手机/电脑日历同步</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  导出 .ics 文件，一键导入苹果/谷歌/华为手机日历
                </p>
              </div>
              <div className="mt-3 flex items-center text-xs font-bold text-sky-700">
                {copiedState === 'ics' ? (
                  <span className="flex items-center gap-1 text-sky-600">
                    <Check className="w-3.5 h-3.5" /> 已下载
                  </span>
                ) : (
                  <span>下载 .ics 日历 →</span>
                )}
              </div>
            </button>

            {/* Option 3: JSON Backup */}
            <button
              onClick={handleExportJSON}
              className="p-4 bg-indigo-50/60 hover:bg-indigo-50 border border-indigo-200/80 rounded-2xl text-left transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                  <FileJson className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">完整 JSON 备份</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  备份包含所有班级、颜色设置、作息及课程
                </p>
              </div>
              <div className="mt-3 flex items-center text-xs font-bold text-indigo-700">
                {copiedState === 'json' ? (
                  <span className="flex items-center gap-1 text-indigo-600">
                    <Check className="w-3.5 h-3.5" /> 已下载
                  </span>
                ) : (
                  <span>下载备份文件 →</span>
                )}
              </div>
            </button>
          </div>

          {/* Import / Restore Section */}
          <div className="pt-4 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-800 mb-2">恢复或导入课表备份</h4>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50/40 rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5"
            >
              <Upload className="w-5 h-5 text-indigo-600" />
              <div className="text-xs font-semibold text-slate-800">
                点击选择或拖拽 .json 课表备份文件导入
              </div>
              <div className="text-[11px] text-slate-400">
                将无缝还原所有课程设置与班级颜色
              </div>
            </div>
          </div>

          {/* Reset Demo Data */}
          <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
            <span>如需体验完整样例课表：</span>
            <button
              onClick={() => {
                if (confirm('确定要重置为默认高中物理示范课表吗？')) {
                  onResetData();
                  onClose();
                }
              }}
              className="text-indigo-600 hover:underline flex items-center gap-1 font-semibold"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>加载示范标准课表</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
};
