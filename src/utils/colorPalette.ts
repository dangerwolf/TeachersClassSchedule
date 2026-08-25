export interface ClassColorOption {
  id: string;
  name: string;
  color: string; // Primary hex
  bgLightColor: string; // Card background (light pastel)
  textColor: string; // Header/title text
  borderColor: string; // Card border
  badgeBg: string;
  badgeText: string;
}

export const CLASS_PALETTES: ClassColorOption[] = [
  {
    id: 'ocean-blue',
    name: '海蓝',
    color: '#0284c7', // sky-600
    bgLightColor: '#f0f9ff', // sky-50
    textColor: '#0369a1', // sky-700
    borderColor: '#bae6fd', // sky-200
    badgeBg: '#e0f2fe',
    badgeText: '#0369a1',
  },
  {
    id: 'emerald-green',
    name: '薄荷绿',
    color: '#059669', // emerald-600
    bgLightColor: '#ecfdf5', // emerald-50
    textColor: '#047857', // emerald-700
    borderColor: '#a7f3d0', // emerald-200
    badgeBg: '#d1fae5',
    badgeText: '#065f46',
  },
  {
    id: 'violet-purple',
    name: '丁香紫',
    color: '#7c3aed', // violet-600
    bgLightColor: '#f5f3ff', // violet-50
    textColor: '#6d28d9', // violet-700
    borderColor: '#ddd6fe', // violet-200
    badgeBg: '#ede9fe',
    badgeText: '#5b21b6',
  },
  {
    id: 'amber-orange',
    name: '琥珀橘',
    color: '#d97706', // amber-600
    bgLightColor: '#fffbeb', // amber-50
    textColor: '#b45309', // amber-700
    borderColor: '#fde68a', // amber-200
    badgeBg: '#fef3c7',
    badgeText: '#92400e',
  },
  {
    id: 'rose-pink',
    name: '玫瑰粉',
    color: '#e11d48', // rose-600
    bgLightColor: '#fff1f2', // rose-50
    textColor: '#be123c', // rose-700
    borderColor: '#fecdd3', // rose-200
    badgeBg: '#ffe4e6',
    badgeText: '#9f1239',
  },
  {
    id: 'teal-cyan',
    name: '青碧蓝',
    color: '#0d9488', // teal-600
    bgLightColor: '#f0fdfa', // teal-50
    textColor: '#0f766e', // teal-700
    borderColor: '#99f6e4', // teal-200
    badgeBg: '#ccfbf1',
    badgeText: '#115e59',
  },
  {
    id: 'indigo-slate',
    name: '雅致靛',
    color: '#4f46e5', // indigo-600
    bgLightColor: '#eef2ff', // indigo-50
    textColor: '#4338ca', // indigo-700
    borderColor: '#c7d2fe', // indigo-200
    badgeBg: '#e0e7ff',
    badgeText: '#3730a3',
  },
  {
    id: 'fuchsia-magenta',
    name: '洋红紫',
    color: '#c026d3', // fuchsia-600
    bgLightColor: '#fdf4ff', // fuchsia-50
    textColor: '#a21caf', // fuchsia-700
    borderColor: '#f5d0fe', // fuchsia-200
    badgeBg: '#fae8ff',
    badgeText: '#86198f',
  },
  {
    id: 'coral-red',
    name: '珊瑚红',
    color: '#ea580c', // orange-600
    bgLightColor: '#fff7ed', // orange-50
    textColor: '#c2410c', // orange-700
    borderColor: '#fed7aa', // orange-200
    badgeBg: '#ffedd5',
    badgeText: '#9a3412',
  },
  {
    id: 'warm-stone',
    name: '暖灰金',
    color: '#57534e', // stone-600
    bgLightColor: '#fafaf9', // stone-50
    textColor: '#44403c', // stone-700
    borderColor: '#e7e5e4', // stone-200
    badgeBg: '#f5f5f4',
    badgeText: '#292524',
  },
];

export function getColorForPaletteId(id: string): ClassColorOption {
  const found = CLASS_PALETTES.find((p) => p.id === id);
  return found || CLASS_PALETTES[0];
}

export const DAYS_CONFIG = [
  { day: 1 as const, name: '周一', full: '星期一', short: '一' },
  { day: 2 as const, name: '周二', full: '星期二', short: '二' },
  { day: 3 as const, name: '周三', full: '星期三', short: '三' },
  { day: 4 as const, name: '周四', full: '星期四', short: '四' },
  { day: 5 as const, name: '周五', full: '星期五', short: '五' },
  { day: 6 as const, name: '周六', full: '星期六', short: '六' },
  { day: 7 as const, name: '周日', full: '星期日', short: '日' },
];
