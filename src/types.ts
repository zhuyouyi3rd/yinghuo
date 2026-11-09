export type Page = "home" | "vent" | "tree" | "me";

export type ComfortMode = "listen" | "soft" | "stay";
export type ComfortStyle = "listen" | "affirm" | "company" | "quiet";
export type Tone = "gentle" | "light" | "steady" | "direct";

export type EmotionFamilyId =
  | "joy"
  | "calm"
  | "anticipation"
  | "sadness"
  | "anxiety"
  | "anger"
  | "fatigue"
  | "lonely"
  | "complex";

export interface Profile {
  name: string;
  stage: string;
  interests: string[];
  recent: string;
  comfort: ComfortStyle;
  tone: Tone;
  avoid: string;
  boundaries: string;
  completed: boolean;
}

export interface VentEntry {
  id: string;
  text: string;
  mode: ComfortMode;
  theme: string;
  response: string;
  emotion: EmotionFamilyId;
  createdAt: number;
  safety: "none" | "medium" | "high";
}

export interface Watering {
  id: string;
  date: string;
  family: EmotionFamilyId;
  word: string;
  intensity: number;
  note: string;
  quoteTitle: string;
  quoteBody: string;
}

export interface TreeState {
  total: number;
  lastDate: string;
  seed: number;
  history: Watering[];
}

export interface Store {
  version: 1;
  seenWelcome: boolean;
  profile: Profile;
  vents: VentEntry[];
  tree: TreeState;
}

export interface ComfortResult {
  text: string;
  safety: "none" | "medium" | "high";
  theme: string;
  emotion: EmotionFamilyId;
}

export interface EmotionFamily {
  id: EmotionFamilyId;
  name: string;
  short: string;
  color: string;
  sky: string;
  glow: string;
  leaf: string;
  words: string[];
  feedback: string;
  posterTitle: string;
  posterBody: string;
  positive: boolean;
}
