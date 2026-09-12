import React, { useState } from 'react';
import { signInWithGoogle, signInAsGuest } from '../lib/firebase';
import {
  AlertCircle,
  Loader2,
  X,
  ShieldCheck,
  Clock,
  School,
  Check,
} from 'lucide-react';

interface AuthScreenProps {
  onSuccess?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = () => {
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Giriş yapılıyor...');
  const [error, setError] = useState<string | null>(null);
  const [promptWarning, setPromptWarning] = useState(false);

  // Remember previously chosen role from localStorage if any
  const [selectedRole, setSelectedRole] = useState<'teacher' | 'parent' | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('pendingUserRole');
      if (stored === 'teacher' || stored === 'parent') return stored;
    }
    return null;
  });

  const handleSelectRole = (role: 'teacher' | 'parent') => {
    setSelectedRole(role);
    setPromptWarning(false);
    setError(null);
    localStorage.setItem('pendingUserRole', role);
  };

  const handleGoogleLogin = async () => {
    if (!selectedRole) {
      setPromptWarning(true);
      setError('Lütfen önce yukarıdaki Öğretmen veya Veli butonuna dokunarak rolünüzü seçin.');
      return;
    }

    try {
      setLoading(true);
      setLoadingText(
        selectedRole === 'teacher'
          ? 'Öğretmen olarak Google ile giriş yapılıyor...'
          : 'Veli olarak Google ile giriş yapılıyor...'
      );
      setError(null);
      setPromptWarning(false);
      localStorage.setItem('pendingUserRole', selectedRole);
      const user = await signInWithGoogle();
      if (!user) {
        // User closed or dismissed the popup
        return;
      }
    } catch (err: any) {
      if (
        err?.code === 'auth/popup-closed-by-user' ||
        err?.code === 'auth/cancelled-popup-request' ||
        err?.message?.includes('popup-closed-by-user')
      ) {
        console.info('Google Sign-in popup was dismissed by user.');
        return;
      }
      console.error('Google Sign-in failed:', err);
      if (err.code === 'auth/popup-blocked') {
        setError('Tarayıcınız Google giriş penceresini engelledi. Lütfen açılır pencerelere izin verin veya Test Girişi butonuna dokunun.');
      } else {
        setError(err.message || 'Google ile giriş yapılırken bir sorun oluştu.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuestTestLogin = async () => {
    try {
      setLoading(true);
      const role = selectedRole || 'teacher';
      setLoadingText(`${role === 'teacher' ? 'Öğretmen' : 'Veli'} test girişi yapılıyor...`);
      setError(null);
      localStorage.setItem('pendingUserRole', role);
      if (role === 'teacher') {
        await signInAsGuest('Olcayto (Öğretmen - Yönetici)');
      } else {
        await signInAsGuest('Fatma Yılmaz (Öğrenci: Ali Yılmaz)');
      }
    } catch (err: any) {
      setError(err.message || 'Giriş yapılamadı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen max-h-screen w-full flex flex-col items-center justify-center p-2 bg-[#767694] relative overflow-hidden select-none">
      {/* Background soft ambient glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#6b6b88] via-[#757593] to-[#585872] pointer-events-none" />

      {/* Main Container constrained to exact giris.png aspect ratio & fits viewport */}
      <div className="relative z-10 w-full max-w-[390px] sm:max-w-[430px] aspect-[1536/2752] max-h-[96vh] flex items-center justify-center">
        {/* The Base Design Image: giris.png */}
        <img
          src="/giris.png"
          alt="Giriş Ekranı"
          className="w-full h-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.35)] rounded-[2rem] pointer-events-none"
          draggable={false}
          referrerPolicy="no-referrer"
        />

        {/* 1. ÖĞRETMEN GİRİŞİ BUTONU (Sol Üst Kart Butonu)
            Exact Coordinates on giris.png:
            Top: 51.0%, Left: 13.5%, Width: 34.0%, Height: 18.3% */}
        <button
          type="button"
          id="btn-login-teacher"
          onClick={() => handleSelectRole('teacher')}
          disabled={loading}
          className={`absolute z-20 cursor-pointer rounded-2xl sm:rounded-3xl transition-all duration-200 active:scale-95 focus:outline-hidden ${
            selectedRole === 'teacher'
              ? 'ring-4 ring-indigo-500 bg-indigo-600/15 border-2 border-indigo-400 shadow-[0_0_25px_rgba(99,102,241,0.65)]'
              : promptWarning && !selectedRole
              ? 'ring-4 ring-amber-400 animate-pulse bg-amber-400/10'
              : 'hover:bg-black/5'
          }`}
          style={{
            top: '51.0%',
            left: '13.5%',
            width: '34.0%',
            height: '18.3%',
          }}
          title="Öğretmen Rolünü Seç"
          aria-label="Öğretmen Girişi"
        >
          {selectedRole === 'teacher' && (
            <div className="absolute top-2 right-2 bg-indigo-600 text-white px-2 py-0.5 rounded-full text-[9px] font-black flex items-center gap-1 shadow-md animate-in zoom-in-75">
              <Check className="w-3 h-3 stroke-[3]" />
              <span>Seçildi</span>
            </div>
          )}
          <span className="sr-only">Öğretmen Girişi</span>
        </button>

        {/* 2. VELİ GİRİŞİ BUTONU (Sağ Üst Kart Butonu)
            Exact Coordinates on giris.png:
            Top: 51.0%, Left: 52.5%, Width: 34.0%, Height: 18.3% */}
        <button
          type="button"
          id="btn-login-parent"
          onClick={() => handleSelectRole('parent')}
          disabled={loading}
          className={`absolute z-20 cursor-pointer rounded-2xl sm:rounded-3xl transition-all duration-200 active:scale-95 focus:outline-hidden ${
            selectedRole === 'parent'
              ? 'ring-4 ring-emerald-500 bg-emerald-600/15 border-2 border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.65)]'
              : promptWarning && !selectedRole
              ? 'ring-4 ring-amber-400 animate-pulse bg-amber-400/10'
              : 'hover:bg-black/5'
          }`}
          style={{
            top: '51.0%',
            left: '52.5%',
            width: '34.0%',
            height: '18.3%',
          }}
          title="Veli Rolünü Seç"
          aria-label="Veli Girişi"
        >
          {selectedRole === 'parent' && (
            <div className="absolute top-2 right-2 bg-emerald-600 text-white px-2 py-0.5 rounded-full text-[9px] font-black flex items-center gap-1 shadow-md animate-in zoom-in-75">
              <Check className="w-3 h-3 stroke-[3]" />
              <span>Seçildi</span>
            </div>
          )}
          <span className="sr-only">Veli Girişi</span>
        </button>

        {/* 3. GOOGLE İLE GİRİŞ YAP BUTONU (Alt Hap Buton)
            Exact Coordinates on giris.png:
            Top: 71.4%, Left: 13.5%, Width: 73.0%, Height: 7.6% */}
        <button
          type="button"
          id="btn-login-google"
          onClick={handleGoogleLogin}
          disabled={loading}
          className={`absolute z-20 cursor-pointer rounded-full transition-all duration-200 active:scale-98 focus:outline-hidden ${
            selectedRole
              ? 'ring-4 ring-sky-400 shadow-[0_0_25px_rgba(56,189,248,0.7)] bg-sky-500/15'
              : 'hover:bg-black/5'
          }`}
          style={{
            top: '71.4%',
            left: '13.5%',
            width: '73.0%',
            height: '7.6%',
          }}
          title={
            selectedRole
              ? `Google ile (${selectedRole === 'teacher' ? 'Öğretmen' : 'Veli'}) Girişi Yap`
              : 'Önce yukarıdan Öğretmen veya Veli seçin'
          }
          aria-label="Google ile Giriş Yap"
        >
          <span className="sr-only">Google ile giriş yap</span>
        </button>

        {/* 4. Alt Boşluktaki Bilgilendirme Alanı (Aşağı kayma yapmaz, kartın alt içine tam sığar)
            Top: 80.0% to 95.0%, Left: 13.0%, Width: 74.0% */}
        <div
          className="absolute z-20 pointer-events-none flex flex-col items-center justify-center text-center px-1.5"
          style={{
            top: '80.0%',
            left: '13.0%',
            width: '74.0%',
            height: '15.5%',
          }}
        >
          {/* 3 Küçük Bilgi Kartı - buton.png çerçeveleri ile */}
          <div className="grid grid-cols-3 gap-1.5 w-full mb-1">
            <div className="relative aspect-[1264/848] w-full flex items-center justify-center select-none">
              <img
                src="/buton.png"
                alt="14 Kademe"
                className="absolute inset-0 w-full h-full object-contain pointer-events-none drop-shadow-xs"
                draggable={false}
                referrerPolicy="no-referrer"
              />
              <div className="relative z-10 flex flex-col items-center justify-center text-center px-1">
                <Clock className="w-3 h-3 text-emerald-700 mb-0.5" />
                <span className="text-[8px] sm:text-[9px] font-black text-slate-800 leading-tight">14 Kademe</span>
                <span className="text-[6.5px] sm:text-[7px] font-bold text-slate-600">30 dk Adım</span>
              </div>
            </div>

            <div className="relative aspect-[1264/848] w-full flex items-center justify-center select-none">
              <img
                src="/buton.png"
                alt="Canlı Sınıf"
                className="absolute inset-0 w-full h-full object-contain pointer-events-none drop-shadow-xs"
                draggable={false}
                referrerPolicy="no-referrer"
              />
              <div className="relative z-10 flex flex-col items-center justify-center text-center px-1">
                <School className="w-3 h-3 text-indigo-700 mb-0.5" />
                <span className="text-[8px] sm:text-[9px] font-black text-slate-800 leading-tight">Canlı Sınıf</span>
                <span className="text-[6.5px] sm:text-[7px] font-bold text-slate-600">Veli Takibi</span>
              </div>
            </div>

            <div className="relative aspect-[1264/848] w-full flex items-center justify-center select-none">
              <img
                src="/buton.png"
                alt="Dengeli Süre"
                className="absolute inset-0 w-full h-full object-contain pointer-events-none drop-shadow-xs"
                draggable={false}
                referrerPolicy="no-referrer"
              />
              <div className="relative z-10 flex flex-col items-center justify-center text-center px-1">
                <ShieldCheck className="w-3 h-3 text-amber-700 mb-0.5" />
                <span className="text-[8px] sm:text-[9px] font-black text-slate-800 leading-tight">Dengeli Süre</span>
                <span className="text-[6.5px] sm:text-[7px] font-bold text-slate-600">4 Renk Alanı</span>
              </div>
            </div>
          </div>

          {/* Kısa Açıklama */}
          <p className="text-[8px] sm:text-[9px] font-bold text-slate-600 leading-tight mt-0.5">
            {selectedRole
              ? `Seçilen Rol: ${selectedRole === 'teacher' ? 'Öğretmen' : 'Veli'} • Giriş yapmak için Google butonuna dokunun.`
              : 'Önce Öğretmen veya Veli butonuna dokunun, ardından Google ile giriş yapın.'}
          </p>
        </div>

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 z-40 bg-slate-900/40 backdrop-blur-xs rounded-[2rem] flex flex-col items-center justify-center gap-3 p-4">
            <div className="bg-white/95 rounded-2xl p-5 shadow-2xl flex flex-col items-center gap-2.5 max-w-[260px] text-center border border-slate-100">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              <p className="text-xs font-bold text-slate-800">{loadingText}</p>
            </div>
          </div>
        )}

        {/* Error / Prompt Notification */}
        {error && (
          <div className="absolute top-4 left-4 right-4 z-50 bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-2xl shadow-lg flex flex-col gap-2 text-xs animate-in fade-in slide-in-from-top-2">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 text-left leading-snug">{error}</div>
              <button
                type="button"
                onClick={() => setError(null)}
                className="text-rose-500 hover:text-rose-700 p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Test Login fallback if popup was blocked */}
            <div className="pt-1 border-t border-rose-200/80 flex justify-end">
              <button
                type="button"
                onClick={handleGuestTestLogin}
                className="text-[11px] font-black text-indigo-700 hover:underline cursor-pointer"
              >
                Test Olarak Doğrudan Giriş Yap ({selectedRole === 'parent' ? 'Veli' : 'Öğretmen'}) →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
