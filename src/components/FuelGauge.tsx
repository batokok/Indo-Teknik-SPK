import React from 'react';

interface FuelGaugeProps {
  level: 'E' | '1/4' | '1/2' | '3/4' | 'F' | string;
  theme?: 'dark' | 'light' | 'print';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const FuelGauge: React.FC<FuelGaugeProps> = ({
  level = '1/2',
  theme = 'light',
  size = 'md',
  className = '',
}) => {
  // Normalize and parse level
  const normalizedLevel = (level || '1/2').toUpperCase();
  
  let percent = 50;
  if (normalizedLevel === 'E') {
    percent = 0;
  } else if (normalizedLevel === '1/4') {
    percent = 25;
  } else if (normalizedLevel === '1/2') {
    percent = 50;
  } else if (normalizedLevel === '3/4') {
    percent = 75;
  } else if (normalizedLevel === 'F') {
    percent = 100;
  } else {
    // Try to parse raw numeric values or percentage strings
    const num = parseFloat(normalizedLevel.replace(/[^0-9.]/g, ''));
    if (!isNaN(num)) {
      if (num <= 1 && normalizedLevel.includes('.')) {
        percent = num * 100;
      } else {
        percent = num;
      }
    }
  }
  
  // Clamp percent between 0 and 100
  percent = Math.max(0, Math.min(100, percent));

  // Gauge Scale: sweeps 240 degrees from 150 degrees (Empty) to 390 degrees (Full)
  // Straight up (1/2, 50%) is 270 degrees.
  // Angle calculation relative to 270 degrees (where needle is pointing straight up)
  // 0%   -> 150° (-120° rotation relative to 270°)
  // 50%  -> 270° (0° rotation relative to 270°)
  // 100% -> 390° (120° rotation relative to 270°)
  const needleAngle = -120 + (percent / 100) * 240;

  // Warning light state (glows when fuel level is <= 25%)
  const isLowFuel = percent <= 25;

  // Sizing definitions
  const sizeClasses = {
    xs: 'w-24 h-24',
    sm: 'w-32 h-32',
    md: 'w-40 h-40 md:w-48 md:h-48',
    lg: 'w-56 h-56 md:w-64 md:h-64',
  };

  // Color configurations for vintage physical look
  const colors = {
    dark: {
      bgMain: '#0a0c10', // Deep matte velvet black
      bgInner: '#111318', // Inset dial faceplate background
      tickPrimary: '#e3d2b3', // Warm vintage cream ticks
      tickSecondary: '#bfaa80', // Aged amber-cream midticks
      tickMinor: '#73654a', // Antique gold minor ticks
      text: '#e3d2b3', // Vintage cream labels
      textActive: '#ffffff', // High-exposure white active text
      dangerZone: '#f43f5e', // Classic mechanical warning pink-red
      safeZone: '#10b981', // Classic mechanical full green
      needle: '#ea580c', // Bright mechanical safety orange
      needlePin: '#ffedd5', // Specular white on needle
      hubOuter: '#181b22', // Dark metal hub
      hubInner: '#1e222b', // Center dome
      hubRivet: '#eab308', // Core brass rivet
      textBrand: '#a3a3a3', // Brand muted gray
      ambientBacklight: 'rgba(217, 119, 6, 0.12)', // Warm filament backlight glow
    },
    light: {
      bgMain: '#fbf9f2', // Ivory white paper/aged faceplate
      bgInner: '#f3edd7', // Inset warm parchment background
      tickPrimary: '#2d1e0f', // Dark antique bronze ticks
      tickSecondary: '#543c22', // Aged walnut secondary ticks
      tickMinor: '#967d5f', // Light warm bronze minor ticks
      text: '#2d1e0f', // Dark bronze labels
      textActive: '#120b04', // Deep solid bronze active text
      dangerZone: '#be123c', // Vintage oxblood red
      safeZone: '#047857', // Muted British racing green
      needle: '#dc2626', // Classic vintage dial red pointer
      needlePin: '#ffffff',
      hubOuter: '#78350f', // Warm walnut wood bezel hub
      hubInner: '#b45309', // Aged copper/amber hub
      hubRivet: '#eab308', // Core brass rivet
      textBrand: '#8a7761', // Antique gold-brown brand
      ambientBacklight: 'rgba(253, 246, 219, 0.35)', // Soft warm light overlay
    },
    print: {
      bgMain: '#ffffff',
      bgInner: '#ffffff',
      tickPrimary: '#000000',
      tickSecondary: '#000000',
      tickMinor: '#4b5563',
      text: '#000000',
      textActive: '#000000',
      dangerZone: '#000000',
      safeZone: '#000000',
      needle: '#000000',
      needlePin: '#ffffff',
      hubOuter: '#000000',
      hubInner: '#ffffff',
      hubRivet: '#000000',
      textBrand: '#000000',
      ambientBacklight: 'transparent',
    },
  }[theme];

  // Draw circular calibration ticks (every 10 degrees from 150° to 390°)
  const ticks = [];
  for (let angle = 150; angle <= 390; angle += 10) {
    const rad = (angle * Math.PI) / 180;
    
    const isMajor = (angle - 150) % 60 === 0; // 150° (E), 210° (1/4), 270° (1/2), 330° (3/4), 390° (F)
    const isMedium = !isMajor && (angle - 150) % 30 === 0; // Mid-points
    
    const length = isMajor ? 12 : isMedium ? 8 : 4.5;
    const strokeWidth = isMajor ? 2.5 : isMedium ? 1.5 : 0.8;
    
    const rOuter = 80;
    const rInner = rOuter - length;
    
    const x1 = 100 + rOuter * Math.cos(rad);
    const y1 = 100 + rOuter * Math.sin(rad);
    const x2 = 100 + rInner * Math.cos(rad);
    const y2 = 100 + rInner * Math.sin(rad);

    // Pick dynamic colors for warning range or standard ranges
    let color = colors.tickMinor;
    if (isMajor) {
      color = colors.tickPrimary;
    } else if (isMedium) {
      color = colors.tickSecondary;
    }

    // Low fuel warning sector (150° to 210°)
    if (angle <= 210) {
      color = colors.dangerZone;
    }
    // High fuel healthy sector (330° to 390°)
    if (angle >= 330 && theme !== 'print') {
      color = colors.safeZone;
    }

    ticks.push({ x1, y1, x2, y2, strokeWidth, color });
  }

  // Draw 5 main labels ('E', '1/4', '1/2', '3/4', 'F') at their respective angles
  const labels = [
    { text: 'E', angle: 150, value: 0 },
    { text: '1/4', angle: 210, value: 25 },
    { text: '1/2', angle: 270, value: 50 },
    { text: '3/4', angle: 330, value: 75 },
    { text: 'F', angle: 390, value: 100 },
  ].map(label => {
    const rad = (label.angle * Math.PI) / 180;
    // Labels sitting beautifully inside the scale
    const rLabel = 54;
    const x = 100 + rLabel * Math.cos(rad);
    const y = 100 + rLabel * Math.sin(rad);

    // Dynamic active color if current level matches or is close to this label
    const isMatched = Math.abs(percent - label.value) < 12.5;
    let labelColor = colors.text;
    
    if (isMatched) {
      labelColor = colors.textActive;
    } else if (label.value <= 25) {
      labelColor = colors.dangerZone;
    } else if (label.value >= 75 && theme !== 'print') {
      labelColor = colors.safeZone;
    } else {
      labelColor = colors.tickSecondary;
    }

    return { ...label, x, y, labelColor, isMatched };
  });

  return (
    <div className={`flex flex-col items-center justify-center p-3 rounded-3xl border transition-all duration-300 shadow-2xl ${
      theme === 'dark' 
        ? 'bg-[#090b0e] border-slate-900 shadow-black/80' 
        : theme === 'print' 
        ? 'bg-white border-black' 
        : 'bg-[#faf7ee] border-[#e7dbae] shadow-amber-900/10'
    } ${className}`} id="fuel-gauge-panel">
      
      {/* Svg Fuel Gauge Container */}
      <div className={`relative ${sizeClasses[size]} select-none overflow-visible`}>
        <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible" id="fuel-gauge-svg">
          <defs>
            {/* Metallic Brass Bezel Gradient for Light Theme */}
            <linearGradient id="brassBezelCircle" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#80622d" />
              <stop offset="15%" stopColor="#e3ca8f" />
              <stop offset="30%" stopColor="#9a7f43" />
              <stop offset="45%" stopColor="#ebd49f" />
              <stop offset="55%" stopColor="#faf0d4" />
              <stop offset="70%" stopColor="#80622d" />
              <stop offset="85%" stopColor="#ebd49f" />
              <stop offset="100%" stopColor="#503713" />
            </linearGradient>

            {/* Metallic Chrome Bezel Gradient for Dark Theme */}
            <linearGradient id="chromeBezelCircle" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2e353f" />
              <stop offset="15%" stopColor="#f8fafc" />
              <stop offset="30%" stopColor="#475569" />
              <stop offset="45%" stopColor="#cbd5e1" />
              <stop offset="55%" stopColor="#f1f5f9" />
              <stop offset="70%" stopColor="#1e293b" />
              <stop offset="85%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>

            {/* Dial Face Inner Shadow Filter for 3D Inset look */}
            <radialGradient id="dialFaceShadow" cx="50%" cy="50%" r="50%">
              <stop offset="70%" stopColor="transparent" stopOpacity="0" />
              <stop offset="92%" stopColor="#000000" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.55" />
            </radialGradient>

            {/* Backlight Filament Warm Glow for Retro Luxury Dashboard */}
            <radialGradient id="incandescentGlow" cx="50%" cy="50%" r="55%">
              <stop offset="0%" stopColor={colors.ambientBacklight} stopOpacity="1" />
              <stop offset="70%" stopColor={colors.ambientBacklight} stopOpacity="0.4" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>

            {/* Glass Surface Glare Overlay */}
            <linearGradient id="glassReflection" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
              <stop offset="35%" stopColor="#ffffff" stopOpacity="0.06" />
              <stop offset="55%" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>

            {/* Red Light Indicator Glow filter */}
            <filter id="warningLensGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 1. Outermost Bezel Outer Border Ring (Physical bezel casing) */}
          <circle
            cx="100"
            cy="100"
            r="97"
            fill={theme === 'dark' ? 'url(#chromeBezelCircle)' : theme === 'light' ? 'url(#brassBezelCircle)' : 'none'}
            stroke={theme === 'print' ? '#000000' : 'none'}
            strokeWidth={theme === 'print' ? 2 : 0}
          />

          {/* 2. Inner Dial Bezel Shadow line */}
          <circle
            cx="100"
            cy="100"
            r="92"
            fill={colors.bgMain}
            stroke={theme === 'print' ? '#000000' : '#1e2124'}
            strokeWidth="1.5"
            opacity="0.85"
          />

          {/* 3. Concentric Inset Dial Face Circle */}
          <circle
            cx="100"
            cy="100"
            r="88"
            fill={colors.bgInner}
          />

          {/* 4. Instrumental Vintage Filament Backlight Glow */}
          {theme !== 'print' && (
            <circle
              cx="100"
              cy="100"
              r="88"
              fill="url(#incandescentGlow)"
              pointerEvents="none"
            />
          )}

          {/* 5. Inset 3D Shadow Ring */}
          {theme !== 'print' && (
            <circle
              cx="100"
              cy="100"
              r="88"
              fill="url(#dialFaceShadow)"
              pointerEvents="none"
            />
          )}

          {/* 6. Mechanical Fine Gridlines */}
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke={colors.tickMinor}
            strokeWidth="0.5"
            opacity="0.35"
          />
          <circle
            cx="100"
            cy="100"
            r="68"
            fill="none"
            stroke={colors.tickMinor}
            strokeWidth="0.5"
            strokeDasharray="1.5,3"
            opacity="0.25"
          />

          {/* Classic Vintage Red Warning Sector Outer Arc */}
          <path
            d="M 30.7 140 A 80 80 0 0 1 13.4 100"
            fill="none"
            stroke={colors.dangerZone}
            strokeWidth="2"
            opacity={theme === 'print' ? 0.3 : 0.65}
          />
          {/* Classic Muted Green Healthy Sector Outer Arc */}
          {theme !== 'print' && (
            <path
              d="M 186.6 100 A 80 80 0 0 1 169.3 140"
              fill="none"
              stroke={colors.safeZone}
              strokeWidth="2"
              opacity="0.5"
            />
          )}

          {/* 7. Instrument Calibrated Ticks */}
          {ticks.map((t, idx) => (
            <line
              key={`tick-${idx}`}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              stroke={t.color}
              strokeWidth={t.strokeWidth}
              strokeLinecap="round"
            />
          ))}

          {/* 8. Exquisite Serif Text Labels */}
          {labels.map((l, idx) => (
            <text
              key={`label-${idx}`}
              x={l.x}
              y={l.y + 3.5}
              fill={l.labelColor}
              fontSize={l.isMatched ? '12.5' : '10'}
              fontFamily="Georgia, Cambria, 'Times New Roman', serif"
              fontWeight={l.isMatched ? '900' : '700'}
              textAnchor="middle"
              opacity={l.isMatched ? '1' : '0.65'}
              className="transition-all duration-300"
            >
              {l.text}
            </text>
          ))}

          {/* 9. Core Vintage Automotive Lettering Labeling */}
          <text
            x="100"
            y="76"
            fill={colors.textBrand}
            fontSize="10"
            fontFamily="Georgia, Cambria, 'Times New Roman', serif"
            fontWeight="900"
            letterSpacing="5"
            textAnchor="middle"
            opacity={theme === 'print' ? '1' : '0.55'}
          >
            FUEL
          </text>
          
          <text
            x="100"
            y="87"
            fill={colors.tickMinor}
            fontSize="6"
            fontFamily="monospace"
            letterSpacing="1.8"
            textAnchor="middle"
            opacity="0.4"
          >
            SMITHS CHRONOMETRIC
          </text>

          <text
            x="100"
            y="142"
            fill={colors.tickMinor}
            fontSize="5.5"
            fontFamily="monospace"
            letterSpacing="1.2"
            textAnchor="middle"
            opacity="0.4"
          >
            UNLEADED FUEL ONLY
          </text>

          {/* 10. Low Fuel Warning LED Jewel - Polished retro warning socket */}
          {theme !== 'print' && (
            <g id="warning-jewel">
              {/* Outer physical metal bezel socket */}
              <circle
                cx="100"
                cy="158"
                r="7"
                fill={theme === 'dark' ? '#2e353f' : '#78350f'} // Chrome or brass socket
                stroke={theme === 'dark' ? '#0f172a' : '#451a03'}
                strokeWidth="0.8"
              />
              {/* Inner dark core */}
              <circle
                cx="100"
                cy="158"
                r="5.2"
                fill="#0b0f19"
              />
              {/* Glowing Translucent Jewel Lens */}
              <circle
                cx="100"
                cy="158"
                r="4.2"
                fill={isLowFuel ? '#f43f5e' : '#450a12'} // Glowing ruby or deep ruby glass
                stroke={isLowFuel ? '#fecdd3' : '#270509'}
                strokeWidth="0.4"
                filter={isLowFuel ? 'url(#warningLensGlow)' : undefined}
                className={isLowFuel ? 'animate-pulse' : ''}
              />
              {/* Lens Optical Reflection dot */}
              <circle
                cx="98.5"
                cy="156.5"
                r="1"
                fill="#ffffff"
                opacity={isLowFuel ? 0.92 : 0.35}
              />
            </g>
          )}

          {/* 11. Authentic Teardrop Instrument Screws / Rivets (4 mounting screws for hand-built premium look) */}
          {theme !== 'print' && (
            <g opacity="0.4" strokeWidth="0.5" stroke="#111318">
              {/* Top Screw */}
              <circle cx="100" cy="12" r="1.8" fill={theme === 'dark' ? '#94a3b8' : '#e3ca8f'} />
              <line x1="99" y1="12" x2="101" y2="12" stroke="#111318" strokeWidth="0.5" />
              {/* Bottom Screw */}
              <circle cx="100" cy="188" r="1.8" fill={theme === 'dark' ? '#94a3b8' : '#e3ca8f'} />
              <line x1="99.2" y1="187.2" x2="100.8" y2="188.8" stroke="#111318" strokeWidth="0.5" />
              {/* Left Screw */}
              <circle cx="12" cy="100" r="1.8" fill={theme === 'dark' ? '#94a3b8' : '#e3ca8f'} />
              <line x1="12" y1="99" x2="12" y2="101" stroke="#111318" strokeWidth="0.5" />
              {/* Right Screw */}
              <circle cx="188" cy="100" r="1.8" fill={theme === 'dark' ? '#94a3b8' : '#e3ca8f'} />
              <line x1="187" y1="100" x2="189" y2="100" stroke="#111318" strokeWidth="0.5" />
            </g>
          )}

          {/* 12. Floating Realistic Needle Drop-Shadow (Creates depth of floating mechanism) */}
          {theme !== 'print' && (
            <g transform={`rotate(${needleAngle}, 100, 100) translate(2.5, 3)`} opacity={theme === 'dark' ? '0.35' : '0.18'}>
              {/* Needle Body Shadow */}
              <path
                d="M 97 100 L 99 15 A 1 1 0 0 1 101 15 L 103 100 Z"
                fill="#000000"
              />
              {/* Counterbalance Weight Shadow */}
              <path
                d="M 97.5 100 L 98.4 122 A 1.5 1.5 0 0 1 101.6 122 L 102.5 100 Z"
                fill="#000000"
              />
              {/* Teardrop Ring Shadow */}
              <circle cx="100" cy="125" r="4.5" fill="#000000" />
            </g>
          )}

          {/* 13. ROTATING NEEDLE ASSEMBLY */}
          <g transform={`rotate(${needleAngle}, 100, 100)`}>
            {/* Elegant Vintage Tapered Needle */}
            <path
              d="M 97 100 L 99.1 14 A 0.9 0.9 0 0 1 100.9 14 L 103 100 Z"
              fill={colors.needle}
              stroke={colors.needle}
              strokeWidth="0.2"
              strokeLinejoin="round"
            />
            {/* Extended counterbalance arm */}
            <path
              d="M 97.6 100 L 98.5 120 A 1.5 1.5 0 0 1 101.5 120 L 102.4 100 Z"
              fill={theme === 'dark' ? '#cbd5e1' : '#451a03'} // Metallic steel or mahogany
              stroke={colors.needle}
              strokeWidth="0.2"
            />
            {/* Balance Tear Loop */}
            <circle
              cx="100"
              cy="124"
              r="4"
              fill={theme === 'dark' ? '#cbd5e1' : '#451a03'}
              stroke={colors.needle}
              strokeWidth="0.5"
            />
            <circle
              cx="100"
              cy="124"
              r="1.8"
              fill={colors.bgInner}
            />

            {/* Specular pointer pin center pinstripe */}
            {theme !== 'print' && (
              <line
                x1="100"
                y1="16"
                x2="100"
                y2="95"
                stroke={colors.needlePin}
                strokeWidth="0.8"
                opacity="0.8"
              />
            )}
          </g>

          {/* 14. 3D Center Hub Cap (Tactile multi-layer construction) */}
          {/* Heavy outer structural ring */}
          <circle
            cx="100"
            cy="100"
            r="16"
            fill={colors.bgMain}
            stroke={theme === 'dark' ? '#1e293b' : '#78350f'}
            strokeWidth="0.6"
            filter="drop-shadow(0px 2px 3px rgba(0,0,0,0.4))"
          />
          {/* Brass or Chrome concentric core washer */}
          <circle
            cx="100"
            cy="100"
            r="12.5"
            fill={theme === 'dark' ? 'url(#chromeBezelCircle)' : 'url(#brassBezelCircle)'}
          />
          {/* Domed center cap */}
          <circle
            cx="100"
            cy="100"
            r="8"
            fill={colors.hubOuter}
            stroke={theme === 'dark' ? '#475569' : '#b45309'}
            strokeWidth="0.5"
          />
          {/* Solid Core Pivot rivet pin */}
          <circle
            cx="100"
            cy="100"
            r="3"
            fill={colors.hubRivet}
            opacity="0.9"
          />

          {/* 15. Realistic Curved Glass Bezel Glare Reflection */}
          {theme !== 'print' && (
            <circle
              cx="100"
              cy="100"
              r="88"
              fill="url(#glassReflection)"
              pointerEvents="none"
            />
          )}
        </svg>

        {/* Low Fuel Reserve Indicator Text Overlay */}
        {theme !== 'print' && isLowFuel && (
          <div className="absolute left-1/2 bottom-[44px] transform -translate-x-1/2 text-[7px] md:text-[8px] font-black uppercase tracking-widest text-red-500 bg-red-950/80 border border-red-500/30 px-2 py-0.5 rounded-md whitespace-nowrap shadow-md shadow-black/25 animate-pulse font-serif italic">
            RESERVE
          </div>
        )}
      </div>

      {/* Numerical/Text Readout Footer */}
      <div className="mt-2 text-center" id="fuel-gauge-readout">
        <span className="text-[9.5px] tracking-wider font-bold text-slate-500 font-serif uppercase">
          Fuel Level:{' '}
          <span className={`text-[11px] font-extrabold ${
            percent === 0 ? 'text-red-500 font-black' :
            percent <= 25 ? 'text-rose-500 font-black' :
            percent <= 50 ? 'text-amber-500 dark:text-amber-400' :
            percent <= 75 ? 'text-blue-500 dark:text-blue-400' :
            'text-emerald-500 dark:text-emerald-400 font-black'
          }`}>
            {percent === 0 ? 'Empty (0%)' :
             percent === 25 ? '1/4 (25%)' :
             percent === 50 ? '1/2 (50%)' :
             percent === 75 ? '3/4 (75%)' :
             percent === 100 ? 'Full (100%)' :
             `${Math.round(percent)}%`}
          </span>
        </span>
      </div>
    </div>
  );
};
