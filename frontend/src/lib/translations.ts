import translations from "../languages.json";
import { LanguageKey, TranslationSet } from "./types";

export const t = (lang: LanguageKey, key: Exclude<keyof TranslationSet, "status" | "button">) => {
  return translations[lang][key];
};

export const tButton = (lang: LanguageKey, key: keyof TranslationSet["button"]) => {
  return translations[lang].button[key];
};

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
