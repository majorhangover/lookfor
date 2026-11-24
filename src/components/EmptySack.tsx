import { useId } from "react";

/** Santa's hessian sack, slumped and empty, shown until the first presents arrive. */
export default function EmptySack() {
  const weave = `sack-weave-${useId().replace(/:/g, "")}`;
  return (
    <svg viewBox="0 0 200 140" className="h-full w-full" aria-hidden>
      <defs>
        <pattern id={weave} width="6" height="6" patternUnits="userSpaceOnUse">
          <path d="M0 3 H6 M3 0 V6" stroke="#8a5a2b" strokeWidth="0.8" opacity="0.35" />
        </pattern>
      </defs>
      {/* Shadow on the floor */}
      <ellipse cx="102" cy="130" rx="74" ry="7" fill="#000" opacity="0.18" />
      {/* Slumped body of the sack */}
      <path
        d="M36 126 Q24 100 46 82 Q66 66 90 60 L114 58 Q138 66 156 82 Q182 104 170 126 Q104 136 36 126 Z"
        fill="#c99a5b"
      />
      <path
        d="M36 126 Q24 100 46 82 Q66 66 90 60 L114 58 Q138 66 156 82 Q182 104 170 126 Q104 136 36 126 Z"
        fill={`url(#${weave})`}
      />
      {/* Folds where it has sagged */}
      <g stroke="#8a5a2b" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.55">
        <path d="M64 84 Q74 100 66 120" />
        <path d="M140 84 Q130 102 142 120" />
        <path d="M98 70 Q106 92 100 116" />
      </g>
      {/* Bottom seam with stitches */}
      <path d="M40 122 Q104 132 166 122" stroke="#8a5a2b" strokeWidth="2" strokeDasharray="5 4" fill="none" />
      {/* Patch with a star, so you know it's Santa's */}
      <g transform="rotate(-6 80 102)">
        <rect x="66" y="90" width="30" height="24" rx="3" fill="#b91c1c" />
        <rect x="66" y="90" width="30" height="24" rx="3" fill="none" stroke="#fde68a" strokeWidth="1.5" strokeDasharray="3 2" />
        <path d="M81 94 L83.5 99.5 L89.5 100 L85 104 L86.5 110 L81 107 L75.5 110 L77 104 L72.5 100 L78.5 99.5 Z" fill="#facc15" />
      </g>
      {/* Gathered neck */}
      <path d="M92 60 Q90 48 96 40 L110 40 Q116 48 114 58 Z" fill="#b8874a" />
      {/* Empty top, flopped over to one side */}
      <path d="M96 42 Q104 30 128 34 Q150 40 156 58 Q144 54 132 52 Q118 50 110 44 Z" fill="#c99a5b" />
      <path d="M96 42 Q104 30 128 34 Q150 40 156 58 Q144 54 132 52 Q118 50 110 44 Z" fill={`url(#${weave})`} />
      <path d="M156 58 Q144 54 132 52" stroke="#8a5a2b" strokeWidth="2" fill="none" opacity="0.6" />
      {/* Rope tie with dangling ends */}
      <path d="M89 52 Q103 58 117 51" stroke="#7c4a1e" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M89 52 Q103 58 117 51" stroke="#a16207" strokeWidth="1.5" strokeDasharray="2 3" fill="none" />
      <path d="M92 55 Q80 64 84 78 M94 56 Q90 70 96 80" stroke="#7c4a1e" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <circle cx="84" cy="79" r="3" fill="#7c4a1e" />
      <circle cx="96" cy="81" r="3" fill="#7c4a1e" />
    </svg>
  );
}
