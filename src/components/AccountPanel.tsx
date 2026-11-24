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
      <section className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-800">
        <h2 className="mb-1 font-bold">Your account</h2>
        <p>
          Signed in as <b>{account.email}</b>. {account.saveError
            ? "Sorry, we couldn't save your list just now. It's still on this device."
            : account.synced
              ? "Your list is saved."
              : "Saving your list…"}
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

  if (account.linkSentTo) {
    return (
      <section id="account-panel" className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-800">
        <h2 className="mb-1 font-bold">Check your email</h2>
        <p>
          We&apos;ve sent a sign-in link to <b>{account.linkSentTo}</b>. Open it in this browser to save your list.
          It can take a minute or two, so check your spam folder too.
        </p>
        <button
          className="mt-2 text-xs underline"
          onClick={() => {
            account.clearLinkSent();
            setStatus("idle");
          }}
        >
          Use a different email
        </button>
      </section>
    );
  }

  return (
    <section
      id="account-panel"
      className="rounded-2xl border-2 border-amber-300 bg-white p-4 text-sm text-slate-800"
    >
      <h2 className="text-base font-bold">Get your free Lookfor account</h2>
      <p className="text-slate-600">Let us do the remembering, so gifting is easy every time.</p>
      <ul className="mt-2 space-y-1">
        <li>🎁 Everyone&apos;s ages, likes and sizes, saved for next time</li>
        <li>📅 A nudge before birthdays and big days, so you&apos;re never last-minute</li>
        <li>✨ Ideas that get better the more you use it</li>
        <li>📱 Your list on your phone and computer</li>
      </ul>
      <p className="mt-2 text-xs text-slate-500">
        Free, no password, just your email. 🎄 Kept safe under the tree: stored securely in the UK, only you can see
        it, and we never sell it.
      </p>
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
          id="account-email"
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
          {status === "sending" ? "Sending…" : "Create my free account"}
        </button>
        {error && <p className="text-red-700">{error}</p>}
      </form>
    </section>
  );
}
