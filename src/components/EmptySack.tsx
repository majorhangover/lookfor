/** Santa's sack, flat and empty, shown until the first presents arrive. */
export default function EmptySack() {
  return (
    <svg viewBox="0 0 200 140" className="h-full w-full drop-shadow-md" aria-hidden>
      {/* Slumped sack */}
      <path
        d="M30 120 Q22 88 52 70 Q70 60 88 62 L112 62 Q140 60 160 74 Q182 92 172 120 Q100 134 30 120 Z"
        fill="#b91c1c"
      />
      <path d="M30 120 Q100 134 172 120 Q170 128 160 130 Q100 140 40 130 Q30 127 30 120 Z" fill="#7f1d1d" />
      {/* Creases */}
      <g stroke="#7f1d1d" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7">
        <path d="M70 80 Q80 96 74 112" />
        <path d="M126 80 Q118 98 128 114" />
        <path d="M100 74 Q104 92 98 110" />
      </g>
      {/* Gathered neck and drawstring */}
      <path d="M84 64 Q100 50 116 64 Q100 70 84 64 Z" fill="#991b1b" />
      <path d="M80 64 Q100 72 120 64" stroke="#facc15" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M120 64 Q138 58 142 44 M120 64 Q132 72 146 66" stroke="#facc15" strokeWidth="4" fill="none" strokeLinecap="round" />
      {/* White fur trim */}
      <g fill="#fff">
        {[44, 62, 80, 100, 120, 140, 158].map((x, i) => (
          <circle key={x} cx={x} cy={121 + (i % 2) * 2} r="8" />
        ))}
      </g>
    </svg>
  );
}
