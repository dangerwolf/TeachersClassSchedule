import React, { useState } from 'react';
import { SectionType, TimeSlot } from '../types';
import { DEFAULT_TIME_SLOTS } from '../utils/storage';
import { X, Plus, Trash2, Clock, RotateCcw, Check } from 'lucide-react';

interface TimeSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  timeSlots: TimeSlot[];
  onSaveTimeSlots: (slots: TimeSlot[]) => void;
}

export const TimeSlotModal: React.FC<TimeSlotModalProps> = ({
  isOpen,
  onClose,
  timeSlots,
  onSaveTimeSlots,
}) => {
  const [slots, setSlots] = useState<TimeSlot[]>(timeSlots);
  const [isAdding, setIsAdding] = useState(false);

  // New slot form
  const [name, setName] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('08:45');
  const [section, setSection] = useState<SectionType>('morning');
  const [isBreak, setIsBreak] = useState(false);

  if (!isOpen) return null;

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newSlot: TimeSlot = {
      id: `slot-${Date.now()}`,
      name: name.trim(),
      startTime,
      endTime,
      section,
      isBreak,
    };

    const updated = [...slots, newSlot].sort((a, b) => a.startTime.localeCompare(b.startTime));
    setSlots(updated);
    setIsAdding(false);
    setName('');
  };

  const handleRemoveSlot = (id: string) => {
    setSlots(slots.filter((s) => s.id !== id));
  };

  const handleResetDefaults = () => {
    if (confirm('确定要恢复系统默认作息时间表（标准中小学/高中作息）吗？')) {
      setSlots(DEFAULT_TIME_SLOTS);
    }
  };

  const handleSave = () => {
    onSaveTimeSlots(slots);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200 my-8 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">作息时间与节次设置</h3>
              <p className="text-xs text-slate-500">
                自定义学校的每节课时间段、课间休息与晚自习
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
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={handleResetDefaults}
              className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1 font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>恢复默认标准作息</span>
            </button>

            {!isAdding && (
              <button
                onClick={() => setIsAdding(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>添加节次/课间</span>
              </button>
            )}
          </div>

          {/* Add form */}
          {isAdding && (
            <form onSubmit={handleAddSlot} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3">
              <div className="text-xs font-bold text-slate-800">添加新节次</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">节次名称</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="例如：第9节 / 晚辅导"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">时段划分</label>
                  <select
                    value={section}
                    onChange={(e) => setSection(e.target.value as SectionType)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl font-medium"
                  >
                    <option value="morning">上午时段</option>
                    <option value="afternoon">下午时段</option>
                    <option value="evening">晚间时段</option>
                    <option value="break">休息/课间</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">开始时间</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">结束时间</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isBreak"
                  checked={isBreak}
                  onChange={(e) => setIsBreak(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="isBreak" className="text-xs text-slate-700 font-medium">
                  设为大课间/午休/活动栏（不计入正常课表排课）
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-xl"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
                >
                  添加
                </button>
              </div>
            </form>
          )}

          {/* Slots Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">节次名称</th>
                  <th className="p-3">时段</th>
                  <th className="p-3">开始 - 结束时间</th>
                  <th className="p-3">类型</th>
                  <th className="p-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80">
                {slots.map((slot) => (
                  <tr key={slot.id} className="hover:bg-slate-50/60">
                    <td className="p-3 font-bold text-slate-800">{slot.name}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                          slot.section === 'morning'
                            ? 'bg-amber-50 text-amber-700'
                            : slot.section === 'afternoon'
                            ? 'bg-sky-50 text-sky-700'
                            : slot.section === 'evening'
                            ? 'bg-indigo-50 text-indigo-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {slot.section === 'morning'
                          ? '上午'
                          : slot.section === 'afternoon'
                          ? '下午'
                          : slot.section === 'evening'
                          ? '晚间'
                          : '课间'}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-medium text-slate-700">
                      {slot.startTime} ~ {slot.endTime}
                    </td>
                    <td className="p-3 text-slate-500">
                      {slot.isBreak ? (
                        <span className="text-amber-600">☕ 休息/大课间</span>
                      ) : (
                        <span>📖 授课节次</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleRemoveSlot(slot.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="删除该节次"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
          >
            保存并应用
          </button>
        </div>
      </div>
    </div>
  );
};
