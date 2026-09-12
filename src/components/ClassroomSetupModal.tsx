import React, { useState } from 'react';
import { UserProfile, ClassroomInfo } from '../types';
import { createClassroom, joinClassroomWithCode } from '../lib/firebase';
import {
  GraduationCap,
  Users,
  KeyRound,
  UserCheck,
  Sparkles,
  School,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Share2,
} from 'lucide-react';

interface ClassroomSetupModalProps {
  currentUser: UserProfile;
  onCompleted: () => void;
  onCancel?: () => void;
  canCancel?: boolean;
}

export const ClassroomSetupModal: React.FC<ClassroomSetupModalProps> = ({
  currentUser,
  onCompleted,
  onCancel,
  canCancel = false,
}) => {
  const [selectedRole, setSelectedRole] = useState<'teacher' | 'parent'>(
    currentUser.role === 'admin' || currentUser.role === 'teacher' ? 'teacher' : 'parent'
  );

  // Teacher fields
  const [className, setClassName] = useState(currentUser.className || '4-A Sınıfı');
  const [studentTargetCount, setStudentTargetCount] = useState<number>(25);

  // Parent fields
  const [classCode, setClassCode] = useState(currentUser.classCode || '');
  const [studentName, setStudentName] = useState(currentUser.studentName || '');
  const [parentName, setParentName] = useState(currentUser.parentName || currentUser.displayName || '');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) {
      setError('Lütfen bir sınıf adı girin (Örn: 4-A Sınıfı).');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await createClassroom(
        currentUser.uid,
        currentUser.displayName || 'Öğretmen',
        currentUser.email,
        className.trim(),
        studentTargetCount
      );
      setSuccessMsg('Sınıfınız başarıyla oluşturuldu! Şimdi 6 haneli kodunuzu velilerinizle paylaşabilirsiniz.');
      setTimeout(() => {
        onCompleted();
      }, 1200);
    } catch (err: any) {
      console.error('Create class error:', err);
      setError(err.message || 'Sınıf oluşturulurken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleParentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classCode.trim()) {
      setError('Lütfen öğretmeninizin verdiği 6 haneli sınıf kodunu girin.');
      return;
    }
    if (!studentName.trim()) {
      setError('Lütfen öğrencinizin adını ve soyadını girin.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const classroom = await joinClassroomWithCode(
        currentUser.uid,
        classCode.trim(),
        studentName.trim(),
        parentName.trim()
      );
      setSuccessMsg(`Tebrikler! "${classroom.name}" sınıfına başarıyla katıldınız.`);
      setTimeout(() => {
        onCompleted();
      }, 1200);
    } catch (err: any) {
      console.error('Join class error:', err);
      setError(err.message || 'Sınıfa katılırken bir hata oluştu. Kodu kontrol ediniz.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-2xs">
            <School className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Sınıf & Rol Seçimi
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Öğretmen sınıf oluşturup kod verir; 25 veli bu kod ile bağlanıp çocuklarının haftalık ekran sürelerini kaydeder.
          </p>
        </div>

        {/* Role Toggle Selector */}
        <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
          <button
            type="button"
            id="role-select-teacher"
            onClick={() => {
              setSelectedRole('teacher');
              setError(null);
            }}
            className={`flex flex-col items-center justify-center gap-1.5 py-3 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedRole === 'teacher'
                ? 'bg-white text-indigo-900 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <div className={`p-2 rounded-xl ${selectedRole === 'teacher' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-200 text-slate-500'}`}>
              <GraduationCap className="w-5 h-5" />
            </div>
            <span>Ben Öğretmenim</span>
            <span className="text-[10px] font-medium text-slate-500">(Sınıf Yöneticisi)</span>
          </button>

          <button
            type="button"
            id="role-select-parent"
            onClick={() => {
              setSelectedRole('parent');
              setError(null);
            }}
            className={`flex flex-col items-center justify-center gap-1.5 py-3 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedRole === 'parent'
                ? 'bg-white text-emerald-900 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <div className={`p-2 rounded-xl ${selectedRole === 'parent' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
              <Users className="w-5 h-5" />
            </div>
            <span>Ben Veliyim</span>
            <span className="text-[10px] font-medium text-slate-500">(Öğrenci Velisi)</span>
          </button>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form: Teacher Flow */}
        {selectedRole === 'teacher' && (
          <form onSubmit={handleTeacherSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">
                Sınıf Adı veya Şube:
              </label>
              <input
                type="text"
                id="input-class-name"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="Örn: 4-A Sınıfı, 2-B Şubesi..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">
                  Beklenen Öğrenci / Veli Sayısı:
                </label>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                  {studentTargetCount} Öğrenci
                </span>
              </div>
              <input
                type="number"
                id="input-student-target"
                min={1}
                max={60}
                value={studentTargetCount}
                onChange={(e) => setStudentTargetCount(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
              <p className="text-[11px] text-slate-500">
                Sınıf oluşturulduğunda sistem otomatik benzersiz 6 haneli kod üretecektir.
              </p>
            </div>

            <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-3.5 text-xs text-indigo-950 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-indigo-900">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Öğretmen Nasıl Takip Eder?
              </div>
              <p className="text-[11px] text-indigo-800 leading-relaxed">
                Oluşan 6 haneli kodu WhatsApp grubunda velilerinizle paylaşacaksınız. 25 veli giriş yaptıkça tüm öğrencilerin süreleri telefonunuzda canlı olarak belirecektir.
              </p>
            </div>

            <div className="pt-2 flex items-center gap-2">
              {canCancel && onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="btn-3d-white flex-1 py-3 px-4 rounded-2xl text-xs font-bold cursor-pointer"
                >
                  Vazgeç
                </button>
              )}
              <button
                type="submit"
                id="btn-create-class"
                disabled={loading}
                className="btn-3d-indigo flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs sm:text-sm font-black cursor-pointer disabled:opacity-60"
              >
                <span>{loading ? 'Oluşturuluyor...' : 'Sınıfı Oluştur ve Kodu Al'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* Form: Parent Flow */}
        {selectedRole === 'parent' && (
          <form onSubmit={handleParentSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                Öğretmenin Verdiği 6 Haneli Sınıf Kodu:
              </label>
              <input
                type="text"
                id="input-class-code"
                maxLength={8}
                value={classCode}
                onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                placeholder="Örn: ABC482"
                className="w-full px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-300 text-base font-mono uppercase tracking-widest text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-center font-black focus:bg-white"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">
                  Öğrencinin Adı Soyadı:
                </label>
                <input
                  type="text"
                  id="input-student-name"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Örn: Ali Yılmaz"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">
                  Veli Adı (İsteğe Bağlı):
                </label>
                <input
                  type="text"
                  id="input-parent-name"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder="Örn: Fatma Yılmaz"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-3.5 text-xs text-emerald-950 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                Veli Olarak Nasıl Kullanacaksınız?
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                Sınıfa bağlandıktan sonra çocuğunuzun haftalık ekran süresini 30'ar dakikalık butonlarla işaretleyeceksiniz. İşaretlediğiniz süreler öğretmenin ekranına anında yansıyacaktır.
              </p>
            </div>

            <div className="pt-2 flex items-center gap-2">
              {canCancel && onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="btn-3d-white flex-1 py-3 px-4 rounded-2xl text-xs font-bold cursor-pointer"
                >
                  Vazgeç
                </button>
              )}
              <button
                type="submit"
                id="btn-join-class"
                disabled={loading}
                className="btn-3d-emerald flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs sm:text-sm font-black cursor-pointer disabled:opacity-60"
              >
                <span>{loading ? 'Bağlanıyor...' : 'Sınıfa Katıl'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
