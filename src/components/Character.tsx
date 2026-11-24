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
  speaking = false,
  thinking = false,
  waveKey = 0,
  pointUp = false,
}: {
  id: CharacterId;
  mouth: number;
  listening: boolean;
  speaking?: boolean;
  thinking?: boolean;
  /** Change this number to make the character wave. */
  waveKey?: number;
  /** Point up at the chat bar (wide screens only, where the bar is above). */
  pointUp?: boolean;
}) {
  const [blink, setBlink] = useState(false);
  const [waving, setWaving] = useState(false);
  const [lastWave, setLastWave] = useState(0);

  // Wave whenever waveKey changes (adjusting state during render, per React docs).
  if (waveKey !== lastWave) {
    setLastWave(waveKey);
    setWaving(true);
  }
  useEffect(() => {
    if (!waving) return;
    const t = setTimeout(() => setWaving(false), 1800);
    return () => clearTimeout(t);
  }, [waving]);

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
  const lookUp = thinking ? -4 : 0;
  const browLift = speaking ? -3 - open * 4 : thinking ? -5 : 0;
  const hand = {
    santa: { sleeve: "#d62828", cuff: "#fff", mitt: "#1f7a3a" },
    bear: { sleeve: "#c08552", cuff: "#c08552", mitt: "#e8b98a" },
    bunny: { sleeve: "#f8f4f0", cuff: "#f8f4f0", mitt: "#f9b4c8" },
    cupid: { sleeve: "#ffe0c7", cuff: "#ffe0c7", mitt: "#ffe0c7" },
    penguin: { sleeve: "#1f2937", cuff: "#1f2937", mitt: "#1f2937" },
    hen: { sleeve: "#fff7ed", cuff: "#fde68a", mitt: "#fff7ed" },
    dog: { sleeve: "#1e3a8a", cuff: "#1e3a8a", mitt: "#d6a36b" },
    dove: { sleeve: "#f8fafc", cuff: "#e2e8f0", mitt: "#f8fafc" },
    stork: { sleeve: "#f8fafc", cuff: "#e2e8f0", mitt: "#f8fafc" },
    fox: { sleeve: "#ea580c", cuff: "#fff", mitt: "#3b2314" },
    lou: { sleeve: "#0d9488", cuff: "#0d9488", mitt: "#f1c27d" },
  }[id];
  const skin = {
    santa: "#ffd9b8",
    bear: "#c08552",
    bunny: "#f8f4f0",
    cupid: "#ffe0c7",
    penguin: "#1f2937",
    hen: "#fff7ed",
    dog: "#d6a36b",
    dove: "#f8fafc",
    stork: "#f8fafc",
    fox: "#ea580c",
    lou: "#f1c27d",
  }[id];

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

      {id === "santa" && (
        <g fill="#fff" opacity="0.8" className="char-motion">
          {[30, 75, 230, 270, 120, 200].map((x, i) => (
            <circle key={i} cx={x} cy={-10} r={2 + (i % 3)}>
              <animate attributeName="cy" from="-10" to="330" dur={`${5 + i}s`} begin={`${i * 0.9}s`} repeatCount="indefinite" />
            </circle>
          ))}
        </g>
      )}

      <g className={`char-body ${speaking ? "char-speaking" : ""}`}>

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
      {id === "dove" && (
        <g fill="#e2e8f0">
          <path d="M70 200 Q15 170 22 118 Q50 150 78 158 Q42 128 48 98 Q80 135 95 155 Z" />
          <path d="M230 200 Q285 170 278 118 Q250 150 222 158 Q258 128 252 98 Q220 135 205 155 Z" />
        </g>
      )}
      {id === "fox" && (
        <g>
          <path d="M80 130 L72 40 L135 98 Z" fill="#ea580c" />
          <path d="M88 118 L84 66 L120 100 Z" fill="#3b2314" />
          <path d="M220 130 L228 40 L165 98 Z" fill="#ea580c" />
          <path d="M212 118 L216 66 L180 100 Z" fill="#3b2314" />
        </g>
      )}
      {id === "dog" && (
        <g fill="#7c4a24">
          <ellipse cx="74" cy="170" rx="24" ry="52" transform="rotate(18 74 170)" />
          <ellipse cx="226" cy="170" rx="24" ry="52" transform="rotate(-18 226 170)" />
        </g>
      )}
      {id === "santa" && (
        <g>
          <path d="M70 120 Q95 20 190 30 Q250 40 262 110 L240 118 Q225 70 185 62 Q120 60 100 125 Z" fill="#d62828" />
          <circle cx="262" cy="118" r="20" fill="#fff" className="char-pompom" />
        </g>
      )}

      {/* Head */}
      <ellipse cx="150" cy="165" rx="78" ry="74" fill={skin} />

      {/* Hair and hats */}
      {/* Santa's hat comes down over the top of his head, then the fur band */}
      {id === "santa" && <path d="M70 124 Q74 72 150 66 Q226 72 230 124 Z" fill="#d62828" />}
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
      {id === "penguin" && (
        <g>
          <path d="M150 100 C98 100 84 150 92 190 Q100 238 150 238 Q200 238 208 190 C216 150 202 100 150 100 Z" fill="#fff" />
          <path d="M150 112 C150 100 132 98 132 110 C132 120 150 126 150 132 C150 126 168 120 168 110 C168 98 150 100 150 112 Z" fill="#ec4899" transform="rotate(-18 150 115) translate(-40 -16)" />
        </g>
      )}
      {id === "hen" && (
        <g>
          <circle cx="126" cy="98" r="18" fill="#dc2626" />
          <circle cx="150" cy="86" r="22" fill="#dc2626" />
          <circle cx="174" cy="98" r="18" fill="#dc2626" />
          <ellipse cx="150" cy="104" rx="44" ry="14" fill="#fff7ed" />
          <g transform="translate(206 118)">
            {[0, 72, 144, 216, 288].map((a) => (
              <ellipse key={a} cx="0" cy="-10" rx="7" ry="11" fill="#f9a8d4" transform={`rotate(${a})`} />
            ))}
            <circle r="6" fill="#facc15" />
          </g>
        </g>
      )}
      {id === "dog" && (
        <g>
          <ellipse cx="150" cy="200" rx="40" ry="30" fill="#f1d3ae" />
          <ellipse cx="118" cy="158" rx="20" ry="18" fill="#7c4a24" opacity="0.55" />
          <path d="M70 128 Q74 70 150 70 Q226 70 230 128 Q190 112 150 112 Q110 112 70 128 Z" fill="#64748b" />
          <path d="M60 128 Q150 100 252 124 Q248 140 238 140 Q150 120 66 142 Q58 138 60 128 Z" fill="#475569" />
          <path d="M100 96 Q150 82 200 96" stroke="#475569" strokeWidth="3" fill="none" />
        </g>
      )}
      {id === "dove" && (
        <g>
          {[100, 122, 150, 178, 200].map((x, i) => (
            <circle key={x} cx={x} cy={i % 2 ? 98 : 106} r="11" fill={i % 2 ? "#fde68a" : "#fbcfe8"} />
          ))}
          {[111, 164, 189].map((x) => (
            <ellipse key={x} cx={x} cy="110" rx="9" ry="5" fill="#86efac" />
          ))}
        </g>
      )}
      {id === "stork" && (
        <g>
          <path d="M72 162 Q66 82 150 80 Q234 82 228 162 Q214 124 150 122 Q86 124 72 162 Z" fill="#bae6fd" />
          <path d="M72 162 Q110 140 150 140 Q190 140 228 162" stroke="#7dd3fc" strokeWidth="6" fill="none" />
          <path d="M228 162 Q244 200 222 230" stroke="#f9a8d4" strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M222 230 l-12 6 m12 -6 l2 13" stroke="#f9a8d4" strokeWidth="5" strokeLinecap="round" />
        </g>
      )}
      {id === "fox" && (
        <g fill="#fff">
          <path d="M150 178 Q120 168 82 180 Q86 228 150 238 Q214 228 218 180 Q180 168 150 178 Z" />
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
        <g style={{ transform: `translateY(${browLift}px)`, transition: "transform 120ms" }}>
          <path d="M100 140 Q118 128 134 140" stroke="#fff" strokeWidth="9" fill="none" strokeLinecap="round" />
          <path d="M166 140 Q182 128 200 140" stroke="#fff" strokeWidth="9" fill="none" strokeLinecap="round" />
        </g>
      )}
      {id !== "santa" && (
        <g
          style={{ transform: `translateY(${browLift}px)`, transition: "transform 120ms" }}
          stroke={id === "bunny" || id === "dove" || id === "stork" || id === "hen" ? "#9ca3af" : id === "penguin" ? "#e5e7eb" : "#3b2314"}
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          opacity={id === "lou" ? 0 : 0.7}
        >
          <path d="M106 138 Q118 132 130 138" />
          <path d="M170 138 Q182 132 194 138" />
        </g>
      )}

      {/* Eyes */}
      <ellipse cx="118" cy={160 + lookUp} rx="7" ry={eyeRy} fill="#2b2b2b" />
      <ellipse cx="182" cy={160 + lookUp} rx="7" ry={eyeRy} fill="#2b2b2b" />
      {!blink && (
        <g fill="#fff">
          <circle cx="120.5" cy={156 + lookUp} r="2.2" />
          <circle cx="184.5" cy={156 + lookUp} r="2.2" />
        </g>
      )}

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

      {/* Mouth: a smile at rest, opening with speech */}
      {open < 0.08 && !speaking ? (
        <path
          d={`M${136} ${mouthY - 2} Q150 ${mouthY + 10} ${164} ${mouthY - 2}`}
          stroke="#7a1f1f"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
      ) : (
        <>
          <ellipse cx="150" cy={mouthY} rx={14 + open * 4} ry={3 + open * 13} fill="#7a1f1f" />
          {open > 0.35 && <ellipse cx="150" cy={mouthY + 3 + open * 6} rx="8" ry={open * 5} fill="#e76f6f" />}
        </>
      )}

      {/* Moustache and noses */}
      {id === "santa" && (
        <path d="M150 196 Q120 178 96 200 Q118 214 150 202 Q182 214 204 200 Q180 178 150 196 Z" fill="#f4f4f4" />
      )}
      {id === "santa" && <ellipse cx="150" cy="184" rx="14" ry="12" fill="#f4a19a" />}
      {(id === "bear" || id === "dog" || id === "fox") && <ellipse cx="150" cy="184" rx="14" ry="10" fill="#3b2314" />}
      {(id === "penguin" || id === "dove") && <path d="M138 178 L162 178 L150 194 Z" fill="#f59e0b" />}
      {id === "hen" && (
        <g>
          <path d="M136 176 L164 176 L150 196 Z" fill="#f59e0b" />
          <ellipse cx="150" cy="232" rx="8" ry="12" fill="#dc2626" />
        </g>
      )}
      {id === "stork" && <path d="M138 174 Q150 168 162 174 L152 200 Q150 204 148 200 Z" fill="#fb923c" />}
      {id === "dog" && <path d="M90 240 L150 250 L210 240 L205 262 Q150 274 95 262 Z" fill="#1e3a8a" />}
      {id === "fox" && (
        <g fill="#0d9488">
          <path d="M150 252 L120 238 L120 266 Z" />
          <path d="M150 252 L180 238 L180 266 Z" />
          <circle cx="150" cy="252" r="7" />
        </g>
      )}
      {id === "penguin" && (
        <g fill="#be185d">
          <path d="M150 252 L124 240 L124 264 Z" />
          <path d="M150 252 L176 240 L176 264 Z" />
          <circle cx="150" cy="252" r="6" />
        </g>
      )}
      {id === "bunny" && <path d="M142 180 L158 180 L150 190 Z" fill="#f472b6" />}
      {(id === "cupid" || id === "lou") && <ellipse cx="150" cy="184" rx="8" ry="6" fill="#e5a882" />}
      {id === "bunny" && (
        <g stroke="#9ca3af" strokeWidth="2">
          <path d="M120 188 L85 182 M120 194 L85 198 M180 188 L215 182 M180 194 L215 198" />
        </g>
      )}
      {id === "lou" && <path d="M95 236 Q150 262 205 236 L215 262 Q150 285 85 262 Z" fill="#0d9488" />}
      </g>

      {/* Waving hand */}
      <g className={`char-hand ${waving ? "char-waving" : ""}`}>
        <path d="M215 320 L232 262 L258 268 L248 320 Z" fill={hand.sleeve} />
        <rect x="226" y="252" width="36" height="16" rx="8" fill={hand.cuff} transform="rotate(12 244 260)" />
        <ellipse cx="248" cy="236" rx="19" ry="22" fill={hand.mitt} />
        <ellipse cx="229" cy="242" rx="7" ry="11" fill={hand.mitt} transform="rotate(-35 229 242)" />
      </g>

      {/* Pointing up at the chat bar, until the first message */}
      {pointUp && !waving && !thinking && (
        <g className="char-point hidden lg:inline">
          <path d="M18 320 L34 200 L62 204 L56 320 Z" fill={hand.sleeve} />
          <rect x="28" y="190" width="38" height="16" rx="8" fill={hand.cuff} transform="rotate(4 47 198)" />
          <ellipse cx="48" cy="172" rx="20" ry="19" fill={hand.mitt} />
          {/* Index finger up at the thumb side, other fingers curled */}
          <rect x="50" y="118" width="14" height="50" rx="7" fill={hand.mitt} />
          <g stroke="#000" strokeOpacity="0.18" strokeWidth="2.5" strokeLinecap="round" fill="none">
            <path d="M30 164 Q38 158 47 164" />
            <path d="M30 175 Q38 169 47 175" />
          </g>
          <ellipse cx="50" cy="183" rx="13" ry="6" fill={hand.mitt} stroke="#000" strokeOpacity="0.15" strokeWidth="2" />
        </g>
      )}

      {/* Thinking dots */}
      {thinking && (
        <g fill="#fff">
          <circle cx="62" cy="62" r="18" opacity="0.95" />
          {[50, 62, 74].map((x, i) => (
            <circle key={x} cx={x} cy="62" r="3.5" fill="#64748b">
              <animate attributeName="opacity" values="0.2;1;0.2" dur="1.2s" begin={`${i * 0.2}s`} repeatCount="indefinite" />
            </circle>
          ))}
          <circle cx="84" cy="90" r="6" opacity="0.9" />
          <circle cx="94" cy="104" r="3.5" opacity="0.85" />
        </g>
      )}
    </svg>
  );
}
