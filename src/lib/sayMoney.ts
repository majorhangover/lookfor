/**
 * Spell out prices before they're spoken, so the voice never reads "£40" as
 * "40 dollars". Handles ranges like "£15-25" and "£15 to £25", and pence/cents.
 */
const UNITS: Record<string, [string, string]> = {
  "£": ["pound", "pounds"],
  $: ["dollar", "dollars"],
  "€": ["euro", "euros"],
};

const num = String.raw`\d[\d,]*(?:\.\d+)?`;
const RANGE = new RegExp(String.raw`([£$€])\s?(${num})\s?(?:-|–|—|to)\s?(?:[£$€])?\s?(${num})`, "g");
const SINGLE = new RegExp(String.raw`([£$€])\s?(${num})`, "g");

const amount = (n: string) => n.replace(/,/g, "").replace(/\.00$/, "");

export function sayMoney(text: string): string {
  return text
    .replace(RANGE, (_, sym: string, a: string, b: string) => `${amount(a)} to ${amount(b)} ${UNITS[sym][1]}`)
    .replace(SINGLE, (_, sym: string, a: string) => {
      const n = amount(a);
      return `${n} ${UNITS[sym][n === "1" ? 0 : 1]}`;
    });
}
