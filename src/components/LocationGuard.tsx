import React, { useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { MapPin, ShieldAlert, Navigation, RefreshCw, LogOut } from 'lucide-react';
import { motion } from 'motion/react';

interface LocationGuardProps {
  currentUser: User | null;
  logout: () => void;
  children: React.ReactNode;
}

type GuardStatus = 'INITIAL' | 'CHECKING' | 'ALLOWED' | 'BLOCKED_OUT_OF_BOUNDS' | 'BLOCKED_DENIED' | 'BLOCKED_ERROR';

export const LocationGuard: React.FC<LocationGuardProps> = ({ currentUser, logout, children }) => {
  const [status, setStatus] = useState<GuardStatus>('INITIAL');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const geoLock = currentUser?.geoLock;
  const isEnabled = geoLock?.enabled;
  const isAdmin = currentUser?.role === 'ADMIN';
  const isCustomer = currentUser?.role === 'CUSTOMER';

  // Calculate distance using Haversine Formula (in meters)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  const checkLocation = useCallback(() => {
    if (!isEnabled || isAdmin || isCustomer || !geoLock) {
      setStatus('ALLOWED');
      return;
    }

    setStatus('CHECKING');
    setErrorMsg(null);

    if (!navigator.geolocation) {
      setStatus('BLOCKED_ERROR');
      setErrorMsg('Browser Anda tidak mendukung layanan Geolocation HTML5.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lng: longitude });

        const computedDistance = calculateDistance(
          latitude,
          longitude,
          geoLock.latitude,
          geoLock.longitude
        );

        setDistance(computedDistance);

        if (computedDistance <= geoLock.radius) {
          setStatus('ALLOWED');
        } else {
          setStatus('BLOCKED_OUT_OF_BOUNDS');
        }
      },
      (error) => {
        console.error('Location Guard Error:', error);
        if (error.code === 1) {
          setStatus('BLOCKED_DENIED');
          setErrorMsg('Akses GPS ditolak. Silakan izinkan akses lokasi pada browser Anda.');
        } else if (error.code === 2) {
          setStatus('BLOCKED_ERROR');
          setErrorMsg('Sinyal GPS tidak tersedia atau gagal terdeteksi.');
        } else if (error.code === 3) {
          setStatus('BLOCKED_ERROR');
          setErrorMsg('Waktu permintaan lokasi habis (timeout).');
        } else {
          setStatus('BLOCKED_ERROR');
          setErrorMsg('Gagal mengambil koordinat lokasi saat ini.');
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, [isEnabled, isAdmin, isCustomer, geoLock]);

  useEffect(() => {
    if (currentUser && isEnabled && !isAdmin && !isCustomer) {
      checkLocation();
    } else {
      setStatus('ALLOWED');
    }
  }, [currentUser, isEnabled, isAdmin, isCustomer, checkLocation]);

  if (!currentUser || !isEnabled || isAdmin || isCustomer || status === 'ALLOWED') {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 bg-[#0f172a] text-slate-100 flex items-center justify-center p-4 font-sans z-50 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, y: 15 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 md:p-8 space-y-6"
      >
        {/* Header Icon Indicator */}
        <div className="flex justify-center">
          {status === 'CHECKING' && (
            <div className="relative flex items-center justify-center h-16 w-16 bg-blue-950 border border-blue-800/80 rounded-full animate-pulse text-blue-400 shadow-xl">
              <Navigation className="w-8 h-8 animate-spin" />
            </div>
          )}
          {status === 'BLOCKED_OUT_OF_BOUNDS' && (
            <div className="relative flex items-center justify-center h-16 w-16 bg-rose-950 border border-rose-800 text-rose-400 rounded-full shadow-xl animate-bounce">
              <ShieldAlert className="w-8 h-8" />
            </div>
          )}
          {(status === 'BLOCKED_DENIED' || status === 'BLOCKED_ERROR') && (
            <div className="relative flex items-center justify-center h-16 w-16 bg-amber-950 border border-amber-800 text-amber-400 rounded-full shadow-xl">
              <MapPin className="w-8 h-8 animate-bounce" />
            </div>
          )}
        </div>

        {/* Dynamic Warning Message */}
        <div className="text-center space-y-3">
          <h2 className="text-base md:text-lg font-black uppercase tracking-wider text-rose-500 flex items-center justify-center gap-2">
            {status === 'CHECKING' && 'Memvalidasi Lokasi'}
            {status === 'BLOCKED_OUT_OF_BOUNDS' && 'Pelanggaran Perimeter Akses'}
            {status === 'BLOCKED_DENIED' && 'Akses GPS Diperlukan'}
            {status === 'BLOCKED_ERROR' && 'Sinyal Lokasi Bermasalah'}
          </h2>
          
          <div className="text-xs text-slate-300 leading-relaxed font-semibold">
            {status === 'CHECKING' && (
              <p className="text-slate-400">Mencocokkan koordinat GPS Anda dengan perimeter operasional bengkel Indo Teknik. Mohon tunggu...</p>
            )}
            {status === 'BLOCKED_OUT_OF_BOUNDS' && (
              <div className="space-y-4">
                <div className="bg-rose-950/40 border border-rose-900/60 p-3.5 rounded-lg text-left text-xs text-rose-200 space-y-1.5">
                  <p className="font-extrabold text-rose-400 uppercase tracking-wider text-[10px]">⚠️ PERINGATAN KEAMANAN & KERAHASIAAN DATA:</p>
                  <p>
                    Akses ditolak karena Anda terdeteksi berada di luar perimeter operasional bengkel resmi Indo Teknik.
                  </p>
                  <p className="text-[11px] text-rose-300/85">
                    Demi mencegah kebocoran data rahasia perusahaan dan penyalahgunaan wewenang, staf dilarang keras mengakses sistem ERP/operasional dari lokasi yang tidak diotorisasi.
                  </p>
                </div>
                
                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-left space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Target Lokasi:</span>
                    <span className="text-slate-300 font-bold">{geoLock?.addressName || 'Bengkel Utama'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Maks. Radius:</span>
                    <span className="text-emerald-400 font-bold">{geoLock?.radius} meter</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Jarak Anda:</span>
                    <span className="text-rose-400 font-black">
                      {distance ? `${distance.toFixed(1)} meter` : 'Tidak terdeteksi'}
                    </span>
                  </div>
                  {coords && (
                    <div className="flex justify-between text-[9px] pt-1 border-t border-slate-900/60 mt-1">
                      <span className="text-slate-500">Koordinat GPS Anda:</span>
                      <span className="text-slate-400">{coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            {status === 'BLOCKED_DENIED' && (
              <div className="space-y-3">
                <div className="bg-amber-950/40 border border-amber-900/60 p-3.5 rounded-lg text-left text-xs text-amber-200 space-y-1.5">
                  <p className="font-extrabold text-amber-400 uppercase tracking-wider text-[10px]">🔒 VERIFIKASI KEAMANAN GPS WAJIB:</p>
                  <p>
                    Akses sistem operasional Indo Teknik mewajibkan verifikasi lokasi GPS guna memastikan kepatuhan wilayah kerja staf dan pencegahan akses tidak sah.
                  </p>
                </div>
                <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800 text-left text-[11px] space-y-2 font-medium">
                  <p className="font-extrabold text-amber-400">Cara mengaktifkan izin GPS:</p>
                  <ol className="list-decimal list-inside space-y-1 text-slate-400">
                    <li>Klik ikon gembok / setelan lokasi di sebelah kiri bilah alamat (URL) browser Anda.</li>
                    <li>Ubah setelan izin <strong>Lokasi / Location</strong> menjadi <strong>Izinkan / Allow</strong>.</li>
                    <li>Klik tombol <strong>Coba Lagi</strong> untuk memeriksa ulang lokasi Anda.</li>
                  </ol>
                </div>
              </div>
            )}
            {status === 'BLOCKED_ERROR' && (
              <div className="space-y-3">
                <div className="bg-amber-950/40 border border-amber-900/60 p-3.5 rounded-lg text-left text-xs text-amber-200">
                  <p>{errorMsg || 'Gagal memverifikasi lokasi karena gangguan perangkat keras atau konektivitas GPS.'}</p>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Silakan pastikan GPS perangkat Anda aktif, memiliki koneksi internet yang stabil, lalu klik tombol Coba Lagi di bawah.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions Button Panel */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={logout}
            className="flex-1 bg-slate-800 hover:bg-slate-700 active:bg-slate-850 text-white py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer border border-slate-700 transition-all shadow-md"
          >
            <LogOut className="w-4 h-4 text-slate-400" />
            Keluar Akun
          </button>
          
          <button
            type="button"
            onClick={checkLocation}
            disabled={status === 'CHECKING'}
            className="flex-1 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-800 disabled:text-slate-500 disabled:border-transparent transition-all shadow-lg"
          >
            <RefreshCw className={`w-4 h-4 ${status === 'CHECKING' ? 'animate-spin' : ''}`} />
            {status === 'CHECKING' ? 'Memeriksa...' : 'Coba Lagi'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
