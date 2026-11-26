import Link from "next/link";

/** The × in the corner of the info pages: back to the chat, which is kept for this tab. */
export default function CloseButton() {
  return (
    <Link
      href="/"
      aria-label="Close and go back to Lookfor"
      className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-2xl leading-none text-slate-600 hover:bg-slate-200"
    >
      ×
    </Link>
  );
}
