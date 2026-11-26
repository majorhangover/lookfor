import { useId } from "react";

/**
 * A cartoon Christmas tree that stands beside Santa: three snowy tiers, a
 * string of twinkling lights, a ribbon and a red pot. It sways gently all the
 * time; `lit` (gifts have arrived) adds sparkles and a glowing star.
 */
export default function ChristmasTree({ lit = false }: { lit?: boolean }) {
  // Each tree needs its own gradient ids, or a hidden copy could blank the other.
  const uid = useId().replace(/:/g, "");
  const green = `tree-green-${uid}`;
  const pot = `tree-pot-${uid}`;

  const tiers = [
    { top: 0, base: 96, half: 50, bumps: 4 },
    { top: 46, base: 176, half: 76, bumps: 5 },
    { top: 114, base: 262, half: 97, bumps: 6 },
  ];
  /** A tier with a scalloped lower edge, like branches drooping under snow. */
  const tierPath = ({ top, base, half, bumps }: (typeof tiers)[number]) => {
    const w = (half * 2) / bumps;
    let d = `M100 ${top} Q${100 + half * 0.45} ${(top + base) / 2} ${100 + half} ${base}`;
    for (let i = 0; i < bumps; i++) {
      const x = 100 + half - w * (i + 1);
      d += ` Q${x + w / 2} ${base + 11} ${x} ${base}`;
    }
    return `${d} Q${100 - half * 0.45} ${(top + base) / 2} 100 ${top} Z`;
  };
  /** The snow along a tier's edge: a thin wavy band hugging the scallops. */
  const snowPath = ({ base, half, bumps }: (typeof tiers)[number]) => {
    const w = (half * 2) / bumps;
    let d = `M${100 + half} ${base}`;
    for (let i = 0; i < bumps; i++) {
      const x = 100 + half - w * (i + 1);
      d += ` Q${x + w / 2} ${base + 11} ${x} ${base}`;
    }
    for (let i = bumps - 1; i >= 0; i--) {
      const x = 100 + half - w * (i + 1);
      d += ` Q${x + w / 2} ${base + 3} ${x + w} ${base - 3}`;
    }
    return `${d} Z`;
  };

  // Strings of lights: [start x, start y, bend x, bend y, end x, end y, bulbs]
  const strings = [
    [66, 58, 100, 84, 136, 62, 4],
    [40, 128, 100, 166, 162, 132, 6],
    [22, 210, 100, 252, 182, 214, 7],
  ] as const;
  const colours = ["#facc15", "#ef4444", "#60a5fa", "#f472b6", "#4ade80"];
  const bulbs = strings.flatMap(([x0, y0, cx, cy, x1, y1, n], s) =>
    Array.from({ length: n }, (_, k) => {
      const t = (k + 1) / (n + 1);
      const x = (1 - t) ** 2 * x0 + 2 * (1 - t) * t * cx + t ** 2 * x1;
      const y = (1 - t) ** 2 * y0 + 2 * (1 - t) * t * cy + t ** 2 * y1;
      return { x, y, c: colours[(s * 2 + k) % colours.length] };
    }),
  );
  const sparkles = [
    [62, 95, 0],
    [140, 70, 0.5],
    [40, 205, 1.1],
    [160, 195, 0.3],
    [100, 135, 0.8],
    [118, 240, 1.4],
  ] as const;

  return (
    <>
      <svg
        viewBox="0 0 200 300"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
        aria-hidden
      >
        <defs>
          <linearGradient id={green} x1="0" x2="1">
            <stop offset="0%" stopColor="#0f5132" />
            <stop offset="45%" stopColor="#1f8a4c" />
            <stop offset="100%" stopColor="#14693a" />
          </linearGradient>
          <linearGradient id={pot} x1="0" x2="1">
            <stop offset="0%" stopColor="#991b1b" />
            <stop offset="50%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#991b1b" />
          </linearGradient>
        </defs>
        {/* Trunk and pot */}
        <rect x="91" y="256" width="18" height="20" fill="#6b3f1d" />
        <path d="M68 272 H132 L126 300 H74 Z" fill={`url(#${pot})`} />
        <rect x="64" y="268" width="72" height="9" rx="3" fill="#b91c1c" />
        <rect x="64" y="271" width="72" height="3" fill="#facc15" opacity="0.9" />
        {/* Tiers, bottom first so the upper ones overlap */}
        {[...tiers].reverse().map((t, i) => (
          <g key={i}>
            <path d={tierPath(t)} fill={`url(#${green})`} />
            {/* A soft highlight down the right of each tier */}
            <path
              d={`M100 ${t.top + 6} Q${100 + t.half * 0.4} ${(t.top + t.base) / 2} ${100 + t.half * 0.78} ${t.base - 2} L${100 + t.half * 0.5} ${t.base} Q${100 + t.half * 0.2} ${(t.top + t.base) / 2 + 8} 100 ${t.top + 6} Z`}
              fill="#4ade80"
              opacity="0.18"
            />
            <path d={snowPath(t)} fill="#f8fafc" opacity="0.95" />
          </g>
        ))}
        {/* Light strings */}
        <g fill="none" stroke="#0b3d24" strokeWidth="1.2" vectorEffect="non-scaling-stroke">
          {strings.map(([x0, y0, cx, cy, x1, y1], i) => (
            <path key={i} d={`M${x0} ${y0} Q${cx} ${cy} ${x1} ${y1}`} />
          ))}
        </g>
        {bulbs.map(({ x, y, c }, i) => (
          <g key={i} className="tree-light" style={{ animationDelay: `${(i * 0.43) % 1.8}s` }}>
            <ellipse cx={x} cy={y + 1} rx="9" ry="6.5" fill={c} opacity="0.35" />
            <ellipse cx={x} cy={y + 1} rx="4.6" ry="3.6" fill={c} />
            <ellipse cx={x - 1} cy={y} rx="1.5" ry="1.1" fill="#fff" opacity="0.8" />
          </g>
        ))}
        {/* Sparkles, only once the gifts are under the tree */}
        {lit &&
          sparkles.map(([x, y, d], i) => (
            <path
              key={i}
              d={`M${x} ${y - 9} Q${x} ${y} ${x + 6} ${y} Q${x} ${y} ${x} ${y + 9} Q${x} ${y} ${x - 6} ${y} Q${x} ${y} ${x} ${y - 9} Z`}
              fill="#fff"
              className="tree-sparkle"
              style={{ animationDelay: `${d}s` }}
            />
          ))}
      </svg>
      {/* The star sits in its own box so it isn't stretched with the tree. */}
      <svg
        viewBox="-14 -14 28 28"
        className={`pointer-events-none absolute left-1/2 -top-6 h-11 w-11 -translate-x-1/2 ${lit ? "tree-star-lit" : "tree-star"}`}
        aria-hidden
      >
        <path
          d="M0 -12 L3.5 -4 L12 -3.7 L5.5 2 L7.4 10.5 L0 6 L-7.4 10.5 L-5.5 2 L-12 -3.7 L-3.5 -4 Z"
          fill="#facc15"
          stroke="#fef9c3"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      </svg>
    </>
  );
}
