export const formatLanguage = (languageCode: string | null) => {
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
