import translations from "../languages.json";

export type TranslationSet = (typeof translations)["en"];
export type LanguageKey = "en" | "es";

export interface SharedFile {
  id: string;
  type: "file";
  filename: string;
}
export interface SharedText {
  id: string;
  type: "text";
  content: string;
}
export type SharedItem = SharedFile | SharedText;
