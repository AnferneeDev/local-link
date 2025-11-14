import translations from "../languages.json";

// Types for Translations
export type TranslationSet = (typeof translations)["en"];
export type LanguageKey = "en" | "es";

// Types for Shared Items
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
