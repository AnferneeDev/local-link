import translations from "../languages.json";
import { LanguageKey, TranslationSet } from "./types";

/**
 * Gets a specific translated string, excluding the 'status' object.
 */
export const t = (lang: LanguageKey, key: Exclude<keyof TranslationSet, "status">) => {
  return translations[lang][key];
};

/**
 * Gets the correct status message based on the current state.
 */
export const getStatusMessage = (lang: LanguageKey, statusType: string, statusFilename: string) => {
  const currentStatus = translations[lang].status;
  switch (statusType) {
    case "initial":
      return currentStatus.initial;
    case "selected":
      return currentStatus.selected.replace("{{filename}}", statusFilename);
    case "uploading":
      return currentStatus.uploading;
    case "success":
      return currentStatus.success;
    case "fail":
      return currentStatus.fail;
    default:
      return currentStatus.initial;
  }
};
