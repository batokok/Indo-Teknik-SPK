import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../store/AppContext';
import { Role } from '../types';
import { 
  ChevronRight, ChevronLeft, Sparkles, X, 
  ClipboardList, Play, Sliders, CheckCircle2, BarChart3, 
  Settings, ShieldAlert, BookOpen, Compass, Database, FileSpreadsheet
} from 'lucide-react';

interface TourStep {
  title: string;
  description: string;
  highlightText: string;
  icon: React.ReactNode;
  selector: string;
  mobileTip?: string;
}

export const RoleOnboardingTutorial: React.FC = () => {
  const { currentUser, updateUser, addNotification } = useApp();
  const [currentStep, setCurrentStep] = useState(0);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  // Update window size on resize/scroll
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize, true);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize, true);
    };
  }, []);

  const role = currentUser?.role || 'SA';

  // Custom step lists depending on user role
  const getStepsForRole = (userRole: Role): TourStep[] => {
    switch (userRole) {
      case 'SA':
        return [
          {
            title: "Profil & Status Service Advisor",
            description: "Ini adalah profil Anda sebagai Service Advisor. Di sini Anda bisa memantau jam aktif serta mengakses ulang panduan sistem interaktif kapan saja.",
            icon: <Compass className="w-8 h-8 text-blue-400" />,
            highlightText: "Identitas Layanan",
            selector: "#user-profile",
            mobileTip: "Buka menu samping ☰ di pojok kiri atas untuk melihat profil Anda."
          },
          {
            title: "Menu Utama & Navigasi",
            description: "Gunakan menu navigasi samping ini untuk beralih ke modul Kelola Konsumen, Analitik KPI, serta Buku Servis & Arsip Unit.",
            icon: <Sliders className="w-8 h-8 text-purple-400" />,
            highlightText: "Navigasi Cepat",
            selector: "#sidebar-navigation",
            mobileTip: "Akses seluruh fitur dari menu samping ☰."
          },
          {
            title: "Wizard Registrasi Unit Masuk",
            description: "Gunakan wizard formulir ini untuk meregistrasikan unit pelanggan baru, mendata keluhan konsumen, mengecek inventaris fisik, dan menyimpan visual kondisi fisik sparepart.",
            icon: <ClipboardList className="w-8 h-8 text-emerald-400" />,
            highlightText: "Check-in Kendaraan",
            selector: "#intake-form-header",
            mobileTip: "Gulir ke bawah untuk mengisi formulir registrasi unit baru."
          },
          {
            title: "Pencarian SPK & Filter Status",
            description: "Cari data SPK aktif secara instan berdasarkan nama pelanggan, plat nomor, atau ID SPK, serta saring antrean berdasarkan prioritas (Urgent, Booking, Regular).",
            icon: <Sparkles className="w-8 h-8 text-amber-400" />,
            highlightText: "Penyaringan Data",
            selector: "#wo-search-input"
          },
          {
            title: "Tabel Antrean & Kontrol SPK",
            description: "Di sini Anda dapat melacak status perbaikan real-time, memperbarui tahapan kerja, serta mencetak SPK fisik atau mengarsipkan pekerjaan yang selesai.",
            icon: <BookOpen className="w-8 h-8 text-cyan-400" />,
            highlightText: "Monitoring Antrean",
            selector: "#wo-list-container"
          }
        ];

      case 'MECHANIC':
        return [
          {
            title: "Identitas Teknisi Lab",
            description: "Sebagai Mekanik Fuel Pump, profil Anda terekam otomatis dalam database pusat untuk pelacakan efisiensi & bonus KPI kerja.",
            icon: <Play className="w-8 h-8 text-blue-400" />,
            highlightText: "Profil Teknisi",
            selector: "#user-profile",
            mobileTip: "Buka menu samping ☰ untuk memantau status profil Anda."
          },
          {
            title: "Antrean SPK Laboratorium",
            description: "Semua antrean pengerjaan komponen yang ditugaskan ke Anda akan muncul di sini. Pilih salah satu SPK untuk mulai memuat ruang kerja steril Anda.",
            icon: <ClipboardList className="w-8 h-8 text-emerald-400" />,
            highlightText: "Queue Pekerjaan",
            selector: "#mechanic-queue"
          },
          {
            title: "Timer Produksi Real-time",
            description: "Setelah memuat SPK, tekan tombol 'Mulai Kerja' (Play) di panel ini. Sistem akan menghitung durasi pengerjaan Anda secara presisi.",
            icon: <Sliders className="w-8 h-8 text-purple-400" />,
            highlightText: "Perekaman Waktu",
            selector: "#mechanic-timer-action"
          },
          {
            title: "Database Spesifikasi Pompa",
            description: "Gunakan panel spesifikasi di sini. Masukkan nomor seri (P/N) ITech/Denso untuk menampilkan standar tekanan bar, toleransi volume, dan backleak.",
            icon: <Database className="w-8 h-8 text-amber-400" />,
            highlightText: "Standar Kalibrasi",
            selector: "#specs-db-panel"
          },
          {
            title: "Log Temuan & Suku Cadang",
            description: "Catat setiap temuan kerusakan fisik (misal: nozzle aus, valve baret) di log ini agar tersinkronisasi otomatis dengan laporan garansi akhir.",
            icon: <FileSpreadsheet className="w-8 h-8 text-cyan-400" />,
            highlightText: "Laporan Tindakan",
            selector: "#parts-log-panel"
          }
        ];

      case 'COMMON_RAIL':
        return [
          {
            title: "Profil Mekanik Common Rail",
            description: "Selamat datang di lab pengujian injector! Profil Anda mencerminkan keahlian kalibrasi presisi tinggi Anda.",
            icon: <Compass className="w-8 h-8 text-blue-400" />,
            highlightText: "Profil Spesialis",
            selector: "#user-profile",
            mobileTip: "Buka menu samping ☰ untuk melihat profil Anda."
          },
          {
            title: "Antrean Uji Kalibrasi Injector",
            description: "Daftar injector yang didelegasikan ke divisi Common Rail Anda ditampilkan lengkap di sini. Pilih SPK untuk memuat parameter uji.",
            icon: <ClipboardList className="w-8 h-8 text-emerald-400" />,
            highlightText: "Queue Kalibrasi",
            selector: "#mechanic-queue"
          },
          {
            title: "Timer Pengujian Test Bench",
            description: "Klik tombol 'Mulai Pengujian' di panel kontrol ini untuk mencatat durasi kalibrasi presisi pada Test Bench laboratorium.",
            icon: <Sliders className="w-8 h-8 text-purple-400" />,
            highlightText: "Perekaman Timer",
            selector: "#mechanic-timer-action"
          },
          {
            title: "Database Standard Injector",
            description: "Cari standard volume semprotan utama (cc) dan debit backleak berdasarkan P/N injector langsung dari database resmi.",
            icon: <Database className="w-8 h-8 text-amber-400" />,
            highlightText: "Standard Teknis",
            selector: "#specs-db-panel"
          },
          {
            title: "Form Input Temuan & Suku Cadang",
            description: "Catat tindakan kalibrasi dan suku cadang yang diganti untuk dicetak otomatis pada kartu garansi konsumen.",
            icon: <FileSpreadsheet className="w-8 h-8 text-cyan-400" />,
            highlightText: "Form Kalibrasi",
            selector: "#parts-log-panel"
          }
        ];

      case 'FOREMAN':
        return [
          {
            title: "Foreman Control Center",
            description: "Sebagai Foreman, Anda memiliki wewenang penuh atas kelancaran produksi lab. Kelola antrean dan koordinasikan tugas tim Anda dari sini.",
            icon: <ShieldAlert className="w-8 h-8 text-blue-400" />,
            highlightText: "Pusat Kendali",
            selector: "#user-profile",
            mobileTip: "Buka menu samping ☰ untuk memantau status profil Anda."
          },
          {
            title: "Pengalih Sudut Pandang (View Toggle)",
            description: "Gunakan tombol toggle di bagian atas ini untuk beralih instan antara 'Front Office View' (pantau kerja SA) dan 'Mechanic Queue View' (pantau kerja lab).",
            icon: <Sliders className="w-8 h-8 text-emerald-400" />,
            highlightText: "Beralih Tampilan",
            selector: "div.flex.bg-slate-200.rounded.p-1.w-fit"
          },
          {
            title: "Verifikasi Hambatan & Stop-Clock",
            description: "Tinjau pengajuan jeda kerja mekanik karena sparepart kosong atau kerusakan tambahan (hidden defect). Setujui penangguhan secara instan di sini.",
            icon: <ClipboardList className="w-8 h-8 text-amber-400" />,
            highlightText: "Persetujuan Jeda",
            selector: "#mechanic-queue"
          },
          {
            title: "Routing Alur Divisi",
            description: "Gunakan opsi pemindahan alur kerja di bagian ini untuk mengirimkan pengerjaan unit dari Supply Pump ke Common Rail atau sebaliknya.",
            icon: <CheckCircle2 className="w-8 h-8 text-cyan-400" />,
            highlightText: "Distribusi Tugas",
            selector: "#mechanic-timer-action"
          }
        ];

      case 'ADMIN':
      default:
        return [
          {
            title: "Selamat Datang, Administrator!",
            description: "Di sini Anda memegang kendali penuh atas sistem keamanan, manajemen otorisasi staff, serta audit ledger operasional.",
            icon: <Settings className="w-8 h-8 text-blue-400" />,
            highlightText: "System Admin",
            selector: "#user-profile",
            mobileTip: "Buka menu samping ☰ untuk melihat profil Anda."
          },
          {
            title: "Registrasi Karyawan Baru",
            description: "Klik tombol 'Add User' ini untuk membuat akun karyawan baru (Service Advisor, Mekanik, Foreman) secara instan.",
            icon: <ClipboardList className="w-8 h-8 text-emerald-400" />,
            highlightText: "Registrasi Staff",
            selector: "#admin-add-user"
          },
          {
            title: "Manajemen Akun & Status Staff",
            description: "Pantau daftar pengguna aktif, edit hak akses peran (role), tangguhkan (suspend) akun bermasalah, atau hapus staff secara permanen.",
            icon: <BarChart3 className="w-8 h-8 text-purple-400" />,
            highlightText: "Otoritas Staff",
            selector: "#admin-user-table"
          },
          {
            title: "KPI & Analitik Pertumbuhan",
            description: "Navigasi ke menu samping 'Analitik & KPI' untuk memantau grafik performa efisiensi kerja tim dan tren finansial bisnis Anda.",
            icon: <BookOpen className="w-8 h-8 text-cyan-400" />,
            highlightText: "Analitik Bisnis",
            selector: "#sidebar-navigation",
            mobileTip: "Buka menu samping ☰ untuk mengakses Analitik & KPI."
          }
        ];
    }
  };

  const steps = getStepsForRole(role);
  const currentStepData = steps[currentStep];

  // Dynamic selector bounding rect tracker
  useEffect(() => {
    if (!currentStepData || !currentStepData.selector) {
      setTargetRect(null);
      return;
    }

    const updateTargetRect = () => {
      const element = document.querySelector(currentStepData.selector);
      if (element) {
        const rect = element.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          // Check if element is inside the sidebar
          const isInsideSidebar = element.closest('aside') !== null;
          const sidebarElement = document.querySelector('aside');
          
          // On mobile, if sidebar is closed, do not highlight elements inside it
          const isMobileViewport = window.innerWidth < 768;
          const isSidebarClosedOnMobile = isMobileViewport && sidebarElement && (
            sidebarElement.classList.contains('-translate-x-full') ||
            rect.right <= 0
          );

          if (isInsideSidebar && isSidebarClosedOnMobile) {
            setTargetRect(null);
            return;
          }

          // If the element is completely off-screen, treat it as hidden
          if (
            rect.right < 0 || 
            rect.left > window.innerWidth || 
            rect.bottom < 0 || 
            rect.top > window.innerHeight
          ) {
            setTargetRect(null);
            return;
          }

          setTargetRect(rect);
          return;
        }
      }
      setTargetRect(null);
    };

    updateTargetRect();

    // Staggered interval check for rendering delays & navigation animations
    const timer1 = setTimeout(updateTargetRect, 100);
    const timer2 = setTimeout(updateTargetRect, 400);
    const timer3 = setTimeout(updateTargetRect, 800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [currentStep, role]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    if (!currentUser) return;
    try {
      await updateUser(currentUser.id, { hasSeenTutorial: true });
      addNotification(
        'Panduan Selesai',
        'Selamat menggunakan sistem terintegrasi ITech ERP!',
        'success'
      );
    } catch (err) {
      console.error("Gagal menyimpan status tutorial:", err);
    }
  };

  // SVG Cutout Path builder (clockwise outer, counter-clockwise inner)
  const getSvgPath = () => {
    if (!targetRect) return '';
    const { width: w, height: h } = windowSize;
    const { left: x, top: y, width: rw, height: rh } = targetRect;
    const padding = 8; // generous padding for sleek aesthetics
    return `M 0 0 h ${w} v ${h} h -${w} z M ${x - padding} ${y - padding} v ${rh + padding * 2} h ${rw + padding * 2} v -${rh + padding * 2} z`;
  };

  const isMobile = windowSize.width < 768;

  // Popover layout calculations
  const getPopoverPlacement = () => {
    if (isMobile) {
      // Sleek mobile sheet layout fixed at the bottom with safe area padding
      return {
        style: {
          position: 'fixed' as const,
          bottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
          left: '12px',
          right: '12px',
          zIndex: 50,
        },
        arrowDirection: null,
      };
    }

    if (!targetRect) {
      // Centered fallback modal if element is missing or collapsed
      return {
        style: {
          position: 'fixed' as const,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: isMobile ? 'calc(100% - 24px)' : '340px',
          maxWidth: '360px',
          zIndex: 50,
        },
        arrowDirection: null,
      };
    }

    // Desktop positioning
    const margin = 20;
    const popoverWidth = 320;
    const popoverHeight = 220; // safe assumption

    let left = targetRect.right + margin;
    let top = targetRect.top + (targetRect.height - popoverHeight) / 2;
    let arrowDir: 'left' | 'right' | 'top' | 'bottom' = 'left';

    // Offscreen Right -> flip to Left
    if (left + popoverWidth > window.innerWidth) {
      left = targetRect.left - popoverWidth - margin;
      arrowDir = 'right';
    }

    // Offscreen Left -> fallback to Bottom
    if (left < 0) {
      left = targetRect.left + (targetRect.width - popoverWidth) / 2;
      top = targetRect.bottom + margin;
      arrowDir = 'top';
    }

    // Ensure it remains perfectly in boundaries
    left = Math.max(16, Math.min(left, window.innerWidth - popoverWidth - 16));
    top = Math.max(16, Math.min(top, window.innerHeight - popoverHeight - 16));

    return {
      style: {
        position: 'fixed' as const,
        left: `${left}px`,
        top: `${top}px`,
        width: `${popoverWidth}px`,
        zIndex: 50,
      },
      arrowDirection: arrowDir,
    };
  };

  const popoverPlacement = getPopoverPlacement();

  if (!currentUser || currentUser.hasSeenTutorial) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none print:hidden pointer-events-auto">
      {/* Dark Dimmer Backdrop with Dynamic Mask Hole */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-30">
        <motion.path
          fill="rgba(2, 6, 23, 0.72)"
          backdrop-filter="blur(3px)"
          fillRule="evenodd"
          animate={{ d: targetRect ? getSvgPath() : `M 0 0 h ${windowSize.width} v ${windowSize.height} h -${windowSize.width} z` }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        />
      </svg>

      {/* Glow highlight surrounding the active target element */}
      {targetRect && (
        <motion.div
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          key={`highlight-${currentStep}`}
          transition={{ duration: 0.2 }}
          style={{
            position: 'fixed',
            left: targetRect.left - 8,
            top: targetRect.top - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
            pointerEvents: 'none',
            zIndex: 40,
          }}
          className="border-2 border-blue-500 rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.65)]"
        />
      )}

      {/* Popover / Coachmark box */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`popover-${currentStep}`}
          initial={{ opacity: 0, scale: 0.95, y: isMobile ? 40 : 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: isMobile ? 40 : 10 }}
          transition={{ duration: 0.25 }}
          style={popoverPlacement.style}
          className="bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-2xl p-5 md:p-6 flex flex-col pointer-events-auto overflow-visible"
        >
          {/* Decorative Arrow for Desktop Popover */}
          {popoverPlacement.arrowDirection && (
            <div 
              style={{
                top: popoverPlacement.arrowDirection === 'left' || popoverPlacement.arrowDirection === 'right' ? '45%' : undefined,
                bottom: popoverPlacement.arrowDirection === 'bottom' ? '-6px' : undefined,
                left: popoverPlacement.arrowDirection === 'top' ? '50%' : popoverPlacement.arrowDirection === 'right' ? '-6px' : undefined,
                right: popoverPlacement.arrowDirection === 'left' ? '-6px' : undefined,
                transform: 'translateY(-50%) rotate(45deg)',
              }}
              className={`absolute w-3 h-3 bg-slate-900 border-slate-800 border-t border-l ${
                popoverPlacement.arrowDirection === 'left' ? 'border-r border-t border-l-0 border-b-0' :
                popoverPlacement.arrowDirection === 'right' ? 'border-l border-b border-r-0 border-t-0' :
                popoverPlacement.arrowDirection === 'top' ? 'border-t border-l border-r-0 border-b-0' :
                'border-b border-r border-t-0 border-l-0'
              }`}
            />
          )}

          {/* Close Button */}
          <button 
            onClick={handleComplete}
            className="absolute top-3.5 right-3.5 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors z-10 cursor-pointer"
            title="Lewati Panduan"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Card Content Header */}
          <div className="flex items-center gap-3 mb-3.5">
            <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/40 text-blue-400 shadow-inner">
              {currentStepData.icon}
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-wider text-blue-400 bg-blue-950/50 border border-blue-500/20 px-2 py-0.5 rounded">
                {currentStepData.highlightText}
              </span>
              <h2 className="text-[13px] md:text-sm font-black text-white mt-1 uppercase tracking-wide leading-none">
                {currentStepData.title}
              </h2>
            </div>
          </div>

          {/* Step Description */}
          <div className="flex-1">
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              {currentStepData.description}
            </p>

            {/* Smart Tip for hidden elements or Mobile views */}
            {!targetRect && (
              <div className="mt-3 bg-blue-950/30 border border-blue-500/10 p-2.5 rounded-xl text-[10px] text-blue-300 flex items-start gap-1.5 leading-normal">
                <span className="shrink-0">💡</span>
                <p>
                  {currentStepData.mobileTip || "Gunakan menu navigasi atau gulir ke bawah untuk memunculkan fitur ini."}
                </p>
              </div>
            )}
          </div>

          {/* Footer Controls & Stepper */}
          <div className="flex items-center justify-between mt-5 pt-3.5 border-t border-slate-800/60">
            {/* Dots Stepper indicator */}
            <div className="flex gap-1">
              {steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentStep(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    i === currentStep ? 'w-4.5 bg-blue-500' : 'w-1.5 bg-slate-800 hover:bg-slate-700'
                  }`}
                  title={`Ke langkah ${i + 1}`}
                />
              ))}
            </div>

            {/* Buttons Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                disabled={currentStep === 0}
                className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  currentStep === 0 
                    ? 'text-slate-600 cursor-not-allowed opacity-35' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Kembali
              </button>

              <button
                onClick={handleNext}
                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-wider px-4 py-2 rounded-xl shadow-lg shadow-blue-500/10 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                {currentStep === steps.length - 1 ? (
                  <>
                    Selesai
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 ml-0.5" />
                  </>
                ) : (
                  <>
                    Lanjut
                    <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
