import type { CharacterId } from "@/lib/occasions";

/** Box and ribbon colours for each host, picked to stand out from that host's page colour. */
const WRAP: Partial<Record<CharacterId, { box: string; ribbon: string }>> = {
  bear: { box: "#22d3ee", ribbon: "#facc15" }, // birthday: purple page
  bunny: { box: "#f9a8d4", ribbon: "#facc15" }, // Easter: green page
  cupid: { box: "#ffffff", ribbon: "#e11d48" }, // Valentine's: red page
  penguin: { box: "#fbbf24", ribbon: "#be185d" }, // anniversary: navy page
  hen: { box: "#fde047", ribbon: "#0d9488" }, // Mother's Day: pink page
  dog: { box: "#f97316", ribbon: "#fde047" }, // Father's Day: blue page
  dove: { box: "#ffffff", ribbon: "#1e3a8a" }, // wedding: gold page
  stork: { box: "#f9a8d4", ribbon: "#ffffff" }, // new baby: sky-blue page
  fox: { box: "#2563eb", ribbon: "#facc15" }, // thank you: orange page
  lou: { box: "#f97316", ribbon: "#fde047" }, // any occasion: teal page
};

/** A wrapped present, drawn to match the tree, for occasions other than Christmas. */
export default function Present({ host }: { host: CharacterId }) {
  const { box, ribbon } = WRAP[host] ?? { box: "#7c3aed", ribbon: "#facc15" };
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full drop-shadow-md" aria-hidden>
      <rect x="30" y="80" width="140" height="105" rx="8" fill={box} />
      <rect x="22" y="58" width="156" height="34" rx="8" fill={box} />
      <rect x="22" y="58" width="156" height="34" rx="8" fill="#000" opacity="0.12" />
      <rect x="88" y="58" width="24" height="127" fill={ribbon} />
      <path d="M100 58 C70 20 40 40 60 58 Z" fill={ribbon} />
      <path d="M100 58 C130 20 160 40 140 58 Z" fill={ribbon} />
      <path d="M100 58 C70 20 40 40 60 58 Z M100 58 C130 20 160 40 140 58 Z" fill="none" stroke="#000" strokeOpacity="0.15" strokeWidth="3" />
      <circle cx="100" cy="58" r="9" fill={ribbon} />
      <circle cx="100" cy="58" r="9" fill="#000" opacity="0.15" />
    </svg>
  );
}
