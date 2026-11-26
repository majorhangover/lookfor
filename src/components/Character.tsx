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
  const lookUp = thinking ? -4 : 0;
  const browLift = speaking ? -3 - open * 4 : thinking ? -5 : 0;
  const person = id === "santa" ? null : PEOPLE[id];
  const hand = person
    ? { sleeve: person.top, cuff: person.top, mitt: person.skin }
    : { sleeve: "#d62828", cuff: "#fff", mitt: "#1f7a3a" };
  const mouthY = person ? 192 : 213;

  return (
    <svg viewBox="0 0 300 320" className="w-full h-full" role="img" aria-label={`Cartoon ${id === "santa" ? "Santa" : "host"}`}>
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
        {person ? (
          <PersonParts p={person} open={open} speaking={speaking} blink={blink} lookUp={lookUp} browLift={browLift} mouthY={mouthY} />
        ) : (
          <SantaParts open={open} speaking={speaking} blink={blink} lookUp={lookUp} browLift={browLift} mouthY={mouthY} />
        )}
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

type FaceProps = { open: number; speaking: boolean; blink: boolean; lookUp: number; browLift: number; mouthY: number };

function Mouth({ open, speaking, mouthY, lip = "#7a1f1f", width = 14 }: { open: number; speaking: boolean; mouthY: number; lip?: string; width?: number }) {
  return open < 0.08 && !speaking ? (
    <path
      d={`M${150 - width} ${mouthY - 2} Q150 ${mouthY + 9} ${150 + width} ${mouthY - 2}`}
      stroke={lip}
      strokeWidth="4"
      fill="none"
      strokeLinecap="round"
    />
  ) : (
    <>
      <ellipse cx="150" cy={mouthY} rx={width - 2 + open * 4} ry={3 + open * 11} fill="#7a1f1f" />
      {open > 0.35 && <ellipse cx="150" cy={mouthY + 3 + open * 5} rx="7" ry={open * 4} fill="#e76f6f" />}
    </>
  );
}

function SantaParts({ open, speaking, blink, lookUp, browLift, mouthY }: FaceProps) {
  const eyeRy = blink ? 1 : 9;
  return (
    <>
      <path d="M70 120 Q95 20 190 30 Q250 40 262 110 L240 118 Q225 70 185 62 Q120 60 100 125 Z" fill="#d62828" />
      <circle cx="262" cy="118" r="20" fill="#fff" className="char-pompom" />
      <ellipse cx="150" cy="165" rx="78" ry="74" fill="#ffd9b8" />
      {/* The hat comes down over the top of his head, then the fur band */}
      <path d="M70 124 Q74 72 150 66 Q226 72 230 124 Z" fill="#d62828" />
      <rect x="62" y="104" width="176" height="34" rx="17" fill="#fff" />
      <g style={{ transform: `translateY(${browLift}px)`, transition: "transform 120ms" }}>
        <path d="M100 140 Q118 128 134 140" stroke="#fff" strokeWidth="9" fill="none" strokeLinecap="round" />
        <path d="M166 140 Q182 128 200 140" stroke="#fff" strokeWidth="9" fill="none" strokeLinecap="round" />
      </g>
      <ellipse cx="118" cy={160 + lookUp} rx="7" ry={eyeRy} fill="#2b2b2b" />
      <ellipse cx="182" cy={160 + lookUp} rx="7" ry={eyeRy} fill="#2b2b2b" />
      {!blink && (
        <g fill="#fff">
          <circle cx="120.5" cy={156 + lookUp} r="2.2" />
          <circle cx="184.5" cy={156 + lookUp} r="2.2" />
        </g>
      )}
      <circle cx="98" cy="190" r="20" fill="url(#cheek)" />
      <circle cx="202" cy="190" r="20" fill="url(#cheek)" />
      <path d="M72 175 Q70 270 150 300 Q230 270 228 175 Q210 205 185 200 Q150 240 115 200 Q90 205 72 175 Z" fill="#fff" />
      <Mouth open={open} speaking={speaking} mouthY={mouthY} />
      <path d="M150 196 Q120 178 96 200 Q118 214 150 202 Q182 214 204 200 Q180 178 150 196 Z" fill="#f4f4f4" />
      <ellipse cx="150" cy="184" rx="14" ry="12" fill="#f4a19a" />
    </>
  );
}

type Hair = "short" | "long" | "bob" | "bun" | "curly" | "updo" | "ponytail";
type Extra = "glasses" | "beard" | "stubble" | "cap" | "pearls" | "bowtie" | "tie" | "daisy" | "flowers" | "heart" | "hoops" | "studs" | "collar" | "cardigan";

interface Person {
  skin: string;
  hair: string;
  style: Hair;
  top: string;
  extras: Extra[];
  lip?: string;
}

/** The grown-up hosts for every occasion except Christmas. Ids stay the same so saved choices and voices keep working. */
const PEOPLE: Record<Exclude<CharacterId, "santa">, Person> = {
  bear: { skin: "#c68642", hair: "#2b1a12", style: "curly", top: "#7c3aed", extras: ["hoops"], lip: "#8a2c3a" },
  bunny: { skin: "#ffdbac", hair: "#e0b458", style: "bob", top: "#16a34a", extras: ["daisy", "cardigan"], lip: "#b4505a" },
  cupid: { skin: "#e0ac69", hair: "#5a1e12", style: "long", top: "#be123c", extras: ["heart", "studs"], lip: "#9f1239" },
  penguin: { skin: "#f1c27d", hair: "#9ca3af", style: "short", top: "#1e293b", extras: ["collar", "bowtie"] },
  hen: { skin: "#ffe0c7", hair: "#9a4a24", style: "bun", top: "#db2777", extras: ["pearls", "cardigan"], lip: "#b4505a" },
  dog: { skin: "#c68642", hair: "#3b2314", style: "short", top: "#1d4ed8", extras: ["cap", "beard"] },
  dove: { skin: "#6b3e26", hair: "#1a1a1a", style: "updo", top: "#f5e6c8", extras: ["flowers", "studs"], lip: "#7a2b33" },
  stork: { skin: "#f3d2b3", hair: "#7a5230", style: "ponytail", top: "#0284c7", extras: ["studs"], lip: "#b4505a" },
  fox: { skin: "#ffdbac", hair: "#c2410c", style: "short", top: "#15803d", extras: ["stubble", "collar"] },
  lou: { skin: "#f1c27d", hair: "#3b2314", style: "short", top: "#0d9488", extras: ["glasses"] },
};

function PersonParts({ p, open, speaking, blink, lookUp, browLift, mouthY }: FaceProps & { p: Person }) {
  const has = (e: Extra) => p.extras.includes(e);
  const eyeRy = blink ? 1 : 6.5;
  const shade = "rgba(0,0,0,0.12)";
  return (
    <>
      {/* Hair behind the head */}
      {p.style === "long" && <path d="M80 150 Q72 62 150 62 Q228 62 220 150 L230 262 Q150 280 70 262 Z" fill={p.hair} />}
      {p.style === "bob" && <path d="M82 150 Q76 64 150 64 Q224 64 218 150 L222 212 Q206 222 194 210 L106 210 Q94 222 78 212 Z" fill={p.hair} />}
      {p.style === "curly" && (
        <g fill={p.hair}>
          {[[88, 110], [80, 140], [80, 172], [86, 202], [212, 110], [220, 140], [220, 172], [214, 202], [100, 84], [200, 84], [124, 70], [150, 64], [176, 70]].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="24" />
          ))}
        </g>
      )}
      {p.style === "ponytail" && <path d="M206 112 Q252 120 244 196 Q238 230 222 238 Q232 190 214 150 Z" fill={p.hair} />}
      {p.style === "bun" && <circle cx="150" cy="70" r="24" fill={p.hair} />}
      {p.style === "updo" && <ellipse cx="150" cy="68" rx="34" ry="24" fill={p.hair} />}

      {/* Shoulders and neck */}
      <path d="M44 320 Q48 258 108 244 L192 244 Q252 258 256 320 Z" fill={p.top} />
      {has("cardigan") && (
        <g fill="#000" opacity="0.14">
          <path d="M108 244 L140 320 L120 320 L96 248 Z" />
          <path d="M192 244 L160 320 L180 320 L204 248 Z" />
        </g>
      )}
      <path d="M130 200 L130 246 Q150 262 170 246 L170 200 Z" fill={p.skin} />
      <path d="M130 214 Q150 232 170 214 L170 226 Q150 240 130 226 Z" fill={shade} />
      {has("collar") && (
        <g>
          <path d="M126 240 L150 264 L174 240 L188 248 L150 286 L112 248 Z" fill="#fff" />
        </g>
      )}
      {has("bowtie") && (
        <g fill="#db2777">
          <path d="M150 262 L130 252 L130 274 Z" />
          <path d="M150 262 L170 252 L170 274 Z" />
          <circle cx="150" cy="263" r="5" />
        </g>
      )}
      {has("pearls") && (
        <g fill="#fdfaf3" stroke="#e7dccb" strokeWidth="0.8">
          {[-4, -3, -2, -1, 0, 1, 2, 3, 4].map((i) => (
            <circle key={i} cx={150 + i * 7} cy={256 - Math.abs(i) * Math.abs(i) * 0.9 + 2} r="3.4" />
          ))}
        </g>
      )}
      {has("heart") && (
        <g>
          <path d="M128 246 Q150 266 172 246" stroke="#fcd34d" strokeWidth="1.6" fill="none" />
          <path d="M150 262 C150 257 143 256 143 261 C143 265 150 268 150 271 C150 268 157 265 157 261 C157 256 150 257 150 262 Z" fill="#fcd34d" />
        </g>
      )}

      {/* Ears and head */}
      <ellipse cx="89" cy="156" rx="9" ry="14" fill={p.skin} />
      <ellipse cx="211" cy="156" rx="9" ry="14" fill={p.skin} />
      <ellipse cx="150" cy="148" rx="62" ry="72" fill={p.skin} />
      {has("hoops") && (
        <g stroke="#fbbf24" strokeWidth="3" fill="none">
          <circle cx="88" cy="180" r="9" />
          <circle cx="212" cy="180" r="9" />
        </g>
      )}
      {has("studs") && (
        <g fill="#fde68a">
          <circle cx="89" cy="168" r="3.5" />
          <circle cx="211" cy="168" r="3.5" />
        </g>
      )}

      {/* Hair in front */}
      {(p.style === "short") && <path d="M86 150 Q80 72 150 70 Q220 72 214 150 Q210 112 192 102 Q160 112 120 100 Q94 108 86 150 Z" fill={p.hair} />}
      {(p.style === "long" || p.style === "bob" || p.style === "ponytail") && (
        <path d="M86 150 Q82 72 150 70 Q218 72 214 150 Q206 108 178 96 Q150 118 110 112 Q94 122 86 150 Z" fill={p.hair} />
      )}
      {(p.style === "bun" || p.style === "updo") && (
        <path d="M88 146 Q84 80 150 78 Q216 80 212 146 Q204 104 150 98 Q96 104 88 146 Z" fill={p.hair} />
      )}
      {p.style === "curly" && (
        <g fill={p.hair}>
          {[[104, 100], [128, 88], [152, 84], [176, 88], [198, 102]].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="20" />
          ))}
        </g>
      )}
      {has("cap") && (
        <g>
          <path d="M84 120 Q86 66 150 64 Q214 66 216 120 Q182 104 150 104 Q118 104 84 120 Z" fill="#64748b" />
          <path d="M80 122 Q150 92 236 116 Q232 132 220 130 Q150 112 86 134 Q76 130 80 122 Z" fill="#475569" />
          <path d="M104 86 Q150 74 196 86" stroke="#475569" strokeWidth="3" fill="none" />
        </g>
      )}
      {has("daisy") && (
        <g transform="translate(196 104)">
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <ellipse key={a} cx="0" cy="-9" rx="4.5" ry="8" fill="#fff" transform={`rotate(${a})`} />
          ))}
          <circle r="5.5" fill="#facc15" />
        </g>
      )}
      {has("flowers") && (
        <g>
          {[[118, 74], [134, 60], [150, 56], [166, 60], [182, 74]].map(([x, y], i) => (
            <circle key={x} cx={x} cy={y} r="6.5" fill={i % 2 ? "#fef3c7" : "#fff"} />
          ))}
          {[[126, 66], [174, 66]].map(([x, y]) => (
            <ellipse key={x} cx={x} cy={y} rx="6" ry="3.5" fill="#86efac" />
          ))}
        </g>
      )}

      {/* Brows, eyes, nose */}
      <g
        style={{ transform: `translateY(${browLift}px)`, transition: "transform 120ms" }}
        stroke={p.hair}
        strokeWidth="4.5"
        strokeLinecap="round"
        fill="none"
      >
        <path d="M112 134 Q124 128 138 133" />
        <path d="M162 133 Q176 128 188 134" />
      </g>
      <ellipse cx="126" cy={152 + lookUp} rx="5.5" ry={eyeRy} fill="#2b2b2b" />
      <ellipse cx="174" cy={152 + lookUp} rx="5.5" ry={eyeRy} fill="#2b2b2b" />
      {!blink && (
        <g fill="#fff">
          <circle cx="127.8" cy={149.5 + lookUp} r="1.7" />
          <circle cx="175.8" cy={149.5 + lookUp} r="1.7" />
        </g>
      )}
      {has("glasses") && (
        <g fill="none" stroke="#0e7490" strokeWidth="4">
          <rect x="106" y="138" width="40" height="30" rx="11" />
          <rect x="154" y="138" width="40" height="30" rx="11" />
          <path d="M146 150 Q150 146 154 150" />
        </g>
      )}
      <path d="M151 156 Q146 172 142 176 Q149 180 157 177" stroke="#000" strokeOpacity="0.22" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="110" cy="178" r="13" fill="url(#cheek)" opacity="0.45" />
      <circle cx="190" cy="178" r="13" fill="url(#cheek)" opacity="0.45" />

      {has("beard") && (
        <path d="M90 160 Q90 236 150 240 Q210 236 210 160 Q204 196 180 202 Q150 194 120 202 Q96 196 90 160 Z" fill={p.hair} />
      )}
      {has("stubble") && (
        <path d="M94 170 Q98 226 150 232 Q202 226 206 170 Q200 204 150 210 Q100 204 94 170 Z" fill={p.hair} opacity="0.35" />
      )}
      <Mouth open={open} speaking={speaking} mouthY={mouthY} lip={p.lip} width={13} />
    </>
  );
}
