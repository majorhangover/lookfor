import { Outfit } from "next/font/google";

const outfit = Outfit({ subsets: ["latin"], weight: ["800"] });

type FaceId =
  | "santa"
  | "bear"
  | "bunny"
  | "cupid"
  | "lou"
  | "grandma"
  | "dad"
  | "girl"
  | "mum"
  | "grandad"
  | "boy"
  | "baby"
  | "friend";

/** Small, still head-and-shoulders faces: our characters plus everyday people. */
function Face({ id }: { id: FaceId }) {
  const skin: Record<FaceId, string> = {
    santa: "#ffd9b8",
    bear: "#c08552",
    bunny: "#f8f4f0",
    cupid: "#ffe0c7",
    lou: "#f1c27d",
    grandma: "#f3d2b3",
    dad: "#8d5524",
    girl: "#e0ac69",
    mum: "#c68642",
    grandad: "#ffdbac",
    boy: "#f1c27d",
    baby: "#ffe0c7",
    friend: "#6b3e26",
  };
  const bg: Record<FaceId, string> = {
    santa: "#14532d",
    bear: "#f59e0b",
    bunny: "#a7f3d0",
    cupid: "#fbcfe8",
    lou: "#99f6e4",
    grandma: "#c4b5fd",
    dad: "#93c5fd",
    girl: "#fde68a",
    mum: "#fecaca",
    grandad: "#bbf7d0",
    boy: "#fdba74",
    baby: "#bae6fd",
    friend: "#f9a8d4",
  };
  const eyes = (
    <g fill="#2b2b2b">
      <ellipse cx="41" cy="52" rx="3" ry="4" />
      <ellipse cx="59" cy="52" rx="3" ry="4" />
    </g>
  );
  const smile = <path d="M43 63 Q50 69 57 63" stroke="#7a1f1f" strokeWidth="2.5" fill="none" strokeLinecap="round" />;
  const cheeks = (
    <g fill="#ff8a8a" opacity="0.35">
      <circle cx="35" cy="61" r="5" />
      <circle cx="65" cy="61" r="5" />
    </g>
  );

  return (
    <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-md" aria-hidden>
      <defs>
        <clipPath id={`clip-${id}`}>
          <circle cx="50" cy="50" r="48" />
        </clipPath>
      </defs>
      <circle cx="50" cy="50" r="48" fill={bg[id]} stroke="#fff" strokeWidth="3" />
      <g clipPath={`url(#clip-${id})`}>
        {/* Shoulders */}
        <path
          d="M14 100 Q16 80 50 78 Q84 80 86 100 Z"
          fill={
            { santa: "#d62828", lou: "#0d9488", dad: "#1e3a8a", mum: "#7c3aed", grandma: "#be185d", grandad: "#57534e", girl: "#16a34a", boy: "#dc2626", baby: "#fef3c7", friend: "#0f766e", bear: "#c08552", bunny: "#f8f4f0", cupid: "#ffe0c7" }[id]
          }
        />

        {/* Behind the head */}
        {id === "bunny" && (
          <g fill="#f8f4f0">
            <ellipse cx="38" cy="18" rx="8" ry="20" />
            <ellipse cx="62" cy="18" rx="8" ry="20" />
            <ellipse cx="38" cy="19" rx="4" ry="14" fill="#f9b4c8" />
            <ellipse cx="62" cy="19" rx="4" ry="14" fill="#f9b4c8" />
          </g>
        )}
        {id === "bear" && (
          <g>
            <circle cx="28" cy="34" r="10" fill="#c08552" />
            <circle cx="72" cy="34" r="10" fill="#c08552" />
            <circle cx="28" cy="34" r="5" fill="#e8b98a" />
            <circle cx="72" cy="34" r="5" fill="#e8b98a" />
          </g>
        )}
        {(id === "mum" || id === "girl") && (
          <path d="M24 60 Q20 26 50 24 Q80 26 76 60 L76 80 L24 80 Z" fill={id === "mum" ? "#2b1a10" : "#a0522d"} />
        )}
        {id === "grandma" && <circle cx="50" cy="22" r="9" fill="#d1d5db" />}

        {/* Head */}
        <ellipse cx="50" cy="55" rx="22" ry="23" fill={skin[id]} />

        {/* Hair and hats */}
        {id === "santa" && (
          <g>
            <path d="M26 44 Q34 12 62 14 Q80 18 82 40 L74 42 Q70 26 58 24 Q40 24 34 46 Z" fill="#d62828" />
            <rect x="25" y="38" width="50" height="10" rx="5" fill="#fff" />
            <circle cx="81" cy="41" r="6" fill="#fff" />
          </g>
        )}
        {id === "bear" && <ellipse cx="50" cy="65" rx="11" ry="8" fill="#e8b98a" />}
        {id === "cupid" && (
          <g fill="#f6c453">
            {[32, 42, 50, 58, 68].map((x, i) => (
              <circle key={x} cx={x} cy={i % 2 ? 34 : 37} r="7" />
            ))}
          </g>
        )}
        {id === "lou" && <path d="M27 52 Q26 30 50 30 Q74 30 73 52 Q66 40 50 40 Q34 40 27 52 Z" fill="#3b2314" />}
        {id === "mum" && <path d="M28 50 Q30 30 50 30 Q70 30 72 50 Q60 38 50 42 Q40 38 28 50 Z" fill="#2b1a10" />}
        {id === "girl" && (
          <g fill="#a0522d">
            <path d="M28 50 Q30 30 50 30 Q70 30 72 50 Q50 36 28 50 Z" />
            <circle cx="22" cy="48" r="7" />
            <circle cx="78" cy="48" r="7" />
          </g>
        )}
        {id === "grandma" && <path d="M28 52 Q28 30 50 30 Q72 30 72 52 Q62 38 50 38 Q38 38 28 52 Z" fill="#d1d5db" />}
        {id === "dad" && <path d="M28 48 Q30 30 50 30 Q70 30 72 48 Q62 40 50 40 Q38 40 28 48 Z" fill="#1c1917" />}
        {id === "friend" && <path d="M26 50 Q22 26 50 26 Q78 26 74 50 Q70 36 50 38 Q30 36 26 50 Z" fill="#111" />}
        {id === "grandad" && <path d="M28 52 Q28 42 34 40 M72 52 Q72 42 66 40" stroke="#e5e7eb" strokeWidth="5" fill="none" />}
        {id === "boy" && (
          <g>
            <path d="M28 46 Q30 28 50 28 Q70 28 72 46 Z" fill="#2563eb" />
            <path d="M68 44 L84 46 L70 48 Z" fill="#1d4ed8" />
          </g>
        )}
        {id === "baby" && <path d="M48 32 Q52 26 54 32" stroke="#a16207" strokeWidth="2.5" fill="none" strokeLinecap="round" />}

        {eyes}
        {cheeks}

        {/* Glasses */}
        {(id === "lou" || id === "grandma" || id === "grandad") && (
          <g stroke={id === "lou" ? "#0e7490" : "#44403c"} strokeWidth="2" fill="none">
            <circle cx="41" cy="52" r="6" />
            <circle cx="59" cy="52" r="6" />
            <path d="M47 52 L53 52" />
          </g>
        )}

        {/* Beards, noses, mouths */}
        {id === "santa" ? (
          <g>
            <path d="M28 58 Q28 88 50 92 Q72 88 72 58 Q66 66 58 64 Q50 74 42 64 Q34 66 28 58 Z" fill="#fff" />
            <path d="M50 63 Q40 57 33 64 Q41 68 50 65 Q59 68 67 64 Q60 57 50 63 Z" fill="#f4f4f4" />
            <ellipse cx="50" cy="59" rx="4.5" ry="4" fill="#f4a19a" />
          </g>
        ) : id === "grandad" ? (
          <g>
            <path d="M36 66 Q50 82 64 66 Q58 72 50 72 Q42 72 36 66 Z" fill="#e5e7eb" />
            <path d="M42 64 Q50 60 58 64" stroke="#e5e7eb" strokeWidth="4" fill="none" strokeLinecap="round" />
          </g>
        ) : id === "dad" ? (
          <g>
            <path d="M30 60 Q32 80 50 80 Q68 80 70 60 Q66 70 50 70 Q34 70 30 60 Z" fill="#1c1917" />
            {smile}
          </g>
        ) : id === "bear" ? (
          <g>
            <ellipse cx="50" cy="61" rx="4.5" ry="3.5" fill="#3b2314" />
            {smile}
          </g>
        ) : id === "bunny" ? (
          <g>
            <path d="M47 59 L53 59 L50 62 Z" fill="#f472b6" />
            {smile}
          </g>
        ) : id === "baby" ? (
          <circle cx="50" cy="66" r="3" fill="#7a1f1f" />
        ) : (
          smile
        )}
      </g>
    </svg>
  );
}

/**
 * The Lookfor banner: the name in the middle, with our characters mixed in
 * among friends and family. Positions are percentages of the banner.
 */
const FACES: { id: FaceId; x: number; y: number; size: number; tilt: number; wide?: boolean }[] = [
  // Left side
  { id: "santa", x: 4, y: 18, size: 78, tilt: -8 },
  { id: "grandma", x: 14, y: 58, size: 56, tilt: 6 },
  { id: "girl", x: 20, y: 8, size: 48, tilt: 10, wide: true },
  { id: "bear", x: 25, y: 56, size: 62, tilt: -6, wide: true },
  { id: "baby", x: 0, y: 66, size: 44, tilt: 12, wide: true },
  { id: "cupid", x: 29, y: 0, size: 44, tilt: -10, wide: true },
  // Right side
  { id: "lou", x: 84, y: 14, size: 74, tilt: 8 },
  { id: "dad", x: 75, y: 56, size: 58, tilt: -6 },
  { id: "bunny", x: 72, y: 2, size: 52, tilt: 6, wide: true },
  { id: "mum", x: 67, y: 58, size: 52, tilt: 8, wide: true },
  { id: "grandad", x: 93, y: 64, size: 46, tilt: -10, wide: true },
  { id: "boy", x: 67, y: 4, size: 42, tilt: -8, wide: true },
  { id: "friend", x: 95, y: 34, size: 36, tilt: 12, wide: true },
];

export default function Logo() {
  return (
    <div className="relative mx-auto h-36 w-full max-w-5xl select-none sm:h-44">
      {FACES.map((f, i) => (
        <div
          key={f.id}
          className={`logo-face absolute ${f.wide ? "hidden sm:block" : ""}`}
          style={{
            left: `${f.x}%`,
            top: `${f.y}%`,
            width: `clamp(${Math.round(f.size * 0.7)}px, ${f.size / 10}vw, ${f.size}px)`,
            aspectRatio: "1",
            rotate: `${f.tilt}deg`,
            animationDelay: `${(i % 5) * 0.6}s`,
          }}
        >
          <Face id={f.id} />
        </div>
      ))}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white">
        <h1
          className={`${outfit.className} text-6xl leading-none tracking-tight drop-shadow-[0_3px_10px_rgba(0,0,0,0.35)] sm:text-7xl md:text-8xl`}
        >
          Lookfor
        </h1>
        <p className="mt-1 text-base font-medium opacity-90 sm:text-lg">gift ideas for everyone</p>
      </div>
    </div>
  );
}
