"use client";

import { useState } from "react";
import type { useAccount } from "./useAccount";

type Account = ReturnType<typeof useAccount>;

export default function AccountPanel({ account }: { account: Account }) {
  const [email, setEmail] = useState("");
  const [wantsEmails, setWantsEmails] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!account.enabled) return null;

  if (account.email) {
    return (
      <section className="rounded-2xl bg-white/90 p-4 text-sm text-slate-800 shadow-lg">
        <h2 className="mb-1 font-bold">Your account</h2>
        <p>
          Signed in as <b>{account.email}</b>. {account.synced ? "Your list is saved." : "Saving your list…"}
        </p>
        <label className="mt-2 flex items-start gap-2">
          <input
            type="checkbox"
            className="mt-1"
            checked={account.optIn}
            onChange={(e) => account.updateOptIn(e.target.checked)}
          />
          <span>Email me birthday reminders and gift ideas. You can turn this off at any time.</span>
        </label>
        <div className="mt-3 flex gap-3 text-xs">
          <button className="underline" onClick={account.signOut}>
            Sign out
          </button>
          {!confirmDelete ? (
            <button className="text-red-700 underline" onClick={() => setConfirmDelete(true)}>
              Delete my account
            </button>
          ) : (
            <span>
              Delete account and saved list?{" "}
              <button className="font-semibold text-red-700 underline" onClick={account.deleteAccount}>
                Yes, delete
              </button>{" "}
              <button className="underline" onClick={() => setConfirmDelete(false)}>
                Cancel
              </button>
            </span>
          )}
        </div>
      </section>
    );
  }

  if (status === "sent") {
    return (
      <section className="rounded-2xl bg-white/90 p-4 text-sm text-slate-800 shadow-lg">
        <h2 className="mb-1 font-bold">Check your email</h2>
        <p>
          We&apos;ve sent a sign-in link to <b>{email}</b>. Open it on this device to save your list.
        </p>
        <button className="mt-2 text-xs underline" onClick={() => setStatus("idle")}>
          Use a different email
        </button>
      </section>
    );
  }

  return (
    <section className="rounded-2xl bg-white/90 p-4 text-sm text-slate-800 shadow-lg">
      <h2 className="mb-1 font-bold">Save your list</h2>
      <p className="text-slate-600">Sign in with your email to keep your people and use them on any device.</p>
      <form
        className="mt-2 space-y-2"
        onSubmit={async (e) => {
          e.preventDefault();
          setStatus("sending");
          setError(null);
          const err = await account.sendLink(email.trim(), wantsEmails);
          if (err) {
            setError(err);
            setStatus("idle");
          } else {
            setStatus("sent");
          }
        }}
      >
        <input
          type="email"
          required
          placeholder="you@example.com"
          className="w-full rounded border border-slate-300 px-2 py-1"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label className="flex items-start gap-2">
          <input
            type="checkbox"
            className="mt-1"
            checked={wantsEmails}
            onChange={(e) => setWantsEmails(e.target.checked)}
          />
          <span>Also email me birthday reminders and gift ideas (optional).</span>
        </label>
        <button
          className="w-full rounded-full bg-slate-800 px-3 py-2 font-semibold text-white disabled:opacity-50"
          disabled={status === "sending" || !email.trim()}
        >
          {status === "sending" ? "Sending…" : "Email me a sign-in link"}
        </button>
        {error && <p className="text-red-700">{error}</p>}
      </form>
    </section>
  );
}
