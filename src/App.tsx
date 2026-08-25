/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ClassInfo,
  CourseLesson,
  DayOfWeek,
  TeacherProfile,
  TimeSlot,
  TimetableConfig,
  ViewMode,
} from './types';
import {
  loadClasses,
  saveClasses,
  loadTimeSlots,
  saveTimeSlots,
  loadLessons,
  saveLessons,
  loadProfile,
  saveProfile,
  loadConfig,
  saveConfig,
  resetToDefaults,
} from './utils/storage';

import { Navbar } from './components/Navbar';
import { ClassBadgeBar } from './components/ClassBadgeBar';
import { TimetableGrid } from './components/TimetableGrid';
import { TodayTimeline } from './components/TodayTimeline';
import { LessonListView } from './components/LessonListView';
import { LoadAnalytics } from './components/LoadAnalytics';
import { LessonModal } from './components/LessonModal';
import { ClassManagerModal } from './components/ClassManagerModal';
import { TimeSlotModal } from './components/TimeSlotModal';
import { PrintView } from './components/PrintView';
import { ExportModal } from './components/ExportModal';
import { TeacherProfileModal } from './components/TeacherProfileModal';
import { Plus, Sparkles, School, Calendar, Info } from 'lucide-react';

export default function App() {
  // Core Application State
  const [classes, setClasses] = useState<ClassInfo[]>(() => loadClasses());
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(() => loadTimeSlots());
  const [lessons, setLessons] = useState<CourseLesson[]>(() => loadLessons());
  const [profile, setProfile] = useState<TeacherProfile>(() => loadProfile());
  const [config, setConfig] = useState<TimetableConfig>(() => loadConfig());

  // UI Navigation State
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  // Modals State
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<CourseLesson | null>(null);
  const [newLessonDay, setNewLessonDay] = useState<DayOfWeek>(1);
  const [newLessonSlotId, setNewLessonSlotId] = useState<string>('slot-1');

  const [isClassManagerOpen, setIsClassManagerOpen] = useState(false);
  const [isTimeSlotModalOpen, setIsTimeSlotModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Sync to local storage
  useEffect(() => {
    saveClasses(classes);
  }, [classes]);

  useEffect(() => {
    saveTimeSlots(timeSlots);
  }, [timeSlots]);

  useEffect(() => {
    saveLessons(lessons);
  }, [lessons]);

  useEffect(() => {
    saveProfile(profile);
  }, [profile]);

  useEffect(() => {
    saveConfig(config);
  }, [config]);

  // Handlers for Lessons
  const handleOpenAddLesson = (day?: DayOfWeek, slotId?: string) => {
    setEditingLesson(null);
    if (day) setNewLessonDay(day);
    if (slotId) setNewLessonSlotId(slotId);
    setIsLessonModalOpen(true);
  };

  const handleOpenEditLesson = (lesson: CourseLesson) => {
    setEditingLesson(lesson);
    setIsLessonModalOpen(true);
  };

  const handleSaveLesson = (lessonData: Omit<CourseLesson, 'id'> & { id?: string }) => {
    if (lessonData.id) {
      // Edit existing
      setLessons((prev) =>
        prev.map((l) => (l.id === lessonData.id ? ({ ...lessonData, id: lessonData.id } as CourseLesson) : l))
      );
    } else {
      // Create new
      const newLesson: CourseLesson = {
        ...lessonData,
        id: `lesson-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        updatedAt: Date.now(),
      };
      setLessons((prev) => [...prev, newLesson]);
    }
  };

  const handleDeleteLesson = (lessonId: string) => {
    setLessons((prev) => prev.filter((l) => l.id !== lessonId));
  };

  // Reset to default sample dataset
  const handleResetData = () => {
    resetToDefaults();
    setClasses(loadClasses());
    setTimeSlots(loadTimeSlots());
    setLessons(loadLessons());
    setProfile(loadProfile());
    setConfig(loadConfig());
  };

  // Backup restore
  const handleImportBackup = (data: {
    lessons: CourseLesson[];
    classes: ClassInfo[];
    timeSlots: TimeSlot[];
    profile: TeacherProfile;
  }) => {
    setLessons(data.lessons);
    setClasses(data.classes);
    setTimeSlots(data.timeSlots);
    setProfile(data.profile);
    saveLessons(data.lessons);
    saveClasses(data.classes);
    saveTimeSlots(data.timeSlots);
    saveProfile(data.profile);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Main Navigation Header */}
      <Navbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        config={config}
        onConfigChange={setConfig}
        profile={profile}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onAddLesson={() => handleOpenAddLesson()}
        onOpenClassManager={() => setIsClassManagerOpen(true)}
        onOpenTimeSlots={() => setIsTimeSlotModalOpen(true)}
        onOpenPrint={() => setIsPrintModalOpen(true)}
        onOpenExport={() => setIsExportModalOpen(true)}
        totalLessonsCount={lessons.length}
      />

      {/* Class Color Badges & Spotlight Bar */}
      <ClassBadgeBar
        classes={classes}
        lessons={lessons}
        selectedClassId={selectedClassId}
        onSelectClass={setSelectedClassId}
        onOpenClassManager={() => setIsClassManagerOpen(true)}
      />

      {/* Main Content View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8">
        {viewMode === 'grid' && (
          <div className="space-y-4">
            {/* Top Quick Status Bar */}
            <div className="flex items-center justify-between text-xs text-slate-600 flex-wrap gap-2 print:hidden">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="font-bold text-slate-800 hover:text-indigo-600 flex items-center gap-1 transition-colors"
                >
                  <School className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{profile.school}</span>
                  <span>•</span>
                  <span>{profile.name}</span>
                </button>
                <span className="text-slate-400">({profile.semester})</span>
              </div>

              <div className="flex items-center gap-3">
                {selectedClassId && (
                  <button
                    onClick={() => setSelectedClassId(null)}
                    className="text-indigo-600 font-semibold hover:underline"
                  >
                    清除班级筛选 (显示全部)
                  </button>
                )}
                <span className="text-slate-500">
                  当前排课: <strong className="text-slate-900 font-bold">{lessons.length}</strong> 节 / 周
                </span>
              </div>
            </div>

            {/* Timetable Matrix Grid */}
            <TimetableGrid
              lessons={lessons}
              classes={classes}
              timeSlots={timeSlots}
              config={config}
              selectedClassId={selectedClassId}
              onAddLessonAt={(day, slotId) => handleOpenAddLesson(day, slotId)}
              onEditLesson={handleOpenEditLesson}
              onDeleteLesson={handleDeleteLesson}
            />
          </div>
        )}

        {viewMode === 'today' && (
          <TodayTimeline
            lessons={lessons}
            classes={classes}
            timeSlots={timeSlots}
            onEditLesson={handleOpenEditLesson}
            onAddLessonAt={(day, slotId) => handleOpenAddLesson(day, slotId)}
          />
        )}

        {viewMode === 'list' && (
          <LessonListView
            lessons={lessons}
            classes={classes}
            timeSlots={timeSlots}
            onAddLesson={() => handleOpenAddLesson()}
            onEditLesson={handleOpenEditLesson}
            onDeleteLesson={handleDeleteLesson}
          />
        )}

        {viewMode === 'analytics' && (
          <LoadAnalytics
            lessons={lessons}
            classes={classes}
            timeSlots={timeSlots}
            profile={profile}
          />
        )}
      </main>

      {/* Floating Action Button (Mobile only) */}
      <button
        onClick={() => handleOpenAddLesson()}
        className="lg:hidden fixed bottom-5 right-5 z-20 w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg hover:bg-indigo-700 active:scale-95 transition-all print:hidden"
        title="添加课程"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Modals */}
      <LessonModal
        isOpen={isLessonModalOpen}
        onClose={() => setIsLessonModalOpen(false)}
        onSave={handleSaveLesson}
        classes={classes}
        timeSlots={timeSlots}
        existingLessons={lessons}
        initialLesson={editingLesson}
        initialDay={newLessonDay}
        initialSlotId={newLessonSlotId}
      />

      <ClassManagerModal
        isOpen={isClassManagerOpen}
        onClose={() => setIsClassManagerOpen(false)}
        classes={classes}
        lessons={lessons}
        onSaveClasses={setClasses}
      />

      <TimeSlotModal
        isOpen={isTimeSlotModalOpen}
        onClose={() => setIsTimeSlotModalOpen(false)}
        timeSlots={timeSlots}
        onSaveTimeSlots={setTimeSlots}
      />

      <PrintView
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        lessons={lessons}
        classes={classes}
        timeSlots={timeSlots}
        profile={profile}
        config={config}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        lessons={lessons}
        classes={classes}
        timeSlots={timeSlots}
        profile={profile}
        onImportBackup={handleImportBackup}
        onResetData={handleResetData}
      />

      <TeacherProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        onSaveProfile={setProfile}
      />
    </div>
  );
}
