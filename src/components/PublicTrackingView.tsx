import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { WorkOrder } from '../types';
import { SmartLogo } from './SmartLogo';
import { 
  Search, ArrowLeft, Clock, ShieldCheck, CheckCircle2, AlertTriangle, 
  Settings, Check, Compass, AlertCircle, PhoneCall, Share2, ClipboardList, 
  Info, Sparkles, Gauge, RefreshCw, ChevronRight, Calendar, User, Wrench,
  X, Download, QrCode, FileText, Maximize2, Zap, Shield, Sparkle,
  Activity, Play, Square, Volume2, VolumeX, Users, Car, Sliders, Award, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../store/AppContext';
import { QRCodeSVG } from 'qrcode.react';

export const GENERAL_TRACKING_MILESTONES = [
  { id: 'm1', label: 'Intake & Verifikasi', desc: 'Serah terima fisik unit/komponen dari pelanggan' },
  { id: 'm2', label: 'Pembongkaran & Pembersihan', desc: 'Unit/komponen dibongkar untuk proses pembersihan awal' },
  { id: 'm3', label: 'Pengecekan Fisik & Diagnosa Workshop', desc: 'Pengujian awal tekanan, kalibrasi, & diagnosa kerusakan' },
  { id: 'm4', label: 'Analisis Estimasi & Persetujuan', desc: 'Penghitungan estimasi biaya & persetujuan tindakan pengerjaan' },
  { id: 'm5', label: 'Perbaikan & Penggantian Suku Cadang', desc: 'Proses perbaikan utama & penggantian komponen yang aus' },
  { id: 'm6', label: 'Kalibrasi Akhir & Quality Control', desc: 'Pengujian fungsi workshop & pengujian QC jalan' },
  { id: 'm7', label: 'Selesai & Siap Diserahkan', desc: 'Pekerjaan selesai 100% dan unit siap diambil/dikirim' }
];

export const SUB_CHECKLISTS: { [key: number]: string[] } = {
  0: [
    'Verifikasi kesesuaian fisik unit/komponen di meja intake front office',
    'Registrasi serial number komponen ke sistem cloud ERP Indo Teknik',
    'Pengambilan dokumentasi visual resolusi tinggi kondisi unit masuk'
  ],
  1: [
    'Dekompresi casing luar & pelepasan sekrup penahan pelindung',
    'Pembersihan tangki Ultrasonic Bath dengan pelarut kimia khusus',
    'Inspeksi visual awal mendeteksi keausan mikro & retakan bodi'
  ],
  2: [
    'Uji kelancaran pergerakan nozzle needle & pergerakan piston',
    'Pengukuran nilai hambatan elektrikal solenoid / piezo actuator',
    'Uji kebocoran tekanan statis (Static Leakage Pressure Test)'
  ],
  3: [
    'Penyusunan laporan analisis kerusakan workshop terpadu',
    'Kalkulasi rincian kebutuhan suku cadang original (ITech/Denso/Delphi)',
    'Konfirmasi opsi estimasi biaya & jaminan garansi oleh SA ke pelanggan'
  ],
  4: [
    'Pelepasan suku cadang aus & instalasi parts kit baru bersertifikasi',
    'Kalibrasi torsi pengencangan baut penahan menggunakan kunci khusus',
    'Pembersihan akhir residu dan pembilasan saluran injeksi (Final Flush)'
  ],
  5: [
    'Pemasangan komponen terkalibrasi ke mesin uji mesin EPS Workshop ITech',
    'Uji volume semprotan presisi tinggi (Full Load, Emissions, Idle, Pre-inj)',
    'Penyelarasan sudut pengabutan & penerbitan sertifikat kalibrasi digital'
  ],
  6: [
    'Pengemasan unit menggunakan segel plastik pelindung kedap debu & karat',
    'Penyerahan fisik unit bersama sertifikat hasil uji kalibrasi resmi',
    'Validasi tanda tangan digital bukti serah terima unit di sistem'
  ]
};

const PublicTrackingView: React.FC<{ initialWoId?: string; onBackToLogin: () => void }> = ({ initialWoId = '', onBackToLogin }) => {
  const { trackingBaseUrl } = useApp();
  const [woId, setWoId] = useState(initialWoId);
  const [searchInput, setSearchInput] = useState(initialWoId);
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastSync, setLastSync] = useState<string>('');
  const [copied, setCopied] = useState(false);
  
  // Dashboard view toggle (Simple/Clean for customers vs Advanced Engineering View)
  const [isAdvancedView, setIsAdvancedView] = useState<boolean>(false);
  const [mobileTab, setMobileTab] = useState<'STATUS' | 'INTAKE' | 'COMPONENTS'>('STATUS');
  const [expandedMilestones, setExpandedMilestones] = useState<{ [key: number]: boolean }>({});
  const [showDigitalCard, setShowDigitalCard] = useState(false);
  const [generatingCard, setGeneratingCard] = useState(false);
  
  // Interactive Explorer Workspace
  const [inspectorType, setInspectorType] = useState<'injector' | 'pump' | 'turbo' | 'rail'>('injector');
  const [activeHotspot, setActiveHotspot] = useState<string>('tip');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [explodedOffset, setExplodedOffset] = useState<number>(10);
  const [activeDiagnosticMode, setActiveDiagnosticMode] = useState<'structural' | 'fluid' | 'thermal'>('structural');

  // Calibration Game (ITech Laboratory simulator)
  const [isSimulatingTest, setIsSimulatingTest] = useState<boolean>(false);
  const [simulatedPressure, setSimulatedPressure] = useState<number>(1350);
  const [simulatedFlow, setSimulatedFlow] = useState<number>(42.4);
  const [simulatedRpm, setSimulatedRpm] = useState<number>(1500);
  const [waveSeed, setWaveSeed] = useState<number>(0);

  // Advanced calibration challenge
  const [calibrationDifficulty, setCalibrationDifficulty] = useState<'novice' | 'pro' | 'master'>('pro');
  const [gameTargetPressure, setGameTargetPressure] = useState<number>(1600);
  const [gameShimThickness, setGameShimThickness] = useState<number>(1.250);
  const [gameRailPressure, setGameRailPressure] = useState<number>(1600);
  const [gameScvCurrent, setGameScvCurrent] = useState<number>(1.2);
  const [gameIsRunning, setGameIsRunning] = useState<boolean>(false);
  const [gameScore, setGameScore] = useState<number | null>(null);
  const [gameFeedback, setGameFeedback] = useState<string>('Sesuaikan Shim Spacer, Tekanan Rel, dan Arus SCV di bawah untuk mencapai Target Tekanan Uji.');
  const [gameBadge, setGameBadge] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(true);

  // Audio synths refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load and subscribe to FireStore database changes
  useEffect(() => {
    if (!woId) {
      setWorkOrder(null);
      return;
    }
    setLoading(true);
    setError('');
    const docRef = doc(db, 'workOrders', woId.trim().toUpperCase());
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      setLoading(false);
      if (docSnap.exists()) {
        const data = docSnap.data() as WorkOrder;
        setWorkOrder(data);
        setLastSync(new Date().toLocaleTimeString('id-ID'));
        setError('');
      } else {
        setWorkOrder(null);
        setError('Nomor SPK / Work Order tidak ditemukan di database. Pastikan nomor yang dimasukkan benar.');
      }
    }, (err) => {
      console.error("Public tracking subscribe error:", err);
      setLoading(false);
      setError('Gagal menghubungkan ke server pelacakan.');
    });
    return () => unsubscribe();
  }, [woId]);

  // Audio tone synthesizer for mechanics calibration sounds
  useEffect(() => {
    if (isMuted || !isSimulatingTest) {
      if (oscillatorRef.current) {
        try { oscillatorRef.current.stop(); } catch (e) {}
        oscillatorRef.current = null;
      }
      return;
    }
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      if (inspectorType === 'injector') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(80, ctx.currentTime);
        gain.gain.setValueAtTime(0.01, ctx.currentTime);
        let pulse = false;
        const interval = setInterval(() => {
          if (!oscillatorRef.current || isMuted || !isSimulatingTest) {
            clearInterval(interval);
            return;
          }
          osc.frequency.setValueAtTime(pulse ? 120 : 80, ctx.currentTime);
          pulse = !pulse;
        }, 120);
      } else if (inspectorType === 'pump') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(60, ctx.currentTime);
        gain.gain.setValueAtTime(0.015, ctx.currentTime);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(180, ctx.currentTime);
        gain.gain.setValueAtTime(0.008, ctx.currentTime);
      }
      osc.start();
      oscillatorRef.current = osc;
    } catch (err) {
      console.warn("Web Audio API failed to load", err);
    }
    return () => {
      if (oscillatorRef.current) {
        try { oscillatorRef.current.stop(); } catch (e) {}
        oscillatorRef.current = null;
      }
    };
  }, [isSimulatingTest, inspectorType, isMuted]);

  // Wave seed tick for live graphs
  useEffect(() => {
    if (!isSimulatingTest) return;
    const interval = setInterval(() => {
      setWaveSeed(s => (s + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, [isSimulatingTest]);

  // Telemetry fluctuation simulator
  useEffect(() => {
    if (!isSimulatingTest) return;
    const interval = setInterval(() => {
      setSimulatedPressure(prev => {
        const delta = Math.floor(Math.random() * 41) - 20;
        let base = inspectorType === 'pump' ? 1850 : inspectorType === 'turbo' ? 1.8 : inspectorType === 'rail' ? 2200 : 1350;
        const nextVal = prev + delta;
        return nextVal < base * 0.95 ? base * 0.95 : nextVal > base * 1.05 ? base * 1.05 : Number(nextVal.toFixed(inspectorType === 'turbo' ? 2 : 0));
      });
      setSimulatedFlow(prev => {
        const delta = (Math.random() * 2) - 1;
        let base = inspectorType === 'pump' ? 72.8 : inspectorType === 'turbo' ? 120.5 : inspectorType === 'rail' ? 0.0 : 42.4;
        if (inspectorType === 'rail') return 0;
        const nextVal = prev + delta;
        return nextVal < base * 0.9 ? base * 0.9 : nextVal > base * 1.1 ? base * 1.1 : Number(nextVal.toFixed(1));
      });
      setSimulatedRpm(prev => {
        const delta = Math.floor(Math.random() * 21) - 10;
        let base = inspectorType === 'pump' ? 2200 : inspectorType === 'turbo' ? 120000 : inspectorType === 'rail' ? 0 : 1500;
        if (inspectorType === 'rail') return 0;
        const nextVal = prev + delta;
        return nextVal < base * 0.98 ? base * 0.98 : nextVal > base * 1.02 ? base * 1.02 : Math.round(nextVal);
      });
    }, 200);
    return () => clearInterval(interval);
  }, [isSimulatingTest, inspectorType]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    const url = new URL(window.location.href);
    url.searchParams.set('tracking', searchInput.trim().toUpperCase());
    window.history.pushState({}, '', url.toString());
    setWoId(searchInput.trim().toUpperCase());
  };

  const getMilestoneIndex = (wo: WorkOrder) => {
    if (wo.isHandoverConfirmed) return 7;
    if (!wo.currentMilestone) {
      if (wo.status === 'COMPLETED') return 6;
      if (wo.status === 'PENDING_APPROVAL') return 3;
      if (wo.status === 'PENDING_PARTS') return 4;
      if (wo.status === 'QUEUE') return 0;
      return 4;
    }
    return GENERAL_TRACKING_MILESTONES.findIndex(m => m.label === wo.currentMilestone);
  };

  const activeMilestoneIndex = workOrder ? getMilestoneIndex(workOrder) : 0;

  useEffect(() => {
    if (workOrder) {
      const idx = getMilestoneIndex(workOrder);
      setExpandedMilestones({ [idx]: true });
    }
  }, [workOrder]);

  const handleCopyLink = () => {
    const baseTracking = trackingBaseUrl || 'https://it-erp-app.web.app';
    const link = `${baseTracking}/?tracking=${woId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const maskText = (text: string, keepLength = 4) => {
    if (!text) return '-';
    if (text.length <= keepLength) return text;
    return text.substring(0, keepLength) + '••••' + text.substring(text.length - 2);
  };

  const handleContactSaClick = (type: string) => {
    if (!workOrder) return;
    const WA_MESSAGE_TEMPLATES = {
      progress: `Halo Service Advisor Indo Teknik, saya ingin menanyakan rincian progres terkini untuk unit kendaraan saya dengan nomor SPK *${workOrder.id}* atas nama ${workOrder.customerName}. Terima kasih!`,
      parts: `Halo Service Advisor Indo Teknik, terkait pengerjaan SPK *${workOrder.id}* (${workOrder.customerName}), apakah rincian kalkulasi suku cadang yang perlu diganti sudah keluar? Terima kasih!`,
      approve: `Halo Service Advisor Indo Teknik, saya ingin mengonfirmasi persetujuan pengerjaan perbaikan untuk SPK *${workOrder.id}* atas nama ${workOrder.customerName}. Silakan dilanjutkan proses perbaikannya.`,
      itech: `Halo SA Indo Teknik, saya tertarik untuk menggunakan suku cadang *Nozzle ITech Premium* pada pengerjaan Injector kendaraan saya (SPK: ${workOrder.id}). Apakah stock tersedia?`
    };
    const msgText = WA_MESSAGE_TEMPLATES[type as keyof typeof WA_MESSAGE_TEMPLATES] || WA_MESSAGE_TEMPLATES.progress;
    const msg = encodeURIComponent(msgText);
    window.open(`https://wa.me/628117531881?text=${msg}`, '_blank');
  };

  // Generate beautiful printable certificate
  const generateCanvasCard = () => {
    setGeneratingCard(true);
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas || !workOrder) {
        setGeneratingCard(false);
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setGeneratingCard(false);
        return;
      }
      const grad = ctx.createLinearGradient(0, 0, 800, 500);
      grad.addColorStop(0, '#090e1a');
      grad.addColorStop(1, '#0c172e');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 800, 500);

      ctx.fillStyle = 'rgba(59, 130, 246, 0.05)';
      ctx.beginPath();
      ctx.arc(800, 0, 300, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(59, 130, 246, 0.2)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(20, 20, 760, 460);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'black 22px sans-serif';
      ctx.fillText('INDO TEKNIK CERTIFICATE OF CALIBRATION', 50, 70);

      ctx.fillStyle = '#60a5fa';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`SPK / WORK ORDER RECORD ID: ${workOrder.id}`, 50, 100);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.fillRect(50, 130, 440, 1);

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'normal 13px sans-serif';
      ctx.fillText(`Pelanggan:`, 50, 165);
      ctx.fillStyle = '#f1f5f9';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(workOrder.customerName, 170, 165);

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'normal 13px sans-serif';
      ctx.fillText(`Kendaraan / Unit:`, 50, 205);
      ctx.fillStyle = '#f1f5f9';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(workOrder.vehicleBrand || 'Komponen Kiriman', 170, 205);

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'normal 13px sans-serif';
      ctx.fillText(`Metode Logistik:`, 50, 245);
      ctx.fillStyle = '#f1f5f9';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(workOrder.dropMethod === 'PARTS' ? 'Komponen Langsung' : 'Unit Kendaraan Lengkap', 170, 245);

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'normal 13px sans-serif';
      ctx.fillText(`Jaminan Garansi:`, 50, 285);
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(workOrder.garansi || 'Authorized 6 Bulan', 170, 285);

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'normal 13px sans-serif';
      ctx.fillText(`Status Uji Akhir:`, 50, 325);
      ctx.fillStyle = '#60a5fa';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('CALIBRATED PASS & VERIFIED', 170, 325);

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'normal 11px sans-serif';
      ctx.fillText('Dokumen ini diterbitkan oleh Indo Teknik Diesel Calibration Center secara otomatis', 50, 420);
      ctx.fillText('sebagai bukti otentik proses kalibrasi presisi bersertifikat.', 50, 438);

      const svgElement = document.getElementById('tracking-qrcode-svg');
      if (svgElement) {
        const svgString = new XMLSerializer().serializeToString(svgElement);
        const svg64 = btoa(unescape(encodeURIComponent(svgString)));
        const image = new Image();
        image.onload = () => {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(540, 140, 200, 200, 16);
          else ctx.rect(540, 140, 200, 200);
          ctx.fill();
          ctx.drawImage(image, 560, 160, 160, 160);
          ctx.fillStyle = '#94a3b8';
          ctx.font = 'bold 9px monospace';
          ctx.fillText('PINDAI QR STATUS REAL-TIME', 560, 365);
          setGeneratingCard(false);
        };
        image.src = 'data:image/svg+xml;base64,' + svg64;
      } else {
        setGeneratingCard(false);
      }
    }, 400);
  };

  const handleDownloadCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `Cert_Calibrated_${workOrder?.id || 'IT'}.png`;
    link.href = url;
    link.click();
  };

  // Interactive component specifications and properties
  const COMPONENT_DATA = {
    injector: {
      title: "Common Rail Injector",
      description: "Injektor diesel presisi tinggi yang menyemprotkan solar dengan tekanan hingga 2.500 Bar ke ruang bakar mesin.",
      icon: <Zap className="w-4 h-4 text-amber-400" />,
      hotspots: [
        { id: 'tip', label: 'Nozzle Spray Tip', desc: 'Ujung jarum nozzle dengan lubang mikroskopis (diameter ~0.1mm) yang rentan tersumbat deposit karbon.', action: 'Ultrasonic Cleaning & Micro-bore alignment (toleransi 0.01mm).' },
        { id: 'valve', label: 'Solenoid Valve Actuator', desc: 'Katup elektromagnetik yang mengatur waktu pembukaan semprotan dalam hitungan milidetik.', action: 'Electrical resistance tuning & response response lag check.' },
        { id: 'shim', label: 'Precision Adjusting Shims', desc: 'Keping logam mikro yang mengkalibrasi jarak renggang pegas penentu debit bahan bakar.', action: 'Micro-thickness sizing dengan ketebalan presisi ±0.002mm.' },
        { id: 'body', label: 'Inlet Feed Passage', desc: 'Saluran masuk bahan bakar tekanan tinggi yang harus bebas dari hambatan sirkulasi.', action: 'Chemical degreasing & dynamic flush menggunakan mesin rotary.' }
      ]
    },
    pump: {
      title: "High Pressure Fuel Pump",
      description: "Pompa penyuplai utama (Common Rail Pump) yang menghasilkan tekanan hidrolik solar raksasa untuk dialirkan ke pipa rail.",
      icon: <Gauge className="w-4 h-4 text-blue-400" />,
      hotspots: [
        { id: 'plunger', label: 'Plunger HP Element', desc: 'Piston mikro yang memompa solar dengan siklus sangat tinggi. Rentan baret halus jika ada partikel air.', action: 'Lapping micro-polishing & clearance clearance tolerance test.' },
        { id: 'scv', label: 'Suction Control Valve (SCV)', desc: 'Katup solenoid pengatur debit hisap solar sebelum dipompa demi menjaga kestabilan RPM mesin.', action: 'Dynamic electrical flow-rate calibration & response cycle test.' },
        { id: 'shaft', label: 'Drive Cam Shaft', desc: 'Poros pemutar plunger yang menerima beban torsi mesin. Harus berputar lurus tanpa runout.', action: 'Dynamic laser balance check & bearing radial runout check.' },
        { id: 'casing', label: 'Pump Housing / Casing', desc: 'Rumah pompa aluminium-baja yang menahan tekanan hidrolik internal.', action: 'De-carbonizing chemical bath & leak-down crack inspection.' }
      ]
    },
    turbo: {
      title: "Variable Geometry Turbo",
      description: "Kompresor udara pintar yang memanfaatkan gas buang mesin untuk menghasilkan dorongan udara (boost) masif ke silinder.",
      icon: <RefreshCw className="w-4 h-4 text-emerald-400" />,
      hotspots: [
        { id: 'comp', label: 'Compressor Impeller', desc: 'Kipas aluminium ringan yang berputar hingga 150.000 RPM untuk memadatkan udara masuk.', action: 'Dynamic balancing ultra-presisi hingga batas vibrasi 0.1 gram.' },
        { id: 'shaft_turbo', label: 'Turbine Shaft & Bearings', desc: 'Poros penghubung kompresor dan turbin yang dilumasi lapisan oli tipis penahan gesekan ekstrem.', action: 'Oil flow passage flushing & clearance measurement.' },
        { id: 'vgt', label: 'VGT Actuator Valve / Vanes', desc: 'Sistem sirip bergerak yang mengarahkan gas buang secara variabel guna mencegah turbo lag.', action: 'Actuator stroke calibration & vane alignment test.' },
        { id: 'gasket', label: 'Heat Shield & Sealing Gasket', desc: 'Peredam panas ekstrem hingga 800°C untuk menjaga kebocoran oli ke sisi gas buang.', action: 'High-temp seal integrity test & torque specification check.' }
      ]
    },
    rail: {
      title: "High Pressure Common Rail",
      description: "Pipa akumulator pusat yang menyimpan solar bertekanan konstan sebelum didistribusikan ke masing-masing injektor.",
      icon: <Activity className="w-4 h-4 text-purple-400" />,
      hotspots: [
        { id: 'sensor', label: 'Rail Pressure Sensor', desc: 'Sensor elektronik ultra-sensitif yang mengirim data tekanan solar real-time ke komputer mesin (ECU).', action: 'Voltage output signal linearity calibration & pressure test.' },
        { id: 'limiter', label: 'Mechanical Pressure Limiter', desc: 'Katup pengaman mekanis yang akan membuka jika terjadi lonjakan tekanan solar berbahaya.', action: 'Pop-off pressure threshold adjustment & spring tension test.' },
        { id: 'rail_body', label: 'Forged Accumulator Body', desc: 'Pipa baja tebal tempa khusus tanpa sambungan penahan daya hidrolik dahsyat.', action: 'Ultrasonic micro-crack inspection & structural integrity scan.' },
        { id: 'joints', label: 'High-Pressure Union Joints', desc: 'Dudukan ulir sambungan pipa logam ke injektor yang harus benar-benar kedap.', action: 'Metal-to-metal seating micro-polishing & leak proof testing.' }
      ]
    }
  };

  const currentComp = COMPONENT_DATA[inspectorType];
  const currentHotspot = currentComp.hotspots.find(h => h.id === activeHotspot) || currentComp.hotspots[0];

  // Live dynamic scoring engine for laboratory workstation
  const calculateTuningMetrics = () => {
    // Ideal settings:
    // shim thickness: 1.250 mm
    // SCV current: 1.20 A
    // Rail pressure should equal current target
    const shimDiff = Math.abs(gameShimThickness - 1.250); // 0 to 0.25
    const scvDiff = Math.abs(gameScvCurrent - 1.20); // 0 to 0.8
    const pressDiff = Math.abs(gameRailPressure - gameTargetPressure); // 0 to 1500

    const shimScore = Math.max(0, 100 - (shimDiff / 0.25) * 100);
    const scvScore = Math.max(0, 100 - (scvDiff / 0.80) * 100);
    const pressScore = Math.max(0, 100 - (pressDiff / 800) * 100);

    const score = Math.round((shimScore * 0.4) + (scvScore * 0.3) + (pressScore * 0.3));
    
    // Predicted engine outcomes based on sliders
    const smokeLevel = Math.round(Math.max(5, Math.min(98, 15 + (scvDiff * 80) + (pressDiff / 25) - (shimDiff * 50))));
    const smoothness = Math.round(Math.max(10, Math.min(100, score * 1.05 - (smokeLevel * 0.2))));
    const satisfaction = Math.round(Math.max(10, Math.min(100, (score * 0.8) + (100 - smokeLevel) * 0.2)));

    let rank = 'C';
    let rankColor = 'text-red-400';
    if (score >= 95) { rank = 'S'; rankColor = 'text-emerald-400 animate-pulse'; }
    else if (score >= 85) { rank = 'A'; rankColor = 'text-blue-400'; }
    else if (score >= 70) { rank = 'B'; rankColor = 'text-amber-400'; }

    // Dynamic AI technical advisor comments
    let advisory = "Tekanan hidrolik stabil. Sistem mendeteksi semprotan homogen.";
    if (gameShimThickness > 1.30) {
      advisory = "Peringatan: Shim Spacer terlalu tebal. Jarum nozzle akan tertahan ketat, mengurangi debit semprotan solar.";
    } else if (gameShimThickness < 1.15) {
      advisory = "Bahaya: Shim Spacer terlalu tipis. Pegas longgar berisiko kebocoran (nozzle drip) & pembakaran kasar.";
    } else if (Math.abs(gameRailPressure - gameTargetPressure) > 300) {
      advisory = `Tekanan rel menyimpang ${Math.abs(gameRailPressure - gameTargetPressure)} Bar dari target. Kalibrasi tidak sinkron.`;
    } else if (gameScvCurrent > 1.5) {
      advisory = "Arus listrik SCV berlebih. Katup tersumbat penuh berisiko mampet & memicu overpressure.";
    }

    return { score, smokeLevel, smoothness, satisfaction, rank, rankColor, advisory };
  };

  const metrics = calculateTuningMetrics();

  const handleDifficultyChange = (diff: 'novice' | 'pro' | 'master') => {
    setCalibrationDifficulty(diff);
    if (diff === 'novice') {
      setGameTargetPressure(1200);
    } else if (diff === 'pro') {
      setGameTargetPressure(1600);
    } else {
      setGameTargetPressure(2100);
    }
    setGameScore(null);
  };

  const handleRunCalibrationChallenge = () => {
    if (gameIsRunning) return;
    setGameIsRunning(true);
    setGameScore(null);
    setGameFeedback('Sedang mempresuriasi sistem ITech EPS... Memindai sensor...');
    
    setTimeout(() => {
      setGameFeedback('Menganalisa karakteristik atomisasi nozzle & grafik osiloskop...');
      setTimeout(() => {
        setGameScore(metrics.score);
        setGameIsRunning(false);
        if (metrics.score >= 95) {
          setGameFeedback('SPEKTAKULER! Hasil pengujian memenuhi toleransi ISO ITech standar manufaktur.');
          setGameBadge('🎖️ Master Calibrator');
        } else if (metrics.score >= 80) {
          setGameFeedback('KALIBRASI AMAN: Deviasi aliran minor terdeteksi. Cocok untuk solar standar.');
          setGameBadge('⚙️ Senior Tuner');
        } else {
          setGameFeedback('UJI GAGAL: Penyimpangan kritis! Mesin berisiko knocking, bergetar pincang & asap pekat.');
          setGameBadge('⚠️ Deviasi Kritis');
        }
      }, 1000);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#060a12] text-slate-100 font-sans flex flex-col justify-between pb-10 relative overflow-x-hidden selection:bg-blue-500/30 selection:text-blue-200">
      
      {/* Dynamic Cyber Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.003)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.003)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="border-b border-white/5 bg-[#080d16]/90 backdrop-blur-xl py-3 px-4 sm:px-8 sticky top-0 z-50 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_#3b82f6]" />
          <div>
            <h1 className="text-xs sm:text-sm font-black tracking-[0.15em] text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-blue-400 uppercase font-mono">
              INDO TEKNIK
            </h1>
            <p className="text-[7px] sm:text-[9px] text-slate-400 font-mono font-bold uppercase tracking-widest mt-0.5">Live Tracking System</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <SmartLogo baseName="logo-tech" alt="Indo Teknik" className="h-5 sm:h-6 object-contain bg-white/95 px-2 py-0.5 rounded shadow-md saturate-110" />
          <button 
            onClick={onBackToLogin}
            className="px-3 py-1.5 text-[8px] sm:text-[10px] bg-white/[0.03] hover:bg-white/[0.08] text-slate-200 hover:text-white border border-white/10 hover:border-white/20 rounded-lg font-black uppercase tracking-wider transition-all cursor-pointer active:scale-95 font-mono"
          >
            Portal Staff
          </button>
        </div>
      </header>

      <main className={`flex-1 max-w-[1540px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 z-10 relative flex flex-col ${!workOrder && !loading ? 'items-center justify-center min-h-[75vh]' : ''}`}>
        
        {/* Universal Search and Mode Control Panel */}
        <div 
          className={workOrder 
            ? "mb-6 bg-slate-900/40 border border-white/5 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-md w-full" 
            : "w-full max-w-2xl bg-gradient-to-b from-[#0e1628]/95 to-[#050810]/95 border border-blue-500/25 rounded-3xl p-8 md:p-12 flex flex-col items-center justify-center text-center shadow-[0_0_50px_rgba(59,130,246,0.15)] backdrop-blur-xl relative overflow-hidden transition-all duration-300 my-auto"
          }
        >
          {!workOrder && (
            <>
              {/* Decorative glows inside the card */}
              <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
              
              {/* Premium Title Group */}
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8 space-y-3 flex flex-col items-center text-center"
              >
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 font-mono text-[9px] font-black uppercase tracking-widest">
                  <Sparkles className="w-3 h-3 text-blue-400" /> CUSTOMER GATEWAY
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-300 uppercase tracking-tight leading-none">
                  PORTAL PELACAKAN UNIT
                </h2>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  Pantau progres kalibrasi injektor, pompa bahan bakar, dan turbocharger kendaraan Anda secara real-time langsung dari ruang uji Indo Teknik.
                </p>
              </motion.div>
            </>
          )}

          <form onSubmit={handleSearchSubmit} className={workOrder ? "relative w-full md:max-w-md group" : "relative w-full max-w-lg group mt-1"}>
            <div 
              className={workOrder 
                ? "absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl blur opacity-15 group-focus-within:opacity-35 transition-all" 
                : "absolute -inset-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition-all duration-300"
              } 
            />
            <div className={workOrder ? "relative flex" : "relative flex items-center bg-black/60 border border-white/10 rounded-xl overflow-hidden p-1 sm:p-1.5"}>
              <input 
                type="text"
                placeholder="Masukkan No. SPK (e.g. WO-2026-0001)"
                className={workOrder 
                  ? "w-full bg-black/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs font-mono font-semibold tracking-wide text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/15 transition-all uppercase" 
                  : "w-full bg-transparent border-0 py-2.5 sm:py-3 pl-9 sm:pl-11 pr-32 sm:pr-48 text-xs sm:text-sm font-mono font-semibold tracking-wider text-white placeholder-slate-500 placeholder:text-[10px] sm:placeholder:text-sm focus:outline-none focus:ring-0 uppercase"
                }
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <Search className={workOrder ? "w-4 h-4 text-slate-500 absolute left-3 top-3" : "w-4 h-4 text-slate-400 absolute left-3 sm:left-4 top-3.5 sm:top-4"} />
              <button
                type="submit"
                className={workOrder 
                  ? "absolute right-1.5 top-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[9px] font-bold font-mono uppercase tracking-wider transition-all" 
                  : "absolute right-1.5 sm:right-2 top-1.5 sm:top-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-[10px] sm:text-xs font-black font-mono uppercase tracking-widest transition-all shadow-md shadow-blue-500/25 active:scale-95 cursor-pointer whitespace-nowrap"
                }
              >
                {workOrder ? "Lacak" : "Mulai Lacak"}
              </button>
            </div>
          </form>

          {workOrder && (
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <div className="flex bg-black/60 p-1 border border-white/5 rounded-xl">
                <button
                  type="button"
                  onClick={() => setIsAdvancedView(false)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${!isAdvancedView ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  <Eye className="w-3.5 h-3.5" /> Simple View
                </button>
                <button
                  type="button"
                  onClick={() => setIsAdvancedView(true)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${isAdvancedView ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  <Sliders className="w-3.5 h-3.5" /> Technical View
                </button>
              </div>

              <button
                onClick={() => {
                  setShowDigitalCard(true);
                  generateCanvasCard();
                }}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-blue-400 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 font-mono"
              >
                <QrCode className="w-3.5 h-3.5" /> Certificate
              </button>
            </div>
          )}

          {!workOrder && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full border-t border-white/5 pt-8 text-left"
            >
              <div className="bg-white/[0.01] border border-white/5 p-4 rounded-xl space-y-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                  <Activity className="w-4 h-4" />
                </div>
                <h4 className="text-[11px] font-mono font-bold text-slate-200 uppercase tracking-wide">Live Telemetri</h4>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Pantau fluktuasi tekanan bertenaga tinggi & grafik nozzle secara real-time.
                </p>
              </div>

              <div className="bg-white/[0.01] border border-white/5 p-4 rounded-xl space-y-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                  <QrCode className="w-4 h-4" />
                </div>
                <h4 className="text-[11px] font-mono font-bold text-slate-200 uppercase tracking-wide">Sertifikat Digital</h4>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Unduh sertifikat kalibrasi resmi yang dilengkapi QR Code penjamin keaslian.
                </p>
              </div>

              <div className="bg-white/[0.01] border border-white/5 p-4 rounded-xl space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h4 className="text-[11px] font-mono font-bold text-slate-200 uppercase tracking-wide">Garansi Authorized</h4>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Perlindungan garansi resmi servis s/d 6 bulan dengan dukungan suku cadang original.
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-blue-500/10 border-t-blue-500 animate-spin"></div>
              <Compass className="w-5 h-5 text-blue-400 animate-pulse" />
            </div>
            <div className="text-center font-mono">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-300">Menghubungkan ke Database Workshop</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Sinkronisasi status...</p>
            </div>
          </div>
        )}

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-500/5 border border-red-500/20 p-5 rounded-2xl flex items-start gap-4 text-red-200 text-xs sm:text-sm max-w-lg mx-auto shadow-2xl backdrop-blur-md"
          >
            <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h4 className="font-mono font-bold text-red-400 uppercase tracking-wide">Pencarian Gagal</h4>
              <p className="text-xs mt-1 text-slate-300 leading-relaxed">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Real-time Work Order Details Display */}
        {workOrder && !loading && (
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-6"
          >
            {/* Top Overview Bar */}
            <div className="bg-gradient-to-r from-[#0d1527] to-[#080d17] border border-blue-500/20 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500 animate-pulse" />
              <div className="flex items-center gap-3">
                <div className="relative flex h-3 w-3 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">No. SPK / WO:</span>
                    <span className="font-mono text-sm font-black text-blue-400 tracking-wider">{workOrder.id}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">Status diperbarui oleh Tim Technical secara real-time. Terakhir disinkronkan: {lastSync || 'Satu arah'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
                <span className="text-[10px] text-slate-400 font-mono bg-white/[0.04] px-2.5 py-1 rounded border border-white/5">
                  Priority: {workOrder.priority === 1 ? 'URGENT' : workOrder.priority === 2 ? 'STANDARD' : 'LOW'}
                </span>
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 text-[10px] font-bold font-mono uppercase tracking-wider border border-blue-500/20 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                >
                  <Share2 className="w-3.5 h-3.5" /> {copied ? 'Tersalin' : 'Salin Link'}
                </button>
              </div>
            </div>

            {/* MAIN DASHBOARD MULTI-COLUMN CONTAINER */}
            {!isAdvancedView ? (
              /* =======================================
                 SIMPLE CUSTOMER CLEAN VIEW
                 ======================================= */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Visual Radial Gauge Card (Stage status) */}
                <div className="lg:col-span-4 bg-slate-900/60 border border-blue-500/15 rounded-2xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex flex-col items-center text-center">
                    <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="72" cy="72" r="60" className="stroke-slate-800" strokeWidth="8" fill="transparent" />
                        <motion.circle
                          cx="72"
                          cy="72"
                          r="60"
                          className="stroke-blue-500"
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray={2 * Math.PI * 60}
                          initial={{ strokeDashoffset: 2 * Math.PI * 60 }}
                          animate={{ strokeDashoffset: 2 * Math.PI * 60 - (activeMilestoneIndex / 7) * (2 * Math.PI * 60) }}
                          transition={{ duration: 0.8 }}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center justify-center text-center font-mono">
                        <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
                          {Math.round((activeMilestoneIndex / 7) * 100)}%
                        </span>
                        <span className="text-[8px] font-bold tracking-widest text-slate-400 uppercase mt-0.5">Progres</span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <span className="text-[9px] font-mono font-bold uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-full">
                        Tahap {activeMilestoneIndex + 1}/7
                      </span>
                      <h3 className="text-base font-black text-white uppercase mt-2.5 tracking-wide">
                        {GENERAL_TRACKING_MILESTONES[Math.min(activeMilestoneIndex, 6)]?.label}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-[280px]">
                        {GENERAL_TRACKING_MILESTONES[Math.min(activeMilestoneIndex, 6)]?.desc}
                      </p>
                    </div>

                    <div className="mt-6 pt-5 border-t border-white/5 w-full text-left space-y-3.5">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-emerald-400" />
                        <div>
                          <span className="text-[8px] font-mono text-slate-500 uppercase block">Estimasi Pengerjaan</span>
                          <span className="text-xs font-bold text-slate-200">{workOrder.estimasiPengerjaan || 'Sedang dianalisa'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-emerald-400" />
                        <div>
                          <span className="text-[8px] font-mono text-slate-500 uppercase block">Jaminan Proteksi Garansi</span>
                          <span className="text-xs font-bold text-slate-200">{workOrder.garansi || '6 Bulan Kalibrasi Authorized'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Workflow Stepper Grid (Journey detail) */}
                <div className="lg:col-span-8 bg-slate-900/40 border border-white/5 rounded-2xl p-5 shadow-2xl backdrop-blur-md space-y-4">
                  <h3 className="text-xs font-mono font-black tracking-widest text-slate-200 uppercase flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-blue-400" /> Alur Perjalanan & Pemeriksaan Unit
                  </h3>

                  <div className="space-y-3">
                    {GENERAL_TRACKING_MILESTONES.map((m, idx) => {
                      const isCompleted = idx < activeMilestoneIndex;
                      const isActive = idx === activeMilestoneIndex;
                      const isExpanded = !!expandedMilestones[idx];

                      return (
                        <div key={m.id} className={`border rounded-xl transition-all ${isActive ? 'bg-blue-600/5 border-blue-500/30' : isCompleted ? 'bg-black/10 border-white/5' : 'bg-transparent border-white/5 opacity-60'}`}>
                          <button
                            type="button"
                            onClick={() => setExpandedMilestones(prev => ({ ...prev, [idx]: !prev[idx] }))}
                            className="w-full py-3.5 px-4 flex items-center justify-between text-left cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              {isCompleted ? (
                                <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                                  <Check className="w-3 h-3 stroke-[3]" />
                                </div>
                              ) : isActive ? (
                                <div className="w-5 h-5 rounded-full bg-blue-600 border border-blue-400 flex items-center justify-center text-white font-mono text-[9px] font-black shrink-0 animate-pulse">
                                  {idx + 1}
                                </div>
                              ) : (
                                <div className="w-5 h-5 rounded-full bg-slate-800 border border-white/5 flex items-center justify-center text-slate-500 font-mono text-[9px] shrink-0">
                                  {idx + 1}
                                </div>
                              )}
                              <div>
                                <span className={`text-xs font-black block tracking-wide ${isActive ? 'text-blue-400' : 'text-slate-200'}`}>
                                  {m.label}
                                </span>
                                <span className="text-[10px] text-slate-400 font-light mt-0.5 block">{m.desc}</span>
                              </div>
                            </div>
                            <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                          </button>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="px-4 pb-4 pt-1 border-t border-white/5 bg-black/15 text-xs text-slate-300 space-y-2"
                              >
                                <span className="text-[8px] font-mono font-bold tracking-widest text-slate-400 uppercase block mb-2">Checklist Quality Control</span>
                                {SUB_CHECKLISTS[idx]?.map((checkItem, checkIdx) => (
                                  <div key={checkIdx} className="flex items-start gap-2 text-[11px] leading-relaxed">
                                    {isCompleted ? (
                                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5 stroke-[3]" />
                                    ) : isActive ? (
                                      <div className="w-3.5 h-3.5 rounded-full border border-blue-500/40 flex items-center justify-center shrink-0 mt-0.5 bg-blue-500/5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                                      </div>
                                    ) : (
                                      <div className="w-3.5 h-3.5 rounded-full border border-white/5 shrink-0 mt-0.5 bg-white/[0.02]" />
                                    )}
                                    <span>{checkItem}</span>
                                  </div>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Technical unit summary & logs */}
                <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Customer & Vehicle Info */}
                  <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-5 shadow-2xl backdrop-blur-md space-y-3.5">
                    <h4 className="text-[10px] font-mono font-black text-slate-200 uppercase tracking-widest flex items-center gap-1.5 border-b border-white/5 pb-2">
                      <Car className="w-4 h-4 text-blue-400" /> Identitas Unit & Pelanggan
                    </h4>
                    <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs">
                      <div>
                        <span className="text-slate-500 text-[8px] font-mono uppercase block">Pelanggan</span>
                        <span className="font-bold text-white mt-0.5 block truncate">{workOrder.customerName}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[8px] font-mono uppercase block">No. Telepon</span>
                        <span className="font-mono font-bold text-slate-300 mt-0.5 block">{maskText(workOrder.customerPhone)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[8px] font-mono uppercase block">Metode Penyerahan</span>
                        <span className="font-semibold text-slate-300 block mt-0.5">
                          {workOrder.dropMethod === 'PARTS' ? 'Komponen Langsung' : 'Unit Kendaraan'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[8px] font-mono uppercase block">Tanggal Masuk</span>
                        <span className="font-semibold text-slate-300 block mt-0.5">
                          {workOrder.intakeDate ? new Date(workOrder.intakeDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Gejala Keluhan */}
                  <div className="bg-amber-500/[0.02] border border-amber-500/10 rounded-2xl p-5 shadow-2xl backdrop-blur-md space-y-2">
                    <h4 className="text-[10px] font-mono font-black text-amber-500 uppercase tracking-widest flex items-center gap-1.5 border-b border-amber-500/10 pb-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" /> Keluhan Utama (Customer Voice)
                    </h4>
                    <p className="text-slate-300 font-light leading-relaxed text-xs italic">
                      "{workOrder.customerVoice || 'Tidak ada keluhan spesifik yang dicatat oleh Service Advisor.'}"
                    </p>
                  </div>

                  {/* Quick SA Support Desk */}
                  <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-5 shadow-2xl backdrop-blur-md flex flex-col justify-between gap-4">
                    <div className="space-y-1.5">
                      <h4 className="text-[10px] font-mono font-black text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
                        <PhoneCall className="w-4 h-4 text-emerald-400" /> Hubungi Service Advisor
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Ada pertanyaan mengenai opsi perbaikan atau ingin mengonfirmasi tindakan? Silakan langsung hubungi SA kami.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleContactSaClick('progress')}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                      <PhoneCall className="w-3.5 h-3.5" /> Chat via WhatsApp
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              /* =======================================
                 ADVANCED LABORATORY DIAGNOSTIC VIEW (12-Column Grid)
                 ======================================= */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* LEFT SIDEBAR: Unit summary, notes, checklist (Col-span-4) */}
                <div className="lg:col-span-4 space-y-6">
                  
                  {/* Advanced Unit Summary Panel */}
                  <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 shadow-2xl backdrop-blur-md space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                      <h3 className="text-xs font-mono font-black text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                        <ClipboardList className="w-4 h-4 text-blue-400" /> Spatiales Unit Metadata
                      </h3>
                      <span className="text-[8px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase font-bold">
                        {workOrder.dropMethod}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-slate-500 text-[8px] font-mono uppercase block">Customer Owner</span>
                        <span className="font-bold text-white block mt-0.5 truncate">{workOrder.customerName}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[8px] font-mono uppercase block">Phone Contact</span>
                        <span className="font-mono text-slate-300 block mt-0.5">{maskText(workOrder.customerPhone)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[8px] font-mono uppercase block">Vehicle / Engine Type</span>
                        <span className="font-bold text-slate-200 block mt-0.5 truncate">{workOrder.vehicleBrand || 'Kirim Komponen'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[8px] font-mono uppercase block">Odometer Log</span>
                        <span className="font-bold text-slate-300 block mt-0.5">{workOrder.odometer ? `${workOrder.odometer} Km` : 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[8px] font-mono uppercase block">Plate Number</span>
                        <span className="font-mono font-black text-blue-400 block mt-0.5">{workOrder.plateNumber || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[8px] font-mono uppercase block">Fuel Status</span>
                        <span className={`text-[9px] font-bold mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded ${workOrder.fuelContaminated ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'}`}>
                          <span className={`w-1 h-1 rounded-full ${workOrder.fuelContaminated ? 'bg-red-400 animate-pulse' : 'bg-emerald-400'}`} />
                          {workOrder.fuelContaminated ? 'SOLAR KOTOR (HAZARD)' : 'BERSIH (OK)'}
                        </span>
                      </div>
                    </div>

                    {/* Loose Parts Identifikasi if available */}
                    {workOrder.looseParts && workOrder.looseParts.length > 0 && (
                      <div className="border-t border-white/5 pt-3 space-y-2">
                        <span className="text-[8px] font-mono text-slate-500 uppercase block tracking-wider">Identifikasi Fisik Komponen Masuk</span>
                        <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                          {workOrder.looseParts.map((p, idx) => (
                            <div key={idx} className="bg-black/40 border border-white/5 p-2 rounded-lg text-[10px] space-y-1">
                              <div className="flex justify-between font-bold text-slate-300">
                                <span>{p.description}</span>
                                <span className="font-mono text-blue-400 text-[9px]">SN: {p.partNumber}</span>
                              </div>
                              <p className="text-[9px] text-slate-500 truncate">{p.physicalCondition}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Live Historical Activity Log */}
                  {workOrder.milestoneHistory && workOrder.milestoneHistory.length > 0 && (
                    <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 shadow-2xl backdrop-blur-md space-y-3.5">
                      <h4 className="text-[10px] font-mono font-black tracking-widest text-slate-200 uppercase flex items-center gap-1.5 border-b border-white/5 pb-2">
                        <Clock className="w-4 h-4 text-blue-400 animate-pulse" /> Telemetry Timeline Logs
                      </h4>
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1.5">
                        {workOrder.milestoneHistory.map((log, index) => (
                          <div key={index} className="bg-black/30 border border-white/5 rounded-xl p-2.5 flex justify-between items-center text-[10px] hover:border-white/15 transition-all">
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
                              <div>
                                <span className="font-bold text-slate-200 block">{log.milestone}</span>
                                <span className="text-[8px] text-slate-500 block">Tech: {log.updatedBy}</span>
                              </div>
                            </div>
                            <div className="text-right shrink-0 font-mono text-[8px] text-slate-400">
                              <span className="text-slate-300 font-bold block">
                                {new Date(log.timestamp).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' })}
                              </span>
                              <span>
                                {new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* RIGHT AREA: Component Explorer & Calibration workstation (Col-span-8) */}
                <div className="lg:col-span-8 space-y-6">
                  
                  {/* COMPONENT EXPLORER */}
                  <div className="bg-gradient-to-br from-[#0a0d16] to-[#04070c] border border-white/10 rounded-2xl p-5 shadow-2xl relative overflow-hidden backdrop-blur-md space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <div className="flex items-center gap-2">
                        <Compass className="w-5 h-5 text-blue-400 animate-spin-slow" />
                        <div>
                          <h4 className="text-xs font-mono font-black tracking-widest text-slate-200 uppercase">INTERACTIVE COMPONENT BLUEPRINT EXPLORER</h4>
                          <p className="text-[8px] text-slate-500 font-mono uppercase tracking-widest">Digital Model Inspection Workshop</p>
                        </div>
                      </div>
                      <span className="text-[8px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 uppercase font-black tracking-wider">
                        ISO COMPLIANT
                      </span>
                    </div>

                    {/* Selector Tabs */}
                    <div className="grid grid-cols-4 gap-2">
                      {(Object.keys(COMPONENT_DATA) as Array<keyof typeof COMPONENT_DATA>).map((key) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => {
                            setInspectorType(key);
                            setActiveHotspot(COMPONENT_DATA[key].hotspots[0].id);
                          }}
                          className={`py-2 px-1 rounded-xl text-[9px] font-bold uppercase font-mono tracking-wider transition-all border text-center flex flex-col items-center gap-1.5 cursor-pointer ${
                            inspectorType === key
                              ? 'bg-blue-600/15 border-blue-500 text-white shadow-lg shadow-blue-500/10'
                              : 'bg-black/30 border-white/5 text-slate-400 hover:text-slate-200 hover:border-white/10'
                          }`}
                        >
                          {COMPONENT_DATA[key].icon}
                          <span>{COMPONENT_DATA[key].title.split(' ')[0]}</span>
                        </button>
                      ))}
                    </div>

                    {/* Exploded Workspace Control Overlays & SVG Blueprint View */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
                      
                      {/* SVG Blueprint Engine Visualizer (Col-span-7) */}
                      <div className="md:col-span-7 relative h-64 bg-black/70 border border-white/5 rounded-2xl flex items-center justify-center overflow-hidden group">
                        
                        {/* Background engineering matrix lines */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.003)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.003)_1px,transparent_1px)] bg-[size:16px_16px]" />
                        <div className="absolute inset-0 bg-radial-gradient(circle, rgba(59,130,246,0.05)_0%, transparent_80%) pointer-events-none" />

                        {/* Interactive dynamic blueprint SVG */}
                        <motion.div 
                          className="w-full h-full p-4 flex items-center justify-center relative transition-all duration-300"
                          style={{
                            scale: zoomLevel,
                            rotate: `${rotationAngle}deg`,
                          }}
                        >
                          {inspectorType === 'injector' && (
                            <svg className="w-full h-full max-h-[220px]" viewBox="0 0 300 180" xmlns="http://www.w3.org/2000/svg">
                              {/* Pulsing Fuel Flow Paths */}
                              {isSimulatingTest && (
                                <g className="opacity-75">
                                  <line x1="80" y1="65" x2="140" y2="65" stroke="#3b82f6" strokeWidth="4" strokeDasharray="5,5" className="animate-pulse" />
                                  <path d="M 140 65 L 150 65 L 150 140" stroke="#3b82f6" strokeWidth="3.5" strokeDasharray="3,3" />
                                  {/* Nozzle Spray Patterns */}
                                  <line x1="150" y1="140" x2="130" y2="165" stroke="#60a5fa" strokeWidth="2.5" strokeDasharray="2,2" />
                                  <line x1="150" y1="140" x2="150" y2="170" stroke="#60a5fa" strokeWidth="2.5" strokeDasharray="2,2" />
                                  <line x1="150" y1="140" x2="170" y2="165" stroke="#60a5fa" strokeWidth="2.5" strokeDasharray="2,2" />
                                </g>
                              )}

                              {/* Exploded Actuator Group */}
                              <g transform={`translate(0, ${-explodedOffset * 0.8})`} className="transition-transform duration-300">
                                <rect x="130" y="10" width="40" height="30" rx="3" fill="#1e293b" stroke={activeHotspot === 'valve' ? '#60a5fa' : '#475569'} strokeWidth="1.5" />
                                <text x="150" y="28" fill="#94a3b8" fontSize="8" fontFamily="monospace" textAnchor="middle">SOLENOID</text>
                                <circle cx="150" cy="25" r="1.5" fill="#e2e8f0" />
                              </g>

                              {/* Exploded Inlet Feed & Body Group */}
                              <g className="transition-transform duration-300">
                                <path d="M 120 50 L 180 50 L 170 110 L 130 110 Z" fill="#334155" stroke={activeHotspot === 'body' ? '#60a5fa' : '#475569'} strokeWidth="1.5" />
                                <text x="150" y="80" fill="#f8fafc" fontSize="9" fontFamily="monospace" textAnchor="middle">INJECTOR BODY</text>
                                <line x1="120" y1="65" x2="80" y2="65" stroke="#475569" strokeWidth="2.5" />
                              </g>

                              {/* Exploded Adjustable Shims */}
                              <g transform={`translate(0, ${explodedOffset * 0.4})`} className="transition-transform duration-300">
                                <rect x="140" y="114" width="20" height="6" rx="1" fill="#e2e8f0" stroke={activeHotspot === 'shim' ? '#60a5fa' : '#475569'} strokeWidth="1.5" />
                                <text x="150" y="119" fill="#0f172a" fontSize="5" fontWeight="bold" textAnchor="middle">SHIM</text>
                              </g>

                              {/* Exploded Nozzle Tip Group */}
                              <g transform={`translate(0, ${explodedOffset * 0.9})`} className="transition-transform duration-300">
                                <path d="M 135 124 L 165 124 L 150 150 Z" fill="#0f172a" stroke={activeHotspot === 'tip' ? '#60a5fa' : '#475569'} strokeWidth="1.5" />
                                <text x="150" y="140" fill="#94a3b8" fontSize="6" fontFamily="monospace" textAnchor="middle">NOZZLE</text>
                              </g>

                              {/* Hotspots Trigger Overlays */}
                              <g className="cursor-pointer">
                                <circle cx="150" cy="25" r="7" fill="transparent" onClick={() => setActiveHotspot('valve')} />
                                <circle cx="150" cy="80" r="10" fill="transparent" onClick={() => setActiveHotspot('body')} />
                                <circle cx="150" cy="117" r="6" fill="transparent" onClick={() => setActiveHotspot('shim')} />
                                <circle cx="150" cy="140" r="8" fill="transparent" onClick={() => setActiveHotspot('tip')} />
                              </g>
                            </svg>
                          )}

                          {inspectorType === 'pump' && (
                            <svg className="w-full h-full max-h-[220px]" viewBox="0 0 300 180" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="150" cy="90" r="45" fill="#1e293b" stroke={activeHotspot === 'casing' ? '#3b82f6' : '#475569'} strokeWidth="2" />
                              <circle cx="150" cy="90" r="20" fill="#0f172a" stroke={activeHotspot === 'shaft' ? '#3b82f6' : '#64748b'} className={isSimulatingTest ? 'origin-center animate-spin' : ''} />
                              <g transform={`translate(${explodedOffset * 0.8}, 0)`}>
                                <rect x="210" y="75" width="20" height="30" rx="2" fill="#334155" stroke={activeHotspot === 'scv' ? '#3b82f6' : '#475569'} strokeWidth="1.5" />
                              </g>
                              <g transform={`translate(0, ${-explodedOffset * 0.8})`}>
                                <rect x="144" y="25" width="12" height="25" rx="1" fill="#475569" stroke={activeHotspot === 'plunger' ? '#3b82f6' : '#64748b'} strokeWidth="1.5" />
                              </g>
                              <text x="150" y="150" fill="#94a3b8" fontSize="8" fontFamily="monospace" textAnchor="middle">PUMP CASING BLUEPRINT</text>
                            </svg>
                          )}

                          {inspectorType === 'turbo' && (
                            <svg className="w-full h-full max-h-[220px]" viewBox="0 0 300 180" xmlns="http://www.w3.org/2000/svg">
                              <path d="M 120 40 Q 150 15 180 40 L 170 85 L 130 85 Z" fill="#334155" stroke={activeHotspot === 'comp' ? '#3b82f6' : '#475569'} strokeWidth="1.5" />
                              <g transform={`translate(0, ${explodedOffset * 0.6})`}>
                                <line x1="80" y1="95" x2="220" y2="95" stroke={activeHotspot === 'shaft_turbo' ? '#3b82f6' : '#64748b'} strokeWidth="3" />
                              </g>
                              <g transform={`translate(${explodedOffset * 0.8}, 0)`}>
                                <rect x="190" y="105" width="22" height="18" fill="#1e293b" stroke={activeHotspot === 'vgt' ? '#3b82f6' : '#475569'} strokeWidth="1.5" />
                              </g>
                              <text x="150" y="160" fill="#94a3b8" fontSize="8" fontFamily="monospace" textAnchor="middle">VGT TURBO BLUEPRINT</text>
                            </svg>
                          )}

                          {inspectorType === 'rail' && (
                            <svg className="w-full h-full max-h-[220px]" viewBox="0 0 300 180" xmlns="http://www.w3.org/2000/svg">
                              <rect x="60" y="80" width="180" height="20" rx="3" fill="#1e293b" stroke={activeHotspot === 'rail_body' ? '#3b82f6' : '#475569'} strokeWidth="2" />
                              <g transform={`translate(${-explodedOffset * 0.8}, 0)`}>
                                <rect x="40" y="73" width="16" height="34" rx="1" fill="#334155" stroke={activeHotspot === 'sensor' ? '#3b82f6' : '#64748b'} strokeWidth="1.5" />
                              </g>
                              <g transform={`translate(${explodedOffset * 0.8}, 0)`}>
                                <rect x="244" y="73" width="16" height="34" rx="1" fill="#334155" stroke={activeHotspot === 'limiter' ? '#3b82f6' : '#64748b'} strokeWidth="1.5" />
                              </g>
                              <text x="150" y="140" fill="#94a3b8" fontSize="8" fontFamily="monospace" textAnchor="middle">COMMON RAIL ACCUMULATOR</text>
                            </svg>
                          )}
                        </motion.div>

                        {/* Interactive overlay labels & scan guides */}
                        {isSimulatingTest && (
                          <div className="absolute inset-y-0 w-0.5 bg-gradient-to-b from-transparent via-cyan-400 to-transparent shadow-[0_0_10px_#22d3ee] pointer-events-none left-[25%] animate-[scan_2.8s_linear_infinite]" />
                        )}

                        <div className="absolute bottom-2 left-3 text-[7.5px] font-mono text-slate-500 tracking-wider">
                          ROT: {rotationAngle}° | ZOOM: {zoomLevel.toFixed(1)}x | MODE: {activeDiagnosticMode.toUpperCase()}
                        </div>
                      </div>

                      {/* Diagnostic Overlay & Controls (Col-span-5) */}
                      <div className="md:col-span-5 flex flex-col justify-between space-y-4">
                        <div className="bg-black/40 border border-white/5 rounded-2xl p-4 space-y-3 font-mono">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block border-b border-white/5 pb-1.5">Model Control Unit</span>
                          
                          {/* Zoom range */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[8px] text-slate-400">
                              <span>Scale Zoom Level</span>
                              <span className="text-blue-400 font-bold">{zoomLevel.toFixed(1)}x</span>
                            </div>
                            <input 
                              type="range" min="0.7" max="1.5" step="0.1" value={zoomLevel} onChange={(e) => setZoomLevel(Number(e.target.value))}
                              className="w-full h-1 bg-slate-800 rounded appearance-none accent-blue-500"
                            />
                          </div>

                          {/* Rotate angle */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[8px] text-slate-400">
                              <span>Isometric Rotation</span>
                              <span className="text-blue-400 font-bold">{rotationAngle}°</span>
                            </div>
                            <input 
                              type="range" min="-180" max="180" step="10" value={rotationAngle} onChange={(e) => setRotationAngle(Number(e.target.value))}
                              className="w-full h-1 bg-slate-800 rounded appearance-none accent-blue-500"
                            />
                          </div>

                          {/* Explode Offset */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[8px] text-slate-400">
                              <span>Exploded View Clearance</span>
                              <span className="text-emerald-400 font-bold">{explodedOffset}mm</span>
                            </div>
                            <input 
                              type="range" min="0" max="35" step="1" value={explodedOffset} onChange={(e) => setExplodedOffset(Number(e.target.value))}
                              className="w-full h-1 bg-slate-800 rounded appearance-none accent-emerald-500"
                            />
                          </div>

                          {/* Diagnostics overlay selection */}
                          <div className="grid grid-cols-3 gap-1.5 pt-1.5">
                            {['structural', 'fluid', 'thermal'].map((m) => (
                              <button
                                key={m}
                                type="button"
                                onClick={() => setActiveDiagnosticMode(m as any)}
                                className={`py-1 rounded text-[8px] font-bold uppercase transition-all cursor-pointer ${activeDiagnosticMode === m ? 'bg-blue-600 text-white' : 'bg-white/[0.02] text-slate-400 border border-white/5 hover:text-white'}`}
                              >
                                {m}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Hotspot details focus card */}
                        <div className="bg-black/50 border border-blue-500/10 rounded-2xl p-3.5 space-y-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[8px] bg-blue-500/10 text-blue-300 border border-blue-500/20 px-2 py-0.5 rounded font-black font-mono uppercase">
                              {currentHotspot.label}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-300 leading-relaxed font-light">
                            {currentHotspot.desc}
                          </p>
                          <div className="bg-blue-950/15 border border-blue-900/30 rounded p-2 text-[9.5px] text-blue-300 flex items-start gap-1.5 font-mono">
                            <Wrench className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold block uppercase text-[8px] tracking-wider text-blue-400">Rekomendasi Kalibrasi:</span>
                              {currentHotspot.action}
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>

                  </div>

                  {/* HIGH-FIDELITY CALIBRATION LABORATORY STATION (GAME MODE) */}
                  <div className="bg-gradient-to-br from-[#070b14] to-[#04070a] border border-blue-500/25 rounded-2xl p-5 shadow-2xl relative overflow-hidden backdrop-blur-md space-y-4">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.001)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.001)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
                    
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <div className="flex items-center gap-2">
                        <Sliders className="w-5 h-5 text-emerald-400" />
                        <div>
                          <h4 className="text-xs font-mono font-black tracking-widest text-slate-200 uppercase">ITECH EPS-815 CALIBRATION WORKSTATION</h4>
                          <p className="text-[8px] text-slate-500 font-mono uppercase tracking-widest">Real-time Solenoid & Pressure Simulator</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1.5 bg-black/60 p-1 border border-white/5 rounded-lg">
                        {['novice', 'pro', 'master'].map((diff) => (
                          <button
                            key={diff}
                            type="button"
                            onClick={() => handleDifficultyChange(diff as any)}
                            className={`px-1.5 py-0.5 rounded text-[7px] font-bold uppercase transition-all cursor-pointer ${calibrationDifficulty === diff ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                          >
                            {diff}
                          </button>
                        ))}
                      </div>
                    </div>

                    <p className="text-[10px] sm:text-[11px] text-slate-400 leading-relaxed font-light">
                      Uji insting teknis Anda! Atur ketebalan shim spacer, tekanan solar, dan arus katup SCV untuk menyelaraskan parameter dengan target tekanan uji <span className="text-blue-400 font-mono font-bold">{gameTargetPressure} Bar</span>.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
                      
                      {/* Left: Tuning Workstation Controls (Col-span-6) */}
                      <div className="md:col-span-6 space-y-3.5 bg-black/45 border border-white/5 p-4 rounded-xl flex flex-col justify-between">
                        <span className="text-[8.5px] font-mono font-bold text-slate-400 uppercase tracking-wider block border-b border-white/5 pb-1">Precision Parameters Panel</span>
                        
                        {/* Shim Thickness */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] font-mono">
                            <span className="text-slate-400">1. Adjusting Shim Spacer Sizing</span>
                            <span className="text-blue-400 font-bold">{gameShimThickness.toFixed(3)} mm</span>
                          </div>
                          <input 
                            type="range" min="1.000" max="1.500" step="0.005" value={gameShimThickness} onChange={(e) => setGameShimThickness(Number(e.target.value))}
                            className="w-full h-1 bg-slate-800 rounded appearance-none accent-blue-500"
                          />
                          <div className="flex justify-between text-[7px] text-slate-500 font-mono">
                            <span>Sangat Longgar</span>
                            <span>Ideal: 1.250 mm</span>
                            <span>Sangat Rapat</span>
                          </div>
                        </div>

                        {/* Target Rail Pressure Input */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] font-mono">
                            <span className="text-slate-400">2. Fuel System Compression Force</span>
                            <span className="text-amber-400 font-bold">{gameRailPressure} Bar</span>
                          </div>
                          <input 
                            type="range" min="1000" max="2400" step="25" value={gameRailPressure} onChange={(e) => setGameRailPressure(Number(e.target.value))}
                            className="w-full h-1 bg-slate-800 rounded appearance-none accent-amber-500"
                          />
                          <div className="flex justify-between text-[7px] text-slate-500 font-mono">
                            <span>Rendah (1000 Bar)</span>
                            <span>Optimal: {gameTargetPressure} Bar</span>
                            <span>Ekstrem (2400 Bar)</span>
                          </div>
                        </div>

                        {/* SCV Current Input */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] font-mono">
                            <span className="text-slate-400">3. Suction Control Valve (SCV) Input</span>
                            <span className="text-emerald-400 font-bold">{gameScvCurrent.toFixed(2)} Ampere</span>
                          </div>
                          <input 
                            type="range" min="0.50" max="2.00" step="0.05" value={gameScvCurrent} onChange={(e) => setGameScvCurrent(Number(e.target.value))}
                            className="w-full h-1 bg-slate-800 rounded appearance-none accent-emerald-500"
                          />
                          <div className="flex justify-between text-[7px] text-slate-500 font-mono">
                            <span>Buka Penuh</span>
                            <span>Ideal: 1.20 A</span>
                            <span>Tutup Penuh</span>
                          </div>
                        </div>

                        {/* Interactive sound toggler */}
                        <div className="flex justify-between items-center border-t border-white/5 pt-2 mt-1">
                          <button
                            type="button"
                            onClick={() => setIsMuted(!isMuted)}
                            className="text-slate-400 hover:text-slate-200 text-[8px] font-mono flex items-center gap-1.5 transition-all"
                          >
                            {isMuted ? <VolumeX className="w-3 h-3 text-red-400" /> : <Volume2 className="w-3 h-3 text-emerald-400 animate-pulse" />}
                            {isMuted ? 'MUTE SYNTH' : 'AUDIO FEEDBACK ON'}
                          </button>

                          <button
                            type="button"
                            onClick={handleRunCalibrationChallenge}
                            disabled={gameIsRunning}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-600/10 cursor-pointer"
                          >
                            <Play className="w-2.5 h-2.5 fill-current" /> Jalankan Pengujian
                          </button>
                        </div>
                      </div>

                      {/* Right: Live Telemetry Gauges, Oscilloscope and Diagnostics Dashboard (Col-span-6) */}
                      <div className="md:col-span-6 flex flex-col justify-between space-y-4">
                        
                        {/* Real-time Oscilloscope, Gauges & Meter Indicators */}
                        <div className="bg-[#05080f] border border-white/5 rounded-xl p-3.5 space-y-3 font-mono">
                          
                          {/* Radial Dual-Needle Gauge SVG */}
                          <div className="flex justify-between items-center">
                            <span className="text-[8px] text-slate-500 uppercase tracking-wider font-bold">Calibration Laboratory Monitors</span>
                            <span className="text-[7px] text-slate-400 bg-white/5 border border-white/10 px-1 rounded">ITECH SYSTEM READY</span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="bg-white/[0.01] border border-white/5 p-2 rounded-lg">
                              <span className="text-[7.5px] text-slate-500 uppercase block">Actual Force</span>
                              <span className="text-xs font-black text-blue-400 block mt-0.5">{gameRailPressure} <span className="text-[7px] text-slate-500">Bar</span></span>
                            </div>
                            <div className="bg-white/[0.01] border border-white/5 p-2 rounded-lg">
                              <span className="text-[7.5px] text-slate-500 uppercase block">Dynamic Target</span>
                              <span className="text-xs font-black text-amber-400 block mt-0.5">{gameTargetPressure} <span className="text-[7px] text-slate-500">Bar</span></span>
                            </div>
                            <div className="bg-white/[0.01] border border-white/5 p-2 rounded-lg">
                              <span className="text-[7.5px] text-slate-500 uppercase block">System Score</span>
                              <span className={`text-xs font-black block mt-0.5 ${metrics.rankColor}`}>{metrics.score}% ({metrics.rank})</span>
                            </div>
                          </div>

                          {/* Oscilloscope View */}
                          <div className="pt-2 border-t border-white/5">
                            <div className="flex justify-between text-[7px] text-slate-500 uppercase mb-1">
                              <span>Signal Line Oscilloscope</span>
                              <span className="text-emerald-400">FREQ: {isSimulatingTest || gameIsRunning ? '180Hz' : 'Standby'}</span>
                            </div>
                            <div className="h-10 bg-slate-950 rounded border border-white/5 flex items-center justify-center relative overflow-hidden">
                              <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                                <path 
                                  d={`M 0,20 Q 75,${10 + Math.sin(waveSeed * 0.5) * 8} 150,20 T 300,20`} 
                                  fill="none" 
                                  stroke={metrics.score >= 80 ? '#10b981' : '#f43f5e'} 
                                  strokeWidth="1.5" 
                                  className="transition-all"
                                />
                              </svg>
                            </div>
                          </div>

                          {/* Predicted Engine Outcomes Meter */}
                          <div className="space-y-1.5 pt-2 border-t border-white/5 text-[9px]">
                            <div className="flex justify-between items-center">
                              <span className="text-slate-500">Predicted Smoke Density:</span>
                              <span className={`font-black ${metrics.smokeLevel > 50 ? 'text-red-400' : 'text-emerald-400'}`}>{metrics.smokeLevel}%</span>
                            </div>
                            <div className="w-full bg-slate-950 h-1 rounded overflow-hidden">
                              <div className={`h-full transition-all ${metrics.smokeLevel > 50 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${metrics.smokeLevel}%` }} />
                            </div>

                            <div className="flex justify-between items-center">
                              <span className="text-slate-500">Engine Smoothness Predictor:</span>
                              <span className="font-black text-blue-400">{metrics.smoothness}%</span>
                            </div>
                            <div className="w-full bg-slate-950 h-1 rounded overflow-hidden">
                              <div className="h-full bg-blue-500 transition-all" style={{ width: `${metrics.smoothness}%` }} />
                            </div>

                            <div className="flex justify-between items-center">
                              <span className="text-slate-500">Customer Satisfaction Rate:</span>
                              <span className="font-black text-amber-400">{metrics.satisfaction}%</span>
                            </div>
                            <div className="w-full bg-slate-950 h-1 rounded overflow-hidden">
                              <div className="h-full bg-amber-500 transition-all" style={{ width: `${metrics.satisfaction}%` }} />
                            </div>
                          </div>
                        </div>

                        {/* Technical Smart AI Assistant typing container */}
                        <div className="bg-emerald-500/[0.02] border border-emerald-500/15 p-3.5 rounded-xl text-[10px] space-y-1.5 font-mono">
                          <div className="flex items-center gap-1 text-[8px] text-emerald-400 font-bold uppercase tracking-wider">
                            <Sparkle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>ITech Calibration Assistant [AI-09]</span>
                          </div>
                          <p className="text-slate-300 leading-relaxed leading-normal italic">
                            "{gameFeedback || metrics.advisory}"
                          </p>
                        </div>

                      </div>
                    </div>

                  </div>

                </div>

              </div>
            )}

          </motion.div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/5 bg-[#04080e] py-4 text-center text-slate-500 text-[10px] font-mono">
        <p>© 2026 INDO TEKNIK DIESEL SPK CENTER • AUTHORIZED SERVICE • REAL-TIME DATA TRACKING</p>
      </footer>

      {/* DIGITAL CARD POPUP MODAL */}
      <AnimatePresence>
        {showDigitalCard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-950 border border-white/10 p-5 rounded-2xl max-w-xl w-full space-y-4 relative overflow-hidden shadow-2xl"
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-widest">Calibration Certificate</span>
                <button 
                  onClick={() => setShowDigitalCard(false)}
                  className="p-1 rounded-md hover:bg-white/5 text-slate-400 hover:text-slate-100 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Canvas Rendering placeholder */}
              <div className="relative border border-white/10 rounded-xl overflow-hidden aspect-[8/5] bg-slate-900 flex items-center justify-center">
                <canvas ref={canvasRef} width="800" height="500" className="absolute inset-0 w-full h-full pointer-events-none opacity-0" />
                {generatingCard ? (
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <Compass className="w-8 h-8 text-blue-400 animate-spin" />
                    <span className="text-xs font-mono">Menyiapkan sertifikat kalibrasi digital...</span>
                  </div>
                ) : (
                  <div className="w-full h-full p-4 flex flex-col justify-between text-slate-100 font-mono text-[9px] sm:text-xs">
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="font-bold text-slate-300">INDO TEKNIK CENTER</span>
                      <span className="text-blue-400">SPK ID: {workOrder?.id}</span>
                    </div>
                    <div className="space-y-1 my-3">
                      <p>Customer: <span className="font-bold text-white">{workOrder?.customerName}</span></p>
                      <p>Vehicle Unit: <span className="font-bold text-white">{workOrder?.vehicleBrand || 'Kirim Komponen'}</span></p>
                      <p>Warranty Status: <span className="font-bold text-emerald-400">{workOrder?.garansi || '6 Months Warranty'}</span></p>
                      <p>Calibration Pass: <span className="font-bold text-blue-400">VERIFIED PASS</span></p>
                    </div>
                    <div className="flex justify-between items-end">
                      <p className="text-[7px] text-slate-500 max-w-xs">Dokumen digital bersertifikat resmi sebagai bukti uji standar pabrikan.</p>
                      {/* Live QR Code Element on UI */}
                      <div className="bg-white p-1 rounded">
                        <QRCodeSVG id="tracking-qrcode-svg" value={`${trackingBaseUrl || 'https://it-erp-app.web.app'}/?tracking=${woId}`} size={54} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                <button
                  onClick={handleDownloadCard}
                  disabled={generatingCard}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 font-mono"
                >
                  <Download className="w-3.5 h-3.5" /> Download PNG
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default PublicTrackingView;
