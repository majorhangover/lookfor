import Link from "next/link";

export const metadata = {
  title: "How it works · Lookfor",
  description: "How Lookfor finds gift ideas for everyone you buy for, and how we keep your list safe.",
};

const steps = [
  {
    icon: "🎅",
    title: "Tell us who you're buying for",
    text: "Chat with Santa (or whichever character fits the occasion) like you'd chat with a friend. Say who it's for, what they're into and roughly what you want to spend. You can type or talk.",
  },
  {
    icon: "🎁",
    title: "Get gift ideas in seconds",
    text: "Our characters suggest a handful of ideas, each with a reason it suits the person. The ideas appear below the chat, and every one links straight to Amazon so you can see the options and prices.",
  },
  {
    icon: "📝",
    title: "We remember your people",
    text: "Mention someone's age, birthday or hobbies and we'll offer to remember them. Next time, you don't have to start again, and birthdays coming up are shown on the page.",
  },
];

export default function About() {
  return (
    <main
      className="min-h-screen p-6"
      style={{ background: "linear-gradient(160deg, #0f3d2e 0%, #14532d 50%, #7f1d1d 100%)" }}
    >
      <article className="mx-auto max-w-2xl space-y-6 rounded-3xl bg-white/95 p-6 text-slate-800 shadow-xl md:p-8">
        <header className="space-y-2 text-center">
          <h1 className="text-3xl font-bold text-red-700">How Lookfor works</h1>
          <p className="text-lg">Gift ideas for everyone you buy for, whatever the occasion.</p>
        </header>

        <ol className="space-y-4">
          {steps.map((s, i) => (
            <li key={s.title} className="flex gap-4 rounded-2xl bg-slate-50 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-800 text-2xl">
                {s.icon}
              </div>
              <div>
                <h2 className="font-bold">
                  {i + 1}. {s.title}
                </h2>
                <p className="mt-1 text-slate-700">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>

        <section className="space-y-2">
          <h2 className="text-xl font-bold">A character for every occasion</h2>
          <p>
            Santa looks after Christmas, and other characters step in for birthdays, Valentine&apos;s Day, Mother&apos;s
            and Father&apos;s Day, weddings, new babies and more. Pick the occasion at the top of the page and the
            right character appears. Your list of people stays the same whichever character you&apos;re talking to.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold">Your free account</h2>
          <p>
            You don&apos;t need an account to get gift ideas. If you&apos;d like us to remember your people on every
            device, make a free account with just your email address. There&apos;s no password: we email you a
            sign-in link instead.
          </p>
          <p>
            🎄 <b>Kept safe under the tree.</b> Your list is stored securely in the UK, only you can see it, and we
            never sell it. You can delete your account and everything in it at any time.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold">Is it free?</h2>
          <p>
            Yes. Lookfor is free to use. When you buy something through one of our Amazon links, Amazon pays us a
            small commission, at no extra cost to you. As an Amazon Associate we earn from qualifying purchases.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold">Good to know</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Our characters are AI, so their suggestions are generated automatically.</li>
            <li>Always check age ratings, sizes and details on Amazon before you buy.</li>
            <li>Lookfor is for adults aged 18 and over.</li>
            <li>Voice is off to start with. Tap &quot;Hear my voice&quot; if you&apos;d like the character to talk.</li>
          </ul>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 text-sm">
          <Link className="rounded-full bg-red-700 px-5 py-2 font-semibold text-white hover:opacity-90" href="/">
            Start finding gifts
          </Link>
          <a className="underline" href="/privacy" target="_blank" rel="noopener">
            Privacy notice
          </a>
        </footer>
      </article>
    </main>
  );
}
