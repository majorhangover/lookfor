import { useId } from "react";

/**
 * A cartoon Christmas tree drawn behind Santa's chat. Santa's head sits at the
 * top, the chat hangs in the branches, and the trunk ends below the message box,
 * right above the presents. Stretches to fit whatever height the chat is.
 * `baseOnly` draws just the lowest branches and trunk, for wide screens.
 */
export default function ChristmasTree({ baseOnly = false }: { baseOnly?: boolean }) {
  // Each tree needs its own gradient id: a hidden copy would otherwise blank the other.
  const green = `tree-green-${useId().replace(/:/g, "")}`;
  const tiers = [
    { top: 0, base: 70, half: 38 },
    { top: 35, base: 135, half: 62 },
    { top: 95, base: 205, half: 84 },
    { top: 160, base: 275, half: 100 },
  ];
  const baubles = [
    [88, 55, "#facc15"], [116, 62, "#ef4444"],
    [70, 110, "#60a5fa"], [128, 118, "#facc15"],
    [50, 180, "#ef4444"], [150, 175, "#60a5fa"], [95, 165, "#facc15"], [125, 190, "#f472b6"],
    [30, 255, "#facc15"], [170, 250, "#ef4444"], [75, 240, "#60a5fa"], [140, 230, "#facc15"], [105, 260, "#ef4444"],
  ] as const;
  return (
    <svg
      viewBox={baseOnly ? "0 190 200 110" : "0 0 200 300"}
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden
    >
      <defs>
        <linearGradient id={green} x1="0" x2="1">
          <stop offset="0%" stopColor="#166534" />
          <stop offset="55%" stopColor="#22a04b" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>
      </defs>
      {/* Trunk */}
      <rect x="88" y="272" width="24" height="28" rx="2" fill="#7c4a1e" />
      {/* Branches */}
      {tiers.map((t, i) => (
        <path
          key={i}
          d={`M100 ${t.top} L${100 + t.half} ${t.base} Q100 ${t.base + 8} ${100 - t.half} ${t.base} Z`}
          fill={`url(#${green})`}
          stroke="#14532d"
          strokeWidth="0.6"
          vectorEffect="non-scaling-stroke"
        />
      ))}
      {/* Tinsel */}
      <g fill="none" stroke="#fde68a" strokeWidth="2.5" strokeDasharray="1 4" strokeLinecap="round" vectorEffect="non-scaling-stroke">
        <path d="M72 75 Q100 92 132 80" />
        <path d="M50 140 Q100 165 152 145" />
        <path d="M28 212 Q100 240 176 215" />
      </g>
      {/* Baubles */}
      {baubles.map(([x, y, c], i) => (
        <ellipse key={i} cx={x} cy={y} rx="4" ry="2.6" fill={c} stroke="#fff" strokeOpacity="0.6" strokeWidth="0.6" />
      ))}
    </svg>
  );
}
