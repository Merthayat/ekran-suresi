import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import * as XLSX from 'xlsx';
import { db } from '../lib/firebase';
import { UserProfile, AcademicWeekConfig } from '../types';
import { formatMinutes } from '../lib/weekUtils';
import { getStageCategory } from '../lib/stagesData';
import {
  X,
  Search,
  Clock,
  Palmtree,
  BarChart3,
  AlertCircle,
  CheckCircle2,
  Printer,
  FileSpreadsheet,
} from 'lucide-react';

interface WeeklyStudentStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  weekConfig: AcademicWeekConfig | null;
  students: UserProfile[];
  isActiveWeek: boolean;
  activeWeekNumber?: number;
  classNameTitle?: string;
}

export const WeeklyStudentStatsModal: React.FC<WeeklyStudentStatsModalProps> = ({
  isOpen,
  onClose,
  weekConfig,
  students,
  isActiveWeek,
  activeWeekNumber = 1,
  classNameTitle = '2-C Sınıfı',
}) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'none' | 'green' | 'yellow' | 'orange' | 'red'>('all');
  const [pastRecords, setPastRecords] = useState<Record<string, { stage: number; minutes: number }>>({});
  const [loadingPast, setLoadingPast] = useState(false);

  // Filter out teacher records
  const studentList = students.filter((s) => s.role !== 'admin' && s.userType !== 'teacher');

  const weekNum = weekConfig?.weekNum ?? 1;
  const isFutureWeek = weekNum > activeWeekNumber;
  const isPastWeek = weekNum < activeWeekNumber;

  // Past week real record fetch from Firestore
  useEffect(() => {
    if (!isOpen || !isPastWeek || studentList.length === 0) {
      setPastRecords({});
      return;
    }

    let isMounted = true;
    setLoadingPast(true);

    async function fetchPastWeeks() {
      const records: Record<string, { stage: number; minutes: number }> = {};
      try {
        await Promise.all(
          studentList.map(async (st) => {
            try {
              const weeksCol = collection(db, 'users', st.uid, 'weeks');
              const q = query(weeksCol, where('weekNumber', '==', weekNum));
              const snap = await getDocs(q);
              if (!snap.empty) {
                const data = snap.docs[0].data();
                const stStage = Math.max(0, Math.min(14, Number(data.completedStages ?? 0)));
                records[st.uid] = {
                  stage: stStage,
                  minutes: stStage * 30,
                };
              }
            } catch (err) {
              console.warn(`Could not load week data for student ${st.uid}:`, err);
            }
          })
        );
        if (isMounted) {
          setPastRecords(records);
        }
      } catch (err) {
        console.error('Haftalık kayıtlar yüklenirken hata:', err);
      } finally {
        if (isMounted) {
          setLoadingPast(false);
        }
      }
    }

    fetchPastWeeks();
    return () => {
      isMounted = false;
    };
  }, [isOpen, isPastWeek, weekNum, studentList.length]);

  if (!isOpen || !weekConfig) return null;

  // Compute student stats for this week
  const studentStats = studentList.map((user, idx) => {
    let stage = 0;
    let minutes = 0;

    if (isActiveWeek) {
      // Aktif hafta: Canlı mevcut kademe
      stage = Math.max(0, Math.min(14, user.currentWeekStage || 0));
      minutes = stage * 30;
    } else if (isPastWeek) {
      // Geçmiş hafta: Firestore'da kaydedilmiş gerçek veri, yoksa 0
      const rec = pastRecords[user.uid];
      if (rec) {
        stage = rec.stage;
        minutes = rec.minutes;
      } else {
        stage = 0;
        minutes = 0;
      }
    } else {
      // Gelecek hafta (2. Hafta, 3. Hafta vb. henüz gelmedi/yaşanmadı):
      // Kesinlikle 0 dk ve kullanım yok
      stage = 0;
      minutes = 0;
    }

    const cat = getStageCategory(stage);
    const sName = user.studentName || user.displayName || `Öğrenci #${idx + 1}`;
    const pName = user.parentName || (user.displayName !== sName ? user.displayName : 'Veli');

    let badgeKey: 'none' | 'green' | 'yellow' | 'orange' | 'red' = 'none';
    let badgeLabel = 'Kullanım Yok';
    let badgeClass = 'bg-slate-100 text-slate-600 border border-slate-200';

    if (stage === 0) {
      badgeKey = 'none';
      badgeLabel = 'Kullanım Yok';
      badgeClass = 'bg-slate-100 text-slate-600 border border-slate-200';
    } else if (stage >= 14) {
      badgeKey = 'red';
      badgeLabel = 'Kırmızı Kutu';
      badgeClass = 'bg-rose-600 text-white font-black';
    } else if (stage >= 11) {
      badgeKey = 'orange';
      badgeLabel = 'Turuncu Kutu';
      badgeClass = 'bg-orange-500 text-white font-black';
    } else if (stage >= 8) {
      badgeKey = 'yellow';
      badgeLabel = 'Sarı Kutu';
      badgeClass = 'bg-yellow-500 text-slate-950 font-black';
    } else {
      badgeKey = 'green';
      badgeLabel = 'Yeşil Kutu';
      badgeClass = 'bg-emerald-500 text-white font-black';
    }

    return {
      uid: user.uid,
      studentName: sName,
      parentName: pName,
      stage,
      minutes,
      timeFormatted: formatMinutes(minutes),
      badgeKey,
      badgeLabel,
      badgeClass,
      mascotImg: cat.mascotImg,
    };
  });

  const totalMinutes = studentStats.reduce((sum, s) => sum + s.minutes, 0);
  const avgMinutes = studentStats.length > 0 ? Math.round(totalMinutes / studentStats.length) : 0;
  const avgFormatted = formatMinutes(avgMinutes);

  const noUsageCount = studentStats.filter((s) => s.stage === 0).length;
  const greenCount = studentStats.filter((s) => s.badgeKey === 'green').length;
  const yellowCount = studentStats.filter((s) => s.badgeKey === 'yellow').length;
  const orangeCount = studentStats.filter((s) => s.badgeKey === 'orange').length;
  const redCount = studentStats.filter((s) => s.badgeKey === 'red').length;

  const filteredStats = studentStats.filter((s) => {
    const matchName =
      s.studentName.toLowerCase().includes(search.toLowerCase()) ||
      s.parentName.toLowerCase().includes(search.toLowerCase());
    if (!matchName) return false;

    if (filter === 'all') return true;
    return s.badgeKey === filter;
  });

  // Export to Excel (.xlsx) handler
  const handleDownloadExcel = () => {
    const dateStr = new Date().toLocaleDateString('tr-TR');

    const wsData: (string | number)[][] = [
      ['HAFTALIK EKRAN SÜRESİ ÖĞRENCİ TAKİP ÇİZELGESİ'],
      [`${classNameTitle} • ${weekNum}. Hafta (${weekConfig.label})`],
      [],
      ['Tarih Aralığı:', `${weekConfig.startDate} - ${weekConfig.endDate}`, '', 'Rapor Tarihi:', dateStr],
      ['Toplam Öğrenci:', studentStats.length, '', 'Sınıf Ortalaması:', `${avgMinutes} dk (${avgFormatted.longStr})`],
      [],
      ['ÖZET KUTU DAĞILIMI:'],
      [
        `Kullanım Yok: ${noUsageCount}`,
        `Yeşil Kutu (0-210 dk / 1-7. Kademe): ${greenCount}`,
        `Sarı Kutu (240-300 dk / 8-10. Kademe): ${yellowCount}`,
        `Turuncu Kutu (330-390 dk / 11-13. Kademe): ${orangeCount}`,
        `Kırmızı Kutu (420+ dk / 14. Kademe): ${redCount}`,
      ],
      [],
      [
        'Sıra No',
        'Öğrenci Adı Soyadı',
        'Veli Adı',
        'Kademe',
        'Ekran Süresi (Dakika)',
        'Süre Formatı',
        'Kutu / Durum',
      ],
    ];

    studentStats.forEach((s, idx) => {
      wsData.push([
        idx + 1,
        s.studentName,
        s.parentName,
        s.stage > 0 ? `${s.stage}. Kademe` : '0. Kademe',
        s.minutes,
        s.timeFormatted.shortStr || `${s.minutes} dk`,
        s.badgeLabel,
      ]);
    });

    wsData.push([]);
    wsData.push(['GENEL TOPLAM', '', '', '', totalMinutes, `Ortalama: ${avgMinutes} dk`, '']);

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Set column widths
    ws['!cols'] = [
      { wch: 8 },  // Sıra No
      { wch: 26 }, // Öğrenci Adı Soyadı
      { wch: 22 }, // Veli Adı
      { wch: 14 }, // Kademe
      { wch: 20 }, // Ekran Süresi
      { wch: 16 }, // Süre Formatı
      { wch: 18 }, // Kutu / Durum
    ];

    XLSX.utils.book_append_sheet(wb, ws, `${weekNum}. Hafta`);

    const fileName = `${classNameTitle.replace(/\s+/g, '_')}_${weekNum}_Hafta_Ekran_Suresi.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  // Export / Print PDF handler
  const handlePrintPDF = () => {
    const dateStr = new Date().toLocaleDateString('tr-TR');

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="UTF-8">
        <title>${classNameTitle} - ${weekNum}. Hafta Ekran Süresi Çizelgesi</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 10mm 12mm;
          }
          * {
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            color: #0f172a;
            margin: 0;
            padding: 15px;
            font-size: 11px;
            line-height: 1.35;
            background: #ffffff;
          }
          .no-print-bar {
            text-align: center;
            margin-bottom: 16px;
            padding: 10px 14px;
            background: #eef2ff;
            border: 1px solid #c7d2fe;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .print-action-btn {
            background: #4338ca;
            color: #ffffff;
            padding: 8px 18px;
            border: none;
            border-radius: 8px;
            font-weight: 800;
            font-size: 12px;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .print-action-btn:hover {
            background: #3730a3;
          }
          .close-action-btn {
            background: #f1f5f9;
            color: #475569;
            padding: 8px 14px;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            font-weight: 700;
            font-size: 12px;
            cursor: pointer;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #1e293b;
            padding-bottom: 8px;
            margin-bottom: 12px;
          }
          .main-title {
            font-size: 16px;
            font-weight: 900;
            color: #0f172a;
            margin: 0 0 3px 0;
          }
          .sub-title {
            font-size: 12px;
            font-weight: 800;
            color: #3b82f6;
            margin: 0;
          }
          .meta-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 6px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 8px 10px;
            margin-bottom: 10px;
          }
          .meta-item {
            display: flex;
            flex-direction: column;
          }
          .meta-lbl {
            font-size: 9px;
            color: #64748b;
            font-weight: 700;
            text-transform: uppercase;
          }
          .meta-val {
            font-size: 11.5px;
            font-weight: 800;
            color: #0f172a;
          }
          .summary-strip {
            display: flex;
            gap: 6px;
            margin-bottom: 12px;
          }
          .sum-card {
            flex: 1;
            padding: 6px 4px;
            border-radius: 6px;
            text-align: center;
            font-size: 10px;
            font-weight: 800;
          }
          .sum-none   { background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }
          .sum-green  { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }
          .sum-yellow { background: #fefce8; color: #854d0e; border: 1px solid #fef08a; }
          .sum-orange { background: #fff7ed; color: #9a3412; border: 1px solid #fed7aa; }
          .sum-red    { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 18px;
          }
          th {
            background: #f1f5f9;
            color: #0f172a;
            font-size: 10px;
            font-weight: 800;
            text-align: left;
            padding: 5px 7px;
            border: 1px solid #cbd5e1;
          }
          td {
            padding: 4.5px 7px;
            border: 1px solid #e2e8f0;
            font-size: 10.5px;
          }
          tr:nth-child(even) {
            background-color: #f8fafc;
          }
          .badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 9px;
            font-weight: 800;
            text-align: center;
          }
          .badge-none   { background: #f1f5f9; color: #64748b; border: 1px solid #cbd5e1; }
          .badge-green  { background: #10b981; color: #ffffff; }
          .badge-yellow { background: #eab308; color: #0f172a; }
          .badge-orange { background: #f97316; color: #ffffff; }
          .badge-red    { background: #e11d48; color: #ffffff; }

          .signatures {
            display: flex;
            justify-content: space-between;
            margin-top: 24px;
            padding: 0 30px;
          }
          .sign-box {
            text-align: center;
            width: 180px;
            font-size: 11px;
            font-weight: 700;
            color: #334155;
          }
          .sign-line {
            margin-top: 36px;
            border-top: 1px solid #64748b;
            padding-top: 4px;
            font-size: 10px;
            color: #64748b;
          }
          @media print {
            .no-print-bar {
              display: none !important;
            }
            body {
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="no-print-bar">
          <div>
            <strong style="color: #312e81; font-size: 13px;">A4 Çıktı ve PDF Önizleme</strong>
            <p style="margin: 2px 0 0 0; font-size: 11px; color: #4338ca;">
              Yazıcı seçeneğinden <strong>"PDF Olarak Kaydet"</strong> seçerek bilgisayarınıza veya telefonunuza indirebilirsiniz.
            </p>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="print-action-btn" onclick="window.print()">🖨️ Yazdır / PDF Kaydet</button>
            <button class="close-action-btn" onclick="window.close()">✖ Kapat</button>
          </div>
        </div>

        <div class="header">
          <h1 class="main-title">HAFTALIK EKRAN SÜRESİ ÖĞRENCİ TAKİP ÇİZELGESİ</h1>
          <p class="sub-title">${classNameTitle} • ${weekNum}. Hafta (${weekConfig.label})</p>
        </div>

        <div class="meta-grid">
          <div class="meta-item">
            <span class="meta-lbl">Tarih Aralığı</span>
            <span class="meta-val">${weekConfig.startDate} - ${weekConfig.endDate}</span>
          </div>
          <div class="meta-item">
            <span class="meta-lbl">Toplam Öğrenci</span>
            <span class="meta-val">${studentStats.length} Öğrenci</span>
          </div>
          <div class="meta-item">
            <span class="meta-lbl">Sınıf Ortalaması</span>
            <span class="meta-val">${avgMinutes} dk (${avgFormatted.longStr})</span>
          </div>
          <div class="meta-item">
            <span class="meta-lbl">Rapor Tarihi</span>
            <span class="meta-val">${dateStr}</span>
          </div>
        </div>

        <div class="summary-strip">
          <div class="sum-card sum-none">Kullanım Yok: ${noUsageCount}</div>
          <div class="sum-card sum-green">Yeşil Kutu (1-7): ${greenCount}</div>
          <div class="sum-card sum-yellow">Sarı Kutu (8-10): ${yellowCount}</div>
          <div class="sum-card sum-orange">Turuncu (11-13): ${orangeCount}</div>
          <div class="sum-card sum-red">Kırmızı (14): ${redCount}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 32px; text-align: center;">No</th>
              <th>Öğrenci Adı Soyadı</th>
              <th>Veli Adı</th>
              <th style="width: 80px; text-align: center;">Kademe</th>
              <th style="width: 70px; text-align: right;">Süre</th>
              <th style="width: 100px; text-align: center;">Kutu Durumu</th>
            </tr>
          </thead>
          <tbody>
            ${studentStats
              .map(
                (s, i) => `
              <tr>
                <td style="text-align: center; font-weight: 700; color: #64748b;">${i + 1}</td>
                <td style="font-weight: 700;">${s.studentName}</td>
                <td style="color: #475569;">${s.parentName}</td>
                <td style="text-align: center; font-weight: 600;">${s.stage > 0 ? s.stage + '. Kademe' : '0. Kademe'}</td>
                <td style="text-align: right; font-weight: 800; color: ${s.minutes === 0 ? '#94a3b8' : '#0f172a'};">${s.minutes} dk</td>
                <td style="text-align: center;">
                  <span class="badge badge-${s.badgeKey}">${s.badgeLabel}</span>
                </td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>

        <div class="signatures">
          <div class="sign-box">
            <span>Sınıf Rehber Öğretmeni</span>
            <div class="sign-line">İmza</div>
          </div>
          <div class="sign-box">
            <span>Okul Müdürü</span>
            <div class="sign-line">İmza / Mühür</div>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 400);
          };
        </script>
      </body>
      </html>
    `;

    let printWindow: Window | null = null;
    try {
      printWindow = window.open('', '_blank', 'width=900,height=800');
    } catch {
      printWindow = null;
    }

    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    } else {
      // Fallback: iframe print
      const printIframe = document.createElement('iframe');
      printIframe.style.position = 'fixed';
      printIframe.style.right = '0';
      printIframe.style.bottom = '0';
      printIframe.style.width = '0';
      printIframe.style.height = '0';
      printIframe.style.border = '0';
      document.body.appendChild(printIframe);

      const frameDoc = printIframe.contentWindow?.document;
      if (frameDoc) {
        frameDoc.open();
        frameDoc.write(htmlContent);
        frameDoc.close();
        setTimeout(() => {
          printIframe.contentWindow?.focus();
          printIframe.contentWindow?.print();
          setTimeout(() => {
            document.body.removeChild(printIframe);
          }, 2000);
        }, 500);
      } else {
        window.print();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-sky-50/70 via-indigo-50/50 to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
              {weekNum}
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-sm sm:text-base font-black text-slate-900 leading-tight">
                  {weekNum}. Hafta Öğrenci İstatistikleri
                </h3>
                {isActiveWeek && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Aktif Hafta
                  </span>
                )}
                {isFutureWeek && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300">
                    Gelecek Hafta
                  </span>
                )}
                {isPastWeek && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                    Geçmiş Hafta
                  </span>
                )}
                {weekConfig.isHoliday && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
                    <Palmtree className="w-3 h-3" />
                    Tatil Haftası
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">
                {weekConfig.label} ({weekConfig.startDate} - {weekConfig.endDate})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bilgilendirme Bannerı (Eğer henüz başlamamış gelecek hafta ise) */}
        {isFutureWeek && (
          <div className="mx-4 mt-3 p-3 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-900 flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <p className="font-bold">Bu hafta henüz başlamamıştır.</p>
              <p className="text-amber-800/90 text-[11px] mt-0.5">
                Şu an aktif olan hafta <strong>{activeWeekNumber}. Hafta</strong>dır. {weekNum}. Hafta için henüz bir ekran süresi kaydı veya kullanımı bulunmamaktadır (0 dk).
              </p>
            </div>
          </div>
        )}

        {/* Haftalık Sınıf Özeti */}
        <div className="p-4 bg-slate-50/80 border-b border-slate-100 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              Sınıf Haftalık Ortalaması
            </span>
            <span className="text-xs font-black text-slate-900 bg-white px-2.5 py-1 rounded-xl border border-slate-200">
              {avgMinutes} dk ({avgFormatted.longStr})
            </span>
          </div>

          {/* Kategori Filtre Butonları */}
          <div className="grid grid-cols-5 gap-1 text-center">
            <button
              type="button"
              onClick={() => setFilter(filter === 'none' ? 'all' : 'none')}
              className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                filter === 'none'
                  ? 'bg-slate-200 border-slate-400 ring-2 ring-slate-300'
                  : 'bg-slate-100/90 border-slate-200 hover:bg-slate-200/70'
              }`}
            >
              <div className="text-[8.5px] font-bold text-slate-600 truncate">Kullanım Yok</div>
              <div className="text-xs font-black text-slate-800">{noUsageCount}</div>
            </button>

            <button
              type="button"
              onClick={() => setFilter(filter === 'green' ? 'all' : 'green')}
              className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                filter === 'green'
                  ? 'bg-emerald-100 border-emerald-400 ring-2 ring-emerald-300'
                  : 'bg-emerald-50/80 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <div className="text-[8.5px] font-bold text-emerald-800 truncate">Yeşil Kutu</div>
              <div className="text-xs font-black text-emerald-950">{greenCount}</div>
            </button>

            <button
              type="button"
              onClick={() => setFilter(filter === 'yellow' ? 'all' : 'yellow')}
              className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                filter === 'yellow'
                  ? 'bg-amber-100 border-amber-400 ring-2 ring-amber-300'
                  : 'bg-amber-50/80 border-amber-200 hover:bg-amber-100'
              }`}
            >
              <div className="text-[8.5px] font-bold text-amber-800 truncate">Sarı Kutu</div>
              <div className="text-xs font-black text-amber-950">{yellowCount}</div>
            </button>

            <button
              type="button"
              onClick={() => setFilter(filter === 'orange' ? 'all' : 'orange')}
              className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                filter === 'orange'
                  ? 'bg-orange-100 border-orange-400 ring-2 ring-orange-300'
                  : 'bg-orange-50/80 border-orange-200 hover:bg-orange-100'
              }`}
            >
              <div className="text-[8.5px] font-bold text-orange-800 truncate">Turuncu</div>
              <div className="text-xs font-black text-orange-950">{orangeCount}</div>
            </button>

            <button
              type="button"
              onClick={() => setFilter(filter === 'red' ? 'all' : 'red')}
              className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                filter === 'red'
                  ? 'bg-rose-100 border-rose-400 ring-2 ring-rose-300'
                  : 'bg-rose-50/80 border-rose-200 hover:bg-rose-100'
              }`}
            >
              <div className="text-[8.5px] font-bold text-rose-800 truncate">Kırmızı</div>
              <div className="text-xs font-black text-rose-950">{redCount}</div>
            </button>
          </div>
        </div>

        {/* Arama Kutusu */}
        <div className="p-3 border-b border-slate-100">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Öğrenci veya veli adı ara..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Öğrenci Listesi */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 divide-y divide-slate-100">
          {loadingPast ? (
            <div className="text-center py-8 text-xs text-slate-500 flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <span>Geçmiş hafta kayıtları yükleniyor...</span>
            </div>
          ) : filteredStats.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              Bu kritere uygun öğrenci kaydı bulunamadı.
            </div>
          ) : (
            filteredStats.map((item) => (
              <div
                key={item.uid}
                className="pt-2 first:pt-0 flex items-center justify-between gap-2.5"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl overflow-hidden bg-slate-50 border border-slate-200 flex-shrink-0 flex items-center justify-center">
                    <img
                      src={item.mascotImg}
                      alt="Maskot"
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-black text-slate-900 truncate">
                        {item.studentName}
                      </span>
                      <span className={`text-[8px] px-1.5 py-0.5 rounded-md ${item.badgeClass}`}>
                        {item.badgeLabel}
                      </span>
                    </div>
                    <span className="text-[10px] font-medium text-slate-500 block truncate">
                      Veli: {item.parentName}
                    </span>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span
                    className={`text-xs font-black block ${
                      item.minutes === 0 ? 'text-slate-400' : 'text-slate-900'
                    }`}
                  >
                    {item.minutes} dk
                  </span>
                  <span className="text-[9.5px] font-bold text-slate-500">
                    {item.stage > 0 ? `${item.stage}. Kademe` : '0. Kademe'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-2 flex-wrap">
          {/* Çıktı Alma Butonları (Kapat butonunun solunda) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={handlePrintPDF}
              title="A4 formatında yazdır veya PDF olarak kaydet"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer transition-all active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>PDF / Yazdır</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadExcel}
              title="Excel formatında (.xlsx) tablo olarak indir"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer transition-all active:scale-95"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Excel (.xlsx)</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn-3d-cyan px-4 py-1.5 rounded-xl text-xs font-black cursor-pointer flex-shrink-0 ml-auto"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
