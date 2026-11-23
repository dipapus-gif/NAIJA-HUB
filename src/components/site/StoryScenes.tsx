"use client";

import type { ReactNode } from "react";

/**
 * Built-in illustrated scenes, one per story chapter. They sit under the real videos, so the
 * story is always visible: before a video has loaded, on Data Saver, or when a network blocks the video host.
 */
const Svg = ({ children, id }: { children: ReactNode; id: string }) => (
  <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full" aria-hidden data-scene={id}>
    {children}
  </svg>
);

const skyline = (fill: string, seed: number) => {
  const out: ReactNode[] = [];
  let x = -20;
  let i = 0;
  while (x < 1640) {
    const w = 50 + ((i * 37 + seed * 13) % 70);
    const h = 120 + ((i * 91 + seed * 29) % 260);
    out.push(<rect key={i} x={x} y={760 - h} width={w} height={h + 160} fill={fill} />);
    x += w + 6;
    i++;
  }
  return out;
};
const windows = (seed: number, color: string) =>
  Array.from({ length: 70 }, (_, i) => {
    const x = (i * 97 + seed * 41) % 1560;
    const y = 520 + ((i * 53 + seed * 17) % 200);
    return <rect key={i} x={x} y={y} width="7" height="10" rx="1" fill={color} className="nh-twinkle" style={{ animationDelay: `${(i % 9) * 0.35}s` }} />;
  });

export function SceneDawn() {
  return (
    <Svg id="dawn">
      <defs>
        <linearGradient id="sk1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#06231c" /><stop offset="0.55" stopColor="#1d5a43" /><stop offset="1" stopColor="#f2a93b" /></linearGradient>
        <radialGradient id="sun1"><stop offset="0" stopColor="#ffe9a8" /><stop offset="0.5" stopColor="#ffc24d" stopOpacity="0.85" /><stop offset="1" stopColor="#ffc24d" stopOpacity="0" /></radialGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#sk1)" />
      <g className="nh-sunrise"><circle cx="1080" cy="640" r="330" fill="url(#sun1)" /><circle cx="1080" cy="640" r="92" fill="#fff1c4" /></g>
      <g fill="#0b3a2c" opacity="0.9">{skyline("#0b3a2c", 1)}</g>
      <g>{windows(1, "#ffd86b")}</g>
      <path d="M0 800 Q 400 690 800 790 T 1600 770 L1600 900 L0 900Z" fill="#06241b" />
      <g className="nh-drive" style={{ animationDuration: "14s" }}>
        <rect x="-260" y="772" width="190" height="62" rx="12" fill="#f4b81f" /><rect x="-232" y="750" width="124" height="34" rx="9" fill="#f4b81f" />
        <rect x="-220" y="758" width="40" height="20" fill="#cfe9ff" opacity="0.8" /><rect x="-170" y="758" width="40" height="20" fill="#cfe9ff" opacity="0.8" />
        <rect x="-260" y="800" width="190" height="9" fill="#111" opacity="0.7" /><circle cx="-215" cy="836" r="17" fill="#0a0a0a" /><circle cx="-115" cy="836" r="17" fill="#0a0a0a" />
        <circle cx="-72" cy="800" r="9" fill="#fff6c8" />
      </g>
      <g stroke="#ffe08a" strokeWidth="3" opacity="0.7">{[0, 1, 2, 3, 4].map((i) => <line key={i} x1={80 + i * 330} y1="858" x2={190 + i * 330} y2="858" className="nh-dash" style={{ animationDelay: `${i * 0.4}s` }} />)}</g>
    </Svg>
  );
}

export function SceneMarket() {
  const awning = (x: number, c1: string, c2: string, i: number) => (
    <g key={i} transform={`translate(${x} 470)`}>
      {Array.from({ length: 8 }, (_, k) => <path key={k} d={`M${k * 44} 0 h44 l-8 70 h-44z`} fill={k % 2 ? c1 : c2} />)}
      <rect x="6" y="70" width="350" height="190" fill="#3b2410" opacity="0.85" />
      {[0, 1, 2, 3, 4].map((k) => <circle key={k} cx={50 + k * 62} cy="238" r="26" fill={["#e5532d", "#f2a93b", "#6bbf4a", "#f2a93b", "#e5532d"][k]} />)}
    </g>
  );
  return (
    <Svg id="market">
      <defs><linearGradient id="sk2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0e3b2c" /><stop offset="1" stopColor="#6a4a1c" /></linearGradient></defs>
      <rect width="1600" height="900" fill="url(#sk2)" />
      <circle cx="260" cy="190" r="120" fill="#ffd27a" opacity="0.5" />
      {awning(90, "#f2a93b", "#fff3d1", 0)}{awning(500, "#e5532d", "#fff3d1", 1)}{awning(910, "#2f9e6a", "#fff3d1", 2)}
      <rect y="730" width="1600" height="170" fill="#2a1a0a" />
      <g transform="translate(1290 360)">
        <rect width="190" height="360" rx="22" fill="#d9362b" /><rect x="22" y="36" width="146" height="90" rx="10" fill="#10231c" />
        <text x="95" y="96" textAnchor="middle" fontFamily="monospace" fontSize="34" fill="#7dffb0">1,289</text>
        <rect x="190" y="150" width="62" height="14" fill="#222" /><path d="M252 157 q40 0 40 60 v40" stroke="#222" strokeWidth="14" fill="none" />
      </g>
      {[["₦1,289", 330, 150, 0], ["₦48,000", 760, 110, 0.8], ["₦22,500", 1130, 160, 1.6], ["50kg rice", 560, 300, 2.4]].map(([t, x, y, d]) => (
        <g key={String(t)} className="nh-bob" style={{ animationDelay: `${d}s` }}>
          <rect x={Number(x) - 12} y={Number(y) - 38} width={String(t).length * 28 + 24} height="58" rx="29" fill="#fff6dc" />
          <text x={Number(x) + 10} y={Number(y)} fontFamily="Georgia, serif" fontWeight="700" fontSize="36" fill="#3b2410">{String(t)}</text>
        </g>
      ))}
    </Svg>
  );
}

export function SceneShield() {
  return (
    <Svg id="shield">
      <defs>
        <radialGradient id="g3" cx="0.5" cy="0.45" r="0.7"><stop offset="0" stopColor="#1b7a5a" /><stop offset="1" stopColor="#04170f" /></radialGradient>
        <linearGradient id="sc3" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#7dffb0" stopOpacity="0" /><stop offset="0.5" stopColor="#7dffb0" stopOpacity="0.9" /><stop offset="1" stopColor="#7dffb0" stopOpacity="0" /></linearGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#g3)" />
      {[0, 1, 2, 3].map((i) => <circle key={i} cx="1000" cy="450" r={180 + i * 110} fill="none" stroke="#7dffb0" strokeOpacity={0.35 - i * 0.07} className="nh-ring" style={{ animationDelay: `${i * 0.7}s` }} />)}
      <g transform="translate(1000 450)">
        <path d="M0 -230 L190 -160 V30 Q190 170 0 250 Q-190 170 -190 30 V-160Z" fill="#0b4d38" stroke="#7dffb0" strokeWidth="8" />
        <path d="M-80 10 L-22 70 L96 -66" fill="none" stroke="#f5b82e" strokeWidth="26" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g transform="translate(640 230)">
        <rect width="270" height="500" rx="38" fill="#071f17" stroke="#7dffb0" strokeWidth="5" />
        <rect x="90" y="16" width="90" height="12" rx="6" fill="#123b2d" />
        <rect x="26" y="70" width="218" height="52" rx="14" fill="#e5532d" opacity="0.9" /><text x="42" y="105" fontFamily="monospace" fontSize="22" fill="#fff">"WIN ₦5M NOW!"</text>
        <rect x="26" y="150" width="218" height="52" rx="14" fill="#123b2d" /><text x="42" y="185" fontFamily="monospace" fontSize="22" fill="#7dffb0">NAFDAC ✓ verified</text>
        <rect x="26" y="230" width="218" height="52" rx="14" fill="#123b2d" />
        <rect x="14" y="70" width="242" height="6" fill="url(#sc3)" className="nh-scan" />
      </g>
      {["419", "OTP", "BVN", "FAKE"].map((t, i) => <text key={t} x={700 + i * 150} y={760 - i * 40} fontFamily="monospace" fontWeight="700" fontSize="34" fill="#e5532d" className="nh-bob" style={{ animationDelay: `${i * 0.6}s` }}>{t}</text>)}
    </Svg>
  );
}

export function SceneNaira() {
  return (
    <Svg id="naira">
      <defs><linearGradient id="g4" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#071d33" /><stop offset="1" stopColor="#0f4a3a" /></linearGradient></defs>
      <rect width="1600" height="900" fill="url(#g4)" />
      <text x="1080" y="640" textAnchor="middle" fontFamily="Georgia, serif" fontWeight="700" fontSize="640" fill="#f5b82e" opacity="0.16">₦</text>
      <g transform="translate(860 150) scale(0.85)">
        <rect width="420" height="540" rx="34" fill="#0a1a2a" stroke="#f5b82e" strokeWidth="5" />
        <rect x="28" y="30" width="364" height="110" rx="14" fill="#0e3b2c" /><text x="372" y="112" textAnchor="end" fontFamily="monospace" fontSize="60" fill="#7dffb0">₦412,500</text>
        {Array.from({ length: 16 }, (_, i) => <rect key={i} x={28 + (i % 4) * 94} y={170 + Math.floor(i / 4) * 86} width="80" height="70" rx="14" fill={i % 4 === 3 ? "#f5b82e" : "#16324a"} />)}
      </g>
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <g key={i} className="nh-fall" style={{ animationDelay: `${i * 0.9}s`, animationDuration: `${6 + (i % 3)}s` }}>
          <circle cx={820 + i * 100} cy="-40" r="34" fill="#f5b82e" /><text x={820 + i * 100} y="-28" textAnchor="middle" fontFamily="Georgia, serif" fontWeight="700" fontSize="38" fill="#7a5200">₦</text>
        </g>
      ))}
      <g transform="translate(560 760)" fontFamily="monospace" fontSize="38" fill="#cfe9ff"><text>VAT 7.5%</text><text y="56" fill="#7dffb0">PAYE ✓</text></g>
    </Svg>
  );
}

export function SceneAjo() {
  const n = 8;
  return (
    <Svg id="ajo">
      <defs><radialGradient id="g5" cx="0.5" cy="0.5" r="0.75"><stop offset="0" stopColor="#8a5a14" /><stop offset="1" stopColor="#1d1208" /></radialGradient></defs>
      <rect width="1600" height="900" fill="url(#g5)" />
      <g transform="translate(980 450)">
        <circle r="300" fill="none" stroke="#f5b82e" strokeOpacity="0.3" strokeDasharray="8 14" className="nh-spin" />
        <g className="nh-spin" style={{ animationDuration: "26s" }}>
          {Array.from({ length: n }, (_, i) => {
            const a = (i / n) * Math.PI * 2;
            const x = Math.cos(a) * 300;
            const y = Math.sin(a) * 300;
            return (
              <g key={i} transform={`translate(${x} ${y})`}>
                <circle r="44" fill={["#f5b82e", "#e5532d", "#2f9e6a", "#fff3d1"][i % 4]} /><circle cy="-12" r="14" fill="#2a1a0a" opacity="0.55" /><path d="M-22 22 q22 -22 44 0" fill="none" stroke="#2a1a0a" strokeOpacity="0.55" strokeWidth="7" />
              </g>
            );
          })}
        </g>
        <circle r="120" fill="#3b2410" stroke="#f5b82e" strokeWidth="8" />
        <text textAnchor="middle" y="26" fontFamily="Georgia, serif" fontWeight="700" fontSize="78" fill="#f5b82e">₦</text>
      </g>
      <g transform="translate(560 90)" fontFamily="Georgia, serif" fill="#fff3d1">
        <text fontSize="40" fontWeight="700">Round 3 of 8</text>
        <text y="46" fontSize="28" fill="#f5b82e">Ada collects ₦400,000</text>
        <text y="86" fontSize="24" opacity="0.8">8 of 8 paid ✓</text>
      </g>
    </Svg>
  );
}

export const SCENES = [SceneDawn, SceneMarket, SceneShield, SceneNaira, SceneAjo];
