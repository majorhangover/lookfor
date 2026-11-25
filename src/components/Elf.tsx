"use client";

import { useEffect, useState } from "react";

/**
 * Pip, Santa's elf helper: drawn in the same style as the hosts. Pip handles
 * the "admin" (like which country you're in) so Santa doesn't have to ask.
 */
export default function Elf() {
  const [blink, setBlink] = useState(false);
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const loop = () => {
      t = setTimeout(() => {
        setBlink(true);
        setTimeout(() => setBlink(false), 140);
        loop();
      }, 2200 + Math.random() * 2500);
    };
    loop();
    return () => clearTimeout(t);
  }, []);
  const eyeRy = blink ? 1 : 9;

  return (
    <svg viewBox="0 0 300 320" className="h-full w-full" role="img" aria-label="Cartoon elf, Santa's helper">
      <defs>
        <radialGradient id="elf-cheek" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ff8a8a" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ff8a8a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g className="char-body">
        {/* Collar and tunic */}
        <path d="M78 262 Q150 236 222 262 L236 320 L64 320 Z" fill="#15803d" />
        <path d="M100 250 L124 278 L150 252 L176 278 L200 250 Q150 238 100 250 Z" fill="#dc2626" />
        {[124, 150, 176].map((x) => (
          <circle key={x} cx={x} cy={x === 150 ? 256 : 280} r="6" fill="#facc15" />
        ))}
        {/* Pointy ears */}
        <path d="M78 160 L28 118 Q40 176 84 196 Z" fill="#ffd9b8" />
        <path d="M74 164 L44 136 Q52 172 80 186 Z" fill="#f4b49a" />
        <path d="M222 160 L272 118 Q260 176 216 196 Z" fill="#ffd9b8" />
        <path d="M226 164 L256 136 Q248 172 220 186 Z" fill="#f4b49a" />
        {/* Head */}
        <ellipse cx="150" cy="170" rx="74" ry="72" fill="#ffd9b8" />
        {/* Hair tufts */}
        <path d="M82 140 Q96 118 112 136 Q122 116 138 134 Q150 118 162 134 Q178 116 188 136 Q204 118 218 140 L218 126 L82 126 Z" fill="#b45309" />
        {/* Hat: green cone flopping to the side, red-and-white band, bell */}
        <path d="M76 128 Q96 40 168 22 Q236 8 262 58 Q226 44 206 70 Q222 98 224 128 Z" fill="#16a34a" />
        <path d="M168 22 Q236 8 262 58 Q240 50 222 58 Q210 36 168 22 Z" fill="#15803d" />
        <rect x="70" y="112" width="160" height="28" rx="14" fill="#dc2626" />
        {[86, 118, 150, 182, 214].map((x) => (
          <rect key={x} x={x - 6} y="112" width="12" height="28" fill="#fff" opacity="0.9" />
        ))}
        <circle cx="262" cy="62" r="14" fill="#facc15" className="char-pompom" />
        <path d="M254 66 Q262 74 270 66" stroke="#a16207" strokeWidth="3" fill="none" />
        {/* Eyes and brows */}
        <ellipse cx="122" cy="168" rx="7" ry={eyeRy} fill="#2b2b2b" />
        <ellipse cx="178" cy="168" rx="7" ry={eyeRy} fill="#2b2b2b" />
        {!blink && (
          <>
            <circle cx="125" cy="164" r="2.5" fill="#fff" />
            <circle cx="181" cy="164" r="2.5" fill="#fff" />
          </>
        )}
        <path d="M108 148 Q122 140 134 148" stroke="#92400e" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M166 146 Q180 136 192 144" stroke="#92400e" strokeWidth="5" fill="none" strokeLinecap="round" />
        {/* Cheeks and freckles */}
        <circle cx="102" cy="196" r="20" fill="url(#elf-cheek)" />
        <circle cx="198" cy="196" r="20" fill="url(#elf-cheek)" />
        {[
          [96, 186],
          [106, 192],
          [98, 198],
          [194, 186],
          [204, 192],
          [196, 198],
        ].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="2.2" fill="#c2410c" opacity="0.6" />
        ))}
        {/* Nose and cheeky grin */}
        <ellipse cx="150" cy="188" rx="10" ry="8" fill="#f4a19a" />
        <path d="M128 208 Q150 230 174 206" stroke="#7a1f1f" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M168 204 L176 202" stroke="#7a1f1f" strokeWidth="4" strokeLinecap="round" />
      </g>
    </svg>
  );
}
