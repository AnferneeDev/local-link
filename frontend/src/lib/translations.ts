import translations from "../languages.json";
import { LanguageKey, TranslationSet } from "./types";

/**
 * Gets a specific translated string, excluding the 'status' object.
 */
export const t = (lang: LanguageKey, key: Exclude<keyof TranslationSet, "status" | "button">) => {
  return translations[lang][key];
};

/**
 * Gets a specific translated button string.
 */
export const tButton = (lang: LanguageKey, key: keyof TranslationSet["button"]) => {
  return translations[lang].button[key];
};

/**
 * Gets the correct status message based on the current state.
 */
export const getStatusMessage = (lang: LanguageKey, statusType: string, statusFilename: string) => {
  const currentStatus = translations[lang].status;
  switch (statusType) {
    case "initial":
      return "";
    case "selected":
      return currentStatus.selected.replace("{{filename}}", statusFilename);

    default:
      return "";
  }
};
