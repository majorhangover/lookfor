import type { Region } from "@/lib/types";

/** Small drawn flags, so they look the same everywhere (Windows doesn't show flag emoji). */
export default function Flag({ region, className = "h-3.5 w-5" }: { region: Region; className?: string }) {
  if (region === "UK") {
    return (
      <svg viewBox="0 0 60 30" className={`${className} rounded-[2px] shadow-sm`} aria-hidden>
        <clipPath id="uk-flag-clip">
          <path d="M30 15h30v15zv15H0zH0V0zV0h30z" />
        </clipPath>
        <rect width="60" height="30" fill="#012169" />
        <path d="M0 0l60 30m0-30L0 30" stroke="#fff" strokeWidth="6" />
        <path d="M0 0l60 30m0-30L0 30" clipPath="url(#uk-flag-clip)" stroke="#C8102E" strokeWidth="4" />
        <path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10" />
        <path d="M30 0v30M0 15h60" stroke="#C8102E" strokeWidth="6" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 38 20" className={`${className} rounded-[2px] shadow-sm`} aria-hidden>
      <rect width="38" height="20" fill="#B22234" />
      {[1, 3, 5, 7, 9, 11].map((i) => (
        <rect key={i} y={(i * 20) / 13} width="38" height={20 / 13} fill="#fff" />
      ))}
      <rect width="15.2" height={(7 * 20) / 13} fill="#3C3B6E" />
      <g fill="#fff">
        {[0, 1, 2, 3].flatMap((row) =>
          [0, 1, 2, 3, 4].map((col) => (
            <circle key={`${row}-${col}`} cx={1.6 + col * 3 + (row % 2) * 1.5} cy={1.6 + row * 2.5} r="0.55" />
          )),
        )}
      </g>
    </svg>
  );
}
