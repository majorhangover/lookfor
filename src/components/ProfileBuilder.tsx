"use client";

import { useState } from "react";
import Face, { type FaceId } from "./Face";
import { faceFor } from "@/lib/faceFor";
import { displayAge, formatBirthday } from "@/lib/birthday";
import { applyProfileUpdate } from "@/lib/profile";
import type { Person, ProfileUpdate } from "@/lib/types";

/** Everyday faces to pick from, so the card can look a bit more like the real person. */
const PEOPLE_FACES: FaceId[] = ["mum", "dad", "girl", "boy", "grandma", "grandad", "baby", "friend", "lou"];

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/**
 * As the character learns about someone in the chat, their profile card builds
 * up here, with a cartoon face. Newly learned details glow. Below it, one tap
 * adds the person (or the new details) to My people.
 */
export default function ProfileBuilder({
  family,
  pending,
  accent,
  onSave,
  onDismiss,
}: {
  family: Person[];
  pending: ProfileUpdate[];
  accent: string;
  onSave: (name: string, face: FaceId) => void;
  onDismiss: (name: string) => void;
}) {
  const [picked, setPicked] = useState<Record<string, FaceId>>({});
  const [choosing, setChoosing] = useState<string | null>(null);
  const names = [...new Set(pending.map((u) => u.personNickname.trim()))].filter(Boolean);
  if (!names.length) return null;
  return (
    <>
      {names.map((name) => {
        const mine = pending.filter((u) => same(u.personNickname, name));
        const known = family.find((p) => same(p.nickname, name));
        const preview = mine.reduce(applyProfileUpdate, family).find((p) => same(p.nickname, name));
        if (!preview) return null;
        const fresh = new Set<string>(mine.map((u) => u.field));
        const age = displayAge(preview);
        const face = picked[name] ?? (preview.face as FaceId | undefined) ?? faceFor(preview.relationship, age);
        const rows: [string, string, string][] = [
          ["relationship", "Who", preview.relationship],
          ["age", "Age", age],
          ["birthday", "Birthday", preview.birthday ? formatBirthday(preview.birthday) : ""],
          ["interests", "Loves", preview.interests],
          ["dislikes", "Not keen on", preview.dislikes],
          ["sizes", "Sizes", preview.sizes],
          ["budget", "Budget", preview.budget ?? ""],
          ["notes", "Notes", preview.notes],
        ];
        return (
          <section
            key={name}
            aria-label={`${name}'s profile`}
            className="profile-builder rounded-2xl bg-white/95 p-4 text-sm text-slate-800 shadow-lg"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {known ? "New details" : "Getting to know…"}
            </p>
            <div className="mt-2 flex items-center gap-3">
              <button
                key={face}
                type="button"
                className="profile-face group relative h-16 w-16 shrink-0 rounded-full"
                aria-label={`Change ${preview.nickname}'s look`}
                aria-expanded={choosing === name}
                onClick={() => setChoosing(choosing === name ? null : name)}
              >
                <Face id={face} />
                <span
                  aria-hidden
                  className="absolute -bottom-1 -right-1 rounded-full bg-white px-1 text-xs shadow ring-1 ring-black/10 group-hover:scale-110"
                >
                  ✏️
                </span>
              </button>
              <div className="min-w-0">
                <h3 className="truncate text-lg font-bold">{preview.nickname}</h3>
                {preview.relationship && <p className="capitalize text-slate-600">{preview.relationship}</p>}
              </div>
            </div>
            {choosing === name && (
              <div className="mt-3 rounded-xl bg-slate-100 p-2">
                <p className="px-1 pb-1 text-xs text-slate-600">
                  Pick the look that&apos;s most like {preview.nickname}:
                </p>
                <div className="grid grid-cols-5 gap-1">
                  {PEOPLE_FACES.map((id) => (
                    <button
                      key={id}
                      type="button"
                      aria-label={id}
                      aria-pressed={id === face}
                      className={`h-11 w-11 rounded-full transition hover:scale-110 ${id === face ? "ring-2 ring-offset-1" : ""}`}
                      style={id === face ? { ["--tw-ring-color" as string]: accent } : undefined}
                      onClick={() => {
                        setPicked({ ...picked, [name]: id });
                        setChoosing(null);
                      }}
                    >
                      <Face id={id} />
                    </button>
                  ))}
                </div>
              </div>
            )}
            <dl className="mt-3 space-y-1">
              {rows
                .filter(([key, , value]) => value && key !== "relationship")
                .map(([key, label, value]) => (
                  <div
                    key={`${key}:${value}`}
                    className={`profile-row flex gap-2 rounded-lg px-2 py-1 ${fresh.has(key) ? "profile-row-new" : ""}`}
                  >
                    <dt className="w-24 shrink-0 text-slate-500">{label}</dt>
                    <dd className="min-w-0">{value}</dd>
                  </div>
                ))}
            </dl>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                className="rounded-full px-4 py-2 font-semibold text-white shadow hover:opacity-90"
                style={{ background: accent }}
                onClick={() => onSave(name, face)}
              >
                {known ? `＋ Save to ${known.nickname}’s profile` : `＋ Add ${preview.nickname} to My people`}
              </button>
              <button className="text-slate-500 underline" onClick={() => onDismiss(name)}>
                Not now
              </button>
            </div>
          </section>
        );
      })}
    </>
  );
}
