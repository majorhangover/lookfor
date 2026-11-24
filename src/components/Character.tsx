"use client";

import { useEffect, useState } from "react";
import type { CharacterId } from "@/lib/occasions";

/**
 * Original cartoon hosts drawn in SVG, one per occasion. `mouth` (0 to 1)
 * sets how open the mouth is so it can follow speech. A Rive rig or a video
 * avatar can replace this later behind the same props.
 */
export default function Character({
  id,
  mouth,
  listening,
}: {
  id: CharacterId;
  mouth: number;
  listening: boolean;
}) {
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const loop = () => {
      t = setTimeout(() => {
        setBlink(true);
        setTimeout(() => setBlink(false), 140);
        loop();
      }, 2500 + Math.random() * 3000);
    };
    loop();
    return () => clearTimeout(t);
  }, []);

  const open = Math.max(0, Math.min(1, mouth));
  const eyeRy = blink ? 1 : 9;
  const skin = { santa: "#ffd9b8", bear: "#c08552", bunny: "#f8f4f0", cupid: "#ffe0c7", lou: "#f1c27d" }[id];

  const mouthY = id === "santa" ? 213 : 205;

  return (
    <svg viewBox="0 0 300 320" className="w-full h-full" role="img" aria-label={`Cartoon ${id}`}>
      <defs>
        <radialGradient id="cheek" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ff8a8a" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ff8a8a" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="150" cy="175" r="140" fill={listening ? "#fde68a" : "transparent"} opacity="0.35">
        {listening && <animate attributeName="r" values="132;142;132" dur="1.4s" repeatCount="indefinite" />}
      </circle>

      {/* Behind the head */}
      {id === "bunny" && (
        <g>
          <ellipse cx="112" cy="60" rx="22" ry="62" fill="#f8f4f0" transform="rotate(-12 112 60)" />
          <ellipse cx="112" cy="62" rx="11" ry="46" fill="#f9b4c8" transform="rotate(-12 112 62)" />
          <ellipse cx="188" cy="60" rx="22" ry="62" fill="#f8f4f0" transform="rotate(12 188 60)" />
          <ellipse cx="188" cy="62" rx="11" ry="46" fill="#f9b4c8" transform="rotate(12 188 62)" />
        </g>
      )}
      {id === "bear" && (
        <g>
          <circle cx="88" cy="105" r="28" fill="#c08552" />
          <circle cx="88" cy="105" r="15" fill="#e8b98a" />
          <circle cx="212" cy="105" r="28" fill="#c08552" />
          <circle cx="212" cy="105" r="15" fill="#e8b98a" />
        </g>
      )}
      {id === "cupid" && (
        <g fill="#fff" opacity="0.95">
          <path d="M70 190 Q20 150 30 110 Q55 140 80 150 Q50 120 60 95 Q85 130 95 150 Z" />
          <path d="M230 190 Q280 150 270 110 Q245 140 220 150 Q250 120 240 95 Q215 130 205 150 Z" />
        </g>
      )}
      {id === "santa" && (
        <g>
          <path d="M70 120 Q95 20 190 30 Q250 40 262 110 L240 118 Q225 70 185 62 Q120 60 100 125 Z" fill="#d62828" />
          <circle cx="262" cy="118" r="20" fill="#fff" />
        </g>
      )}

      {/* Head */}
      <ellipse cx="150" cy="165" rx="78" ry="74" fill={skin} />

      {/* Hair and hats */}
      {id === "santa" && <rect x="62" y="104" width="176" height="34" rx="17" fill="#fff" />}
      {id === "bear" && (
        <g>
          <path d="M150 20 L120 98 L180 98 Z" fill="#facc15" />
          <path d="M135 60 L165 60 M128 78 L172 78" stroke="#ec4899" strokeWidth="7" />
          <circle cx="150" cy="20" r="10" fill="#ec4899" />
          <ellipse cx="150" cy="200" rx="38" ry="30" fill="#e8b98a" />
        </g>
      )}
      {id === "cupid" && (
        <g fill="#f6c453">
          {[95, 120, 150, 180, 205].map((x, i) => (
            <circle key={i} cx={x} cy={i % 2 ? 100 : 108} r="20" />
          ))}
          <path d="M150 62 C150 52 136 50 136 60 C136 68 150 74 150 78 C150 74 164 68 164 60 C164 50 150 52 150 62 Z" fill="#e11d48" />
        </g>
      )}
      {id === "lou" && (
        <g>
          <path d="M72 150 Q70 85 150 82 Q230 85 228 150 Q205 112 150 112 Q95 112 72 150 Z" fill="#3b2314" />
          <circle cx="118" cy="160" r="19" fill="none" stroke="#0e7490" strokeWidth="5" />
          <circle cx="182" cy="160" r="19" fill="none" stroke="#0e7490" strokeWidth="5" />
          <path d="M137 158 L163 158" stroke="#0e7490" strokeWidth="5" />
        </g>
      )}

      {/* Eyebrows (Santa) */}
      {id === "santa" && (
        <g>
          <path d="M100 140 Q118 128 134 140" stroke="#fff" strokeWidth="9" fill="none" strokeLinecap="round" />
          <path d="M166 140 Q182 128 200 140" stroke="#fff" strokeWidth="9" fill="none" strokeLinecap="round" />
        </g>
      )}

      {/* Eyes */}
      <ellipse cx="118" cy="160" rx="7" ry={eyeRy} fill="#2b2b2b" />
      <ellipse cx="182" cy="160" rx="7" ry={eyeRy} fill="#2b2b2b" />

      {/* Cheeks */}
      <circle cx="98" cy="190" r="20" fill="url(#cheek)" />
      <circle cx="202" cy="190" r="20" fill="url(#cheek)" />

      {/* Santa's beard */}
      {id === "santa" && (
        <path
          d="M72 175 Q70 270 150 300 Q230 270 228 175 Q210 205 185 200 Q150 240 115 200 Q90 205 72 175 Z"
          fill="#fff"
        />
      )}

      {/* Mouth */}
      <ellipse cx="150" cy={mouthY} rx={14 + open * 4} ry={3 + open * 13} fill="#7a1f1f" />
      {open > 0.35 && <ellipse cx="150" cy={mouthY + 3 + open * 6} rx="8" ry={open * 5} fill="#e76f6f" />}

      {/* Moustache and noses */}
      {id === "santa" && (
        <path d="M150 196 Q120 178 96 200 Q118 214 150 202 Q182 214 204 200 Q180 178 150 196 Z" fill="#f4f4f4" />
      )}
      {id === "santa" && <ellipse cx="150" cy="184" rx="14" ry="12" fill="#f4a19a" />}
      {id === "bear" && <ellipse cx="150" cy="184" rx="14" ry="10" fill="#3b2314" />}
      {id === "bunny" && <path d="M142 180 L158 180 L150 190 Z" fill="#f472b6" />}
      {(id === "cupid" || id === "lou") && <ellipse cx="150" cy="184" rx="8" ry="6" fill="#e5a882" />}
      {id === "bunny" && (
        <g stroke="#9ca3af" strokeWidth="2">
          <path d="M120 188 L85 182 M120 194 L85 198 M180 188 L215 182 M180 194 L215 198" />
        </g>
      )}
      {id === "lou" && <path d="M95 236 Q150 262 205 236 L215 262 Q150 285 85 262 Z" fill="#0d9488" />}
    </svg>
  );
}
