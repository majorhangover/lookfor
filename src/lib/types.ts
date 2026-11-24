export type Region = "UK" | "US";

export interface Person {
  id: string;
  nickname: string;
  relationship: string;
  age: string;
  birthday: string; // "MM-DD", or "MM" if only the month is known, or empty
  interests: string;
  dislikes: string;
  sizes: string;
  notes: string;
}

export interface GiftIdea {
  forPerson: string;
  title: string;
  searchQuery: string;
  priceBand: string;
  reason: string;
  url?: string;
}

export interface ProfileUpdate {
  personNickname: string;
  field: "age" | "birthday" | "interests" | "dislikes" | "sizes" | "notes" | "relationship";
  value: string;
  isNewPerson: boolean;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface HostResponse {
  reply: string;
  gifts: GiftIdea[];
  profileUpdates: ProfileUpdate[];
}
