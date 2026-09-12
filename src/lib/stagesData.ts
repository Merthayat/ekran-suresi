import { StageDefinition } from '../types';

export const STAGES_CONFIG: StageDefinition[] = [
  // 1 - 4: GÜVENLİ ALAN (YEŞİL / y.png)
  {
    stageNumber: 1,
    durationMinutes: 30,
    totalMinutesAtStage: 30,
    label: '30 dk',
    category: 'safe',
    categoryLabel: 'Güvenli Alan (Yeşil)',
    bgClass: 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300',
    borderClass: 'border-emerald-300 dark:border-emerald-700',
    textClass: 'text-emerald-600 dark:text-emerald-400',
    activeBg: 'bg-emerald-500 text-white',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    hexColor: '#10B981',
  },
  {
    stageNumber: 2,
    durationMinutes: 30,
    totalMinutesAtStage: 60,
    label: '1 sa',
    category: 'safe',
    categoryLabel: 'Güvenli Alan (Yeşil)',
    bgClass: 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300',
    borderClass: 'border-emerald-300 dark:border-emerald-700',
    textClass: 'text-emerald-600 dark:text-emerald-400',
    activeBg: 'bg-emerald-500 text-white',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    hexColor: '#10B981',
  },
  {
    stageNumber: 3,
    durationMinutes: 30,
    totalMinutesAtStage: 90,
    label: '1 sa 30 dk',
    category: 'safe',
    categoryLabel: 'Güvenli Alan (Yeşil)',
    bgClass: 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300',
    borderClass: 'border-emerald-300 dark:border-emerald-700',
    textClass: 'text-emerald-600 dark:text-emerald-400',
    activeBg: 'bg-emerald-600 text-white',
    glowColor: 'rgba(13, 148, 136, 0.4)',
    hexColor: '#059669',
  },
  {
    stageNumber: 4,
    durationMinutes: 30,
    totalMinutesAtStage: 120,
    label: '2 sa',
    category: 'safe',
    categoryLabel: 'Güvenli Alan (Yeşil Son)',
    bgClass: 'bg-green-500/10 hover:bg-green-500/20 text-green-700 dark:text-green-300',
    borderClass: 'border-green-300 dark:border-green-700',
    textClass: 'text-green-600 dark:text-green-400',
    activeBg: 'bg-green-600 text-white',
    glowColor: 'rgba(34, 197, 94, 0.4)',
    hexColor: '#16A34A',
  },

  // 5 - 8: DENGELİ SÜRE (SARI / s.png)
  {
    stageNumber: 5,
    durationMinutes: 30,
    totalMinutesAtStage: 150,
    label: '2 sa 30 dk',
    category: 'moderate',
    categoryLabel: 'Dengeli Süre (Sarı)',
    bgClass: 'bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-800 dark:text-yellow-200',
    borderClass: 'border-yellow-300 dark:border-yellow-600',
    textClass: 'text-yellow-700 dark:text-yellow-300',
    activeBg: 'bg-yellow-500 text-slate-900',
    glowColor: 'rgba(234, 179, 8, 0.45)',
    hexColor: '#EAB308',
  },
  {
    stageNumber: 6,
    durationMinutes: 30,
    totalMinutesAtStage: 180,
    label: '3 sa',
    category: 'moderate',
    categoryLabel: 'Dengeli Süre (Sarı)',
    bgClass: 'bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-800 dark:text-yellow-200',
    borderClass: 'border-yellow-300 dark:border-yellow-600',
    textClass: 'text-yellow-700 dark:text-yellow-300',
    activeBg: 'bg-yellow-500 text-slate-900',
    glowColor: 'rgba(234, 179, 8, 0.45)',
    hexColor: '#EAB308',
  },
  {
    stageNumber: 7,
    durationMinutes: 30,
    totalMinutesAtStage: 210,
    label: '3 sa 30 dk',
    category: 'moderate',
    categoryLabel: 'Dengeli Süre (Sarı)',
    bgClass: 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-200',
    borderClass: 'border-amber-300 dark:border-amber-600',
    textClass: 'text-amber-700 dark:text-amber-300',
    activeBg: 'bg-amber-500 text-slate-900',
    glowColor: 'rgba(245, 158, 11, 0.45)',
    hexColor: '#F59E0B',
  },
  {
    stageNumber: 8,
    durationMinutes: 30,
    totalMinutesAtStage: 240,
    label: '4 sa',
    category: 'moderate',
    categoryLabel: 'Dengeli Süre (Sarı Son)',
    bgClass: 'bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-800 dark:text-yellow-200',
    borderClass: 'border-yellow-300 dark:border-yellow-600',
    textClass: 'text-yellow-700 dark:text-yellow-300',
    activeBg: 'bg-yellow-500 text-slate-900',
    glowColor: 'rgba(234, 179, 8, 0.45)',
    hexColor: '#EAB308',
  },

  // 9 - 13: DİKKAT SINIRI (TURUNCU / t.png)
  {
    stageNumber: 9,
    durationMinutes: 30,
    totalMinutesAtStage: 270,
    label: '4 sa 30 dk',
    category: 'warning',
    categoryLabel: 'Dikkat Sınırı (Turuncu)',
    bgClass: 'bg-orange-500/10 hover:bg-orange-500/20 text-orange-800 dark:text-orange-200',
    borderClass: 'border-orange-300 dark:border-orange-600',
    textClass: 'text-orange-700 dark:text-orange-300',
    activeBg: 'bg-orange-500 text-white',
    glowColor: 'rgba(249, 115, 22, 0.5)',
    hexColor: '#F97316',
  },
  {
    stageNumber: 10,
    durationMinutes: 30,
    totalMinutesAtStage: 300,
    label: '5 sa',
    category: 'warning',
    categoryLabel: 'Dikkat Sınırı (Turuncu)',
    bgClass: 'bg-orange-500/10 hover:bg-orange-500/20 text-orange-800 dark:text-orange-200',
    borderClass: 'border-orange-300 dark:border-orange-600',
    textClass: 'text-orange-700 dark:text-orange-300',
    activeBg: 'bg-orange-500 text-white',
    glowColor: 'rgba(249, 115, 22, 0.5)',
    hexColor: '#F97316',
  },
  {
    stageNumber: 11,
    durationMinutes: 30,
    totalMinutesAtStage: 330,
    label: '5 sa 30 dk',
    category: 'warning',
    categoryLabel: 'Dikkat Sınırı (Turuncu)',
    bgClass: 'bg-orange-500/10 hover:bg-orange-500/20 text-orange-800 dark:text-orange-200',
    borderClass: 'border-orange-300 dark:border-orange-600',
    textClass: 'text-orange-700 dark:text-orange-300',
    activeBg: 'bg-orange-500 text-white',
    glowColor: 'rgba(249, 115, 22, 0.5)',
    hexColor: '#F97316',
  },
  {
    stageNumber: 12,
    durationMinutes: 30,
    totalMinutesAtStage: 360,
    label: '6 sa',
    category: 'warning',
    categoryLabel: 'Dikkat Sınırı (Turuncu)',
    bgClass: 'bg-orange-600/10 hover:bg-orange-600/20 text-orange-800 dark:text-orange-200',
    borderClass: 'border-orange-400 dark:border-orange-600',
    textClass: 'text-orange-700 dark:text-orange-300',
    activeBg: 'bg-orange-600 text-white',
    glowColor: 'rgba(234, 88, 12, 0.55)',
    hexColor: '#EA580C',
  },
  {
    stageNumber: 13,
    durationMinutes: 30,
    totalMinutesAtStage: 390,
    label: '6 sa 30 dk',
    category: 'warning',
    categoryLabel: 'Dikkat Sınırı (Turuncu Son)',
    bgClass: 'bg-orange-700/10 hover:bg-orange-700/20 text-orange-900 dark:text-orange-100',
    borderClass: 'border-orange-500 dark:border-orange-700',
    textClass: 'text-orange-800 dark:text-orange-200',
    activeBg: 'bg-orange-700 text-white shadow-md shadow-orange-600/30',
    glowColor: 'rgba(194, 65, 12, 0.6)',
    hexColor: '#C2410C',
  },

  // 14: KIRMIZI SINIR (KIRMIZI / k.png)
  {
    stageNumber: 14,
    durationMinutes: 30,
    totalMinutesAtStage: 420,
    label: '7 sa',
    category: 'critical',
    categoryLabel: 'Kırmızı Sınır (Kritik Tavan!)',
    bgClass: 'bg-rose-950/20 hover:bg-rose-950/30 text-rose-950 dark:text-rose-100',
    borderClass: 'border-rose-600 dark:border-rose-900',
    textClass: 'text-rose-800 dark:text-rose-200',
    activeBg: 'bg-red-600 text-white shadow-xl shadow-red-600/40',
    glowColor: 'rgba(220, 38, 38, 0.75)',
    hexColor: '#DC2626',
  },
];

export function getStageMascot(stageCount: number): string {
  if (stageCount >= 14) return '/k.png';
  if (stageCount >= 9) return '/t.png';
  if (stageCount >= 5) return '/s.png';
  return '/y.png';
}

export function getStageCategory(stageCount: number): {
  label: string;
  name: string;
  category: 'none' | 'safe' | 'moderate' | 'warning' | 'critical';
  colorClass: string;
  badgeBg: string;
  description: string;
  mascotImg: string;
} {
  if (stageCount === 0) {
    return {
      label: 'Henüz Kullanım Yok',
      name: 'Güvenli Alan',
      category: 'none',
      colorClass: 'text-emerald-600 dark:text-emerald-400',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
      description: 'Haftalık ekran süresi takibi sıfırlandı. 30 dk dolunca 1. kademeye dokunun.',
      mascotImg: '/y.png',
    };
  }
  if (stageCount <= 4) {
    return {
      label: 'Güvenli Alan (Yeşil)',
      name: 'Güvenli Alan',
      category: 'safe',
      colorClass: 'text-emerald-600 dark:text-emerald-400',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
      description: 'Harika gidiyorsunuz! Ekran süreniz güvenli yeşil alanda (1 - 4. Kademe).',
      mascotImg: '/y.png',
    };
  }
  if (stageCount <= 8) {
    return {
      label: 'Dengeli Süre (Sarı)',
      name: 'Dengeli Süre',
      category: 'moderate',
      colorClass: 'text-yellow-600 dark:text-yellow-400',
      badgeBg: 'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-300 dark:border-yellow-800',
      description: 'Sarı dengeli bölgedesiniz (5 - 8. Kademe). Molalar vermeyi ve süreyi dengede tutmayı unutmayın.',
      mascotImg: '/s.png',
    };
  }
  if (stageCount <= 13) {
    return {
      label: 'Dikkat Sınırı (Turuncu)',
      name: 'Dikkat Sınırı',
      category: 'warning',
      colorClass: 'text-orange-600 dark:text-orange-400',
      badgeBg: 'bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800',
      description: 'Turuncu dikkat sınırındasınız (9 - 13. Kademe)! Ekran süresini azaltıp gözlerinizi dinlendirin.',
      mascotImg: '/t.png',
    };
  }
  return {
    label: 'Kırmızı Sınır (Kritik Tavan!)',
    name: 'Kırmızı Sınır',
    category: 'critical',
    colorClass: 'text-red-600 dark:text-red-400',
    badgeBg: 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800',
    description: '14. Kademe kırmızı tavanına ulaşıldı (7 saat)! Ekran süresi maksimum sınırda, mutlaka mola verin.',
    mascotImg: '/k.png',
  };
}
