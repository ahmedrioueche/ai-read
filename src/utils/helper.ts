const languageMap: Record<string, string> = {
  english: "eng",
  french: "fra",
  german: "deu",
  spanish: "spa",
  italian: "ita",
  arabic: "arb",
};

export const formatLanguage = (language: string | null): string => {
  if (!language) return "en-US"; // Default to English for null or undefined

  const lowerCasedLanguage = language.toLowerCase(); // Handle case-insensitivity

  // If a full language name is provided, map it to the language code
  const languageCode = languageMap[lowerCasedLanguage] || lowerCasedLanguage;

  // Match the language code to a locale
  switch (languageCode) {
    case "eng":
      return "en-US"; // English
    case "fra":
      return "fr-FR"; // French
    case "deu":
      return "de-DE"; // German
    case "spa":
      return "es-ES"; // Spanish
    case "ita":
      return "it-IT"; // Italian
    case "arb":
      return "ar-SA"; // Arabic
    default:
      return "en-US"; // Default to English if language is not recognized
  }
};

export function getLanguages(dict: Record<string, any>): string[] {
  return Object.keys(dict);
}
