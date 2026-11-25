import type { FaceId } from "@/components/Face";

/** Pick one of our cartoon faces for a person, from their relationship and age. Cheap: no images, no AI. */
export function faceFor(relationship: string, age: string): FaceId {
  const r = relationship.toLowerCase();
  const years = parseInt(age, 10);
  const has = (...words: string[]) => words.some((w) => new RegExp(`\\b${w}`).test(r));
  if (has("baby") || (!Number.isNaN(years) && years < 2)) return "baby";
  if (has("nan\\b", "nanna", "nana", "gran\\b", "granny", "grandma", "grandmother")) return "grandma";
  if (has("grandad", "granddad", "grandpa", "grandfather", "gramps")) return "grandad";
  if (has("mum", "mom", "mam", "mother")) return "mum";
  if (has("dad", "father", "pops")) return "dad";
  const child = !Number.isNaN(years) && years < 16;
  const female = has("daughter", "niece", "granddaughter", "girl", "sister", "aunt", "auntie", "wife", "girlfriend");
  const male = has("son", "nephew", "grandson", "boy", "brother", "uncle", "husband", "boyfriend");
  if (female)
    return child || (has("daughter", "niece", "granddaughter", "girl") && Number.isNaN(years)) ? "girl" : "mum";
  if (male) return child || (has("son", "nephew", "grandson", "boy") && Number.isNaN(years)) ? "boy" : "dad";
  if (child) return "boy";
  return "friend";
}
