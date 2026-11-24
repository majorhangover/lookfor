/** A wrapped present, drawn to match the tree, for occasions other than Christmas. */
export default function Present({ color = "#7c3aed" }: { color?: string }) {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full drop-shadow-md" aria-hidden>
      <rect x="30" y="80" width="140" height="105" rx="8" fill={color} />
      <rect x="22" y="58" width="156" height="34" rx="8" fill={color} />
      <rect x="22" y="58" width="156" height="34" rx="8" fill="#000" opacity="0.12" />
      <rect x="88" y="58" width="24" height="127" fill="#facc15" />
      <path d="M100 58 C70 20 40 40 60 58 Z" fill="#facc15" stroke="#eab308" strokeWidth="3" />
      <path d="M100 58 C130 20 160 40 140 58 Z" fill="#facc15" stroke="#eab308" strokeWidth="3" />
      <circle cx="100" cy="58" r="9" fill="#eab308" />
    </svg>
  );
}
