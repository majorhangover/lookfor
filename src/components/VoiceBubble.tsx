"use client";

/**
 * A speech bubble beside the character's head that turns the voice on or off.
 * The label says what a tap does: "Hear Santa" when off, "Mute" when on.
 * The sound waves pulse while the character is talking.
 */
export default function VoiceBubble({
  on,
  speaking,
  name,
  accent,
  onToggle,
}: {
  on: boolean;
  speaking: boolean;
  name: string;
  accent: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={on}
      aria-label={on ? `Turn ${name}'s voice off` : `Hear ${name}'s voice`}
      title={on ? `Turn ${name}'s voice off` : `Hear ${name}'s voice`}
      className={`voice-bubble group absolute -right-3 top-2 z-10 flex items-center gap-1.5 rounded-2xl bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-lg ring-1 ring-black/5 transition hover:scale-105 md:-right-6 ${on ? "" : "voice-bubble-invite"}`}
    >
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
        <path d="M4 9h3l5-4v14l-5-4H4z" fill={accent} />
        <g fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round">
          <path className={on && speaking ? "voice-wave" : ""} d="M15.5 9.5a3.5 3.5 0 0 1 0 5" />
          <path
            className={on && speaking ? "voice-wave" : ""}
            style={{ animationDelay: "0.2s" }}
            d="M18 7a7 7 0 0 1 0 10"
          />
        </g>
      </svg>
      <span>{on ? "Mute" : `Hear ${name}`}</span>
      {/* The bubble's tail, pointing back at the character. */}
      <span
        aria-hidden
        className="absolute -bottom-1.5 left-3 h-3 w-3 rotate-45 bg-white shadow-[2px_2px_2px_rgba(0,0,0,0.06)]"
      />
    </button>
  );
}
