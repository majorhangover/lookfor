import { Outfit } from "next/font/google";
import Face, { type FaceId } from "./Face";

const outfit = Outfit({ subsets: ["latin"], weight: ["800"] });

/**
 * The Lookfor banner: the name in the middle, with our characters mixed in
 * among friends and family. Positions are percentages of the banner.
 */
const FACES: { id: FaceId; x: number; y: number; size: number; tilt: number; wide?: boolean }[] = [
  // Left side
  { id: "santa", x: 4, y: 18, size: 78, tilt: -8 },
  { id: "grandma", x: 14, y: 58, size: 56, tilt: 6, wide: true },
  { id: "girl", x: 20, y: 8, size: 48, tilt: 10, wide: true },
  { id: "bear", x: 25, y: 56, size: 62, tilt: -6, wide: true },
  { id: "baby", x: 0, y: 66, size: 44, tilt: 12, wide: true },
  { id: "cupid", x: 29, y: 0, size: 44, tilt: -10, wide: true },
  // Right side
  { id: "lou", x: 84, y: 14, size: 74, tilt: 8 },
  { id: "dad", x: 75, y: 56, size: 58, tilt: -6, wide: true },
  { id: "bunny", x: 72, y: 2, size: 52, tilt: 6, wide: true },
  { id: "mum", x: 67, y: 58, size: 52, tilt: 8, wide: true },
  { id: "grandad", x: 93, y: 64, size: 46, tilt: -10, wide: true },
  { id: "boy", x: 67, y: 4, size: 42, tilt: -8, wide: true },
  { id: "friend", x: 95, y: 34, size: 36, tilt: 12, wide: true },
];

/** An "o" with a pupil in it, so the "oo" in Lookfor looks out at you. */
function Eye() {
  return (
    <span className="relative inline-block">
      o
      <span
        aria-hidden
        className="absolute left-1/2 top-[60%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
        style={{ width: "0.27em", height: "0.27em" }}
      />
      <span
        aria-hidden
        className="logo-pupil absolute left-1/2 top-[60%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-900"
        style={{ width: "0.13em", height: "0.13em" }}
      >
        <span className="absolute right-[18%] top-[18%] h-[30%] w-[30%] rounded-full bg-white" />
      </span>
    </span>
  );
}

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
      <div className="absolute inset-0 flex items-center justify-center text-white">
        {/* The tagline is sized from the logo's font size and justified, so it spans the word exactly. */}
        <div
          className={`${outfit.className} inline-flex flex-col text-6xl leading-none drop-shadow-[0_3px_10px_rgba(0,0,0,0.35)] sm:text-7xl md:text-8xl`}
        >
          <h1 className="tracking-tight">
            L<Eye />
            <Eye />kfor
          </h1>
          <p className="mt-[0.12em] w-0 min-w-full whitespace-nowrap px-[0.15em] font-sans text-[0.3em] font-semibold tracking-[0.01em] opacity-90 [text-align-last:justify] [text-align:justify]">
            gift ideas for everyone
          </p>
        </div>
      </div>
    </div>
  );
}
