import React, { useState, useEffect } from 'react';
import {
  Calendar,
  X,
  Check,
  Palmtree,
  BookOpen,
  Sparkles,
  Save,
  RotateCcw,
  AlertCircle,
  Clock,
  ChevronRight,
  Info,
} from 'lucide-react';
import { AcademicCalendarConfig, AcademicWeekConfig } from '../types';
import {
  formatDateRangeLabel,
  generateDefaultAcademicCalendar,
  saveAcademicCalendar,
  toDateInputValue,
} from '../lib/academicCalendar';

interface AcademicCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  calendarConfig: AcademicCalendarConfig;
  userEmail?: string;
}

export const AcademicCalendarModal: React.FC<AcademicCalendarModalProps> = ({
  isOpen,
  onClose,
  calendarConfig,
  userEmail,
}) => {
  const [weeks, setWeeks] = useState<AcademicWeekConfig[]>([]);
  const [schoolStartDate, setSchoolStartDate] = useState<string>('2026-09-07');
  const [filterType, setFilterType] = useState<'all' | 'holidays' | 'school'>('all');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (calendarConfig?.weeks) {
      setWeeks(JSON.parse(JSON.stringify(calendarConfig.weeks)));
      setSchoolStartDate(calendarConfig.schoolStartDate || '2026-09-07');
    }
  }, [calendarConfig, isOpen]);

  if (!isOpen) return null;

  const handleStartDateChange = (weekIndex: number, newStart: string) => {
    setWeeks((prev) => {
      const next = [...prev];
      const target = { ...next[weekIndex], startDate: newStart };
      // Auto adjust end date to +6 days if possible
      if (newStart) {
        const [y, m, d] = newStart.split('-').map(Number);
        const startD = new Date(y, m - 1, d);
        const endD = new Date(startD);
        endD.setDate(startD.getDate() + 6);
        target.endDate = toDateInputValue(endD);
      }
      target.label = formatDateRangeLabel(target.startDate, target.endDate);
      next[weekIndex] = target;
      return next;
    });
  };

  const handleEndDateChange = (weekIndex: number, newEnd: string) => {
    setWeeks((prev) => {
      const next = [...prev];
      const target = { ...next[weekIndex], endDate: newEnd };
      target.label = formatDateRangeLabel(target.startDate, target.endDate);
      next[weekIndex] = target;
      return next;
    });
  };

  const handleToggleHoliday = (weekIndex: number) => {
    setWeeks((prev) => {
      const next = [...prev];
      const target = { ...next[weekIndex] };
      target.isHoliday = !target.isHoliday;
      if (target.isHoliday && !target.holidayName) {
        target.holidayName = 'Ara Tatil';
      }
      next[weekIndex] = target;
      return next;
    });
  };

  const handleHolidayNameChange = (weekIndex: number, name: string) => {
    setWeeks((prev) => {
      const next = [...prev];
      next[weekIndex] = { ...next[weekIndex], holidayName: name };
      return next;
    });
  };

  const handleAutoGenerate = () => {
    if (!schoolStartDate) return;
    const generated = generateDefaultAcademicCalendar(schoolStartDate);
    setWeeks(generated.weeks);
  };

  const handleResetDefaults = () => {
    const defaultConf = generateDefaultAcademicCalendar('2026-09-07');
    setWeeks(defaultConf.weeks);
    setSchoolStartDate('2026-09-07');
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMsg(null);
    setSaveSuccess(false);

    try {
      await saveAcademicCalendar(
        {
          schoolStartDate,
          weeks,
        },
        userEmail
      );
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error('Error saving calendar:', err);
      setErrorMsg(err.message || 'Takvim kaydedilirken bir hata oluştu.');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredWeeks = weeks.filter((w) => {
    if (filterType === 'holidays') return w.isHoliday;
    if (filterType === 'school') return !w.isHoliday;
    return true;
  });

  const holidayCount = weeks.filter((w) => w.isHoliday).length;
  const schoolWeekCount = weeks.length - holidayCount;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-sky-600 via-indigo-600 to-indigo-700 text-white p-4 sm:p-5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
              <Calendar className="w-5 h-5 text-sky-200" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black leading-tight flex items-center gap-2">
                <span>Akademik Takvim & Hafta Tarihleri</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">
                  Öğretmen
                </span>
              </h2>
              <p className="text-xs text-sky-100/90 font-medium mt-0.5">
                35 haftanın tarihlerini ve tatil dönemlerini belirleyin
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-colors text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Batch Generator Controls */}
        <div className="p-3 sm:p-4 bg-slate-50 border-b border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-sky-600" />
              <span>Okul Başlangıç (Pazartesi):</span>
            </label>
            <input
              type="date"
              value={schoolStartDate}
              onChange={(e) => setSchoolStartDate(e.target.value)}
              className="text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-sky-500 shadow-2xs"
            />
            <button
              type="button"
              onClick={handleAutoGenerate}
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-[#0077b6] hover:bg-[#00b4d8] text-white transition-all shadow-2xs flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-sky-200" />
              <span>Otomatik Tarihlendir</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleResetDefaults}
            className="text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 self-end sm:self-auto py-1 px-2 rounded-lg hover:bg-slate-200/60 transition-colors"
            title="Önerilen MEB takvimine sıfırla"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Varsayılana Dön</span>
          </button>
        </div>

        {/* Filter Pills & Summary */}
        <div className="px-4 py-2 bg-white border-b border-slate-200/80 flex items-center justify-between gap-2 flex-wrap text-xs flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-xl font-bold transition-all ${
                filterType === 'all'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tümü ({weeks.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('holidays')}
              className={`px-3 py-1 rounded-xl font-bold transition-all flex items-center gap-1 ${
                filterType === 'holidays'
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
              }`}
            >
              <Palmtree className="w-3 h-3" />
              <span>Tatiller ({holidayCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterType('school')}
              className={`px-3 py-1 rounded-xl font-bold transition-all flex items-center gap-1 ${
                filterType === 'school'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              <BookOpen className="w-3 h-3" />
              <span>Eğitim Haftaları ({schoolWeekCount})</span>
            </button>
          </div>

          <span className="text-[11px] font-semibold text-slate-500">
            Tarihleri doğrudan kutulardan değiştirebilirsiniz
          </span>
        </div>

        {/* Weeks Editor Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5">
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {filteredWeeks.map((week) => {
            const originalIndex = weeks.findIndex((w) => w.weekNum === week.weekNum);

            return (
              <div
                key={week.weekNum}
                className={`p-3 rounded-2xl border transition-all ${
                  week.isHoliday
                    ? 'bg-purple-50/70 border-purple-200 shadow-2xs'
                    : 'bg-white border-slate-200/90 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  {/* Left: Week ID & Label */}
                  <div className="flex items-center gap-2.5 min-w-[130px]">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shadow-2xs flex-shrink-0 ${
                        week.isHoliday
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-800 text-white'
                      }`}
                    >
                      {week.weekNum}
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                        <span>{week.weekNum}. Hafta</span>
                        {week.isHoliday && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-purple-200 text-purple-800">
                            Tatil
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-bold text-slate-500 mt-0.5">
                        {week.label || 'Tarih belirlenmedi'}
                      </div>
                    </div>
                  </div>

                  {/* Center: Date Inputs */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-bold text-slate-400">Başlangıç:</span>
                      <input
                        type="date"
                        value={week.startDate}
                        onChange={(e) => handleStartDateChange(originalIndex, e.target.value)}
                        className="text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-xl px-2 py-1 focus:ring-2 focus:ring-sky-500 focus:outline-hidden shadow-2xs"
                      />
                    </div>
                    <span className="text-slate-300">-</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-bold text-slate-400">Bitiş:</span>
                      <input
                        type="date"
                        value={week.endDate}
                        onChange={(e) => handleEndDateChange(originalIndex, e.target.value)}
                        className="text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-xl px-2 py-1 focus:ring-2 focus:ring-sky-500 focus:outline-hidden shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Right: Holiday Toggle & Holiday Name */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleToggleHoliday(originalIndex)}
                      className={`text-xs font-bold px-2.5 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 ${
                        week.isHoliday
                          ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                          : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      <Palmtree className="w-3.5 h-3.5" />
                      <span>{week.isHoliday ? 'Tatil Haftası' : 'Okul Haftası'}</span>
                    </button>

                    {week.isHoliday && (
                      <input
                        type="text"
                        placeholder="Tatil Adı (örn: Ara Tatil)"
                        value={week.holidayName || ''}
                        onChange={(e) => handleHolidayNameChange(originalIndex, e.target.value)}
                        className="text-xs font-bold text-purple-900 bg-white border border-purple-300 rounded-xl px-2.5 py-1.5 focus:ring-2 focus:ring-purple-500 focus:outline-hidden w-32 shadow-2xs placeholder:text-purple-300"
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer with Save Button */}
        <div className="p-4 bg-slate-50 border-t border-slate-200/90 flex items-center justify-between gap-3 flex-shrink-0">
          <div className="text-xs text-slate-500 font-medium hidden sm:block">
            Değişiklikleri kaydettiğinizde tüm veli ve öğrenciler takvimi anında güncel görür.
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-bold px-4 py-2.5 rounded-2xl border border-slate-300 text-slate-700 hover:bg-slate-200/70 transition-colors"
            >
              Vazgeç
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className={`text-xs font-black px-5 py-2.5 rounded-2xl text-white shadow-md transition-all flex items-center gap-2 ${
                saveSuccess
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-[#0077b6] hover:bg-[#00b4d8] shadow-[#03045e]/25 active:scale-95'
              }`}
            >
              {isSaving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Kaydediliyor...</span>
                </>
              ) : saveSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Kaydedildi!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Takvimi Kaydet</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
