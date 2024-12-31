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

export const preprocessText = (text: string) => {
  // Step 1: Remove inline annotations like "[22]" or similar
  let cleanedText = text.replace(/\[\d+\]/g, "");

  // Step 2: Add commas after titles that are followed by blank space
  cleanedText = cleanedText.replace(
    /^([A-Z][^\n]*?)([A-Za-z0-9])(\s*?\n\s+)/gm,
    "$1$2,\n"
  );

  // Step 3: Replace multiple spaces within a sentence with a single space
  cleanedText = cleanedText.replace(/([^\n\S]+|\s{2,})/g, " ");

  // Step 4: Normalize line breaks for natural reading
  cleanedText = cleanedText.replace(/(\s*\n\s*){2,}/g, "\n\n");

  // Step 5: Trim extra spaces at the beginning and end
  cleanedText = cleanedText.trim();

  return cleanedText;
};
