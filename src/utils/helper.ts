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

export const getLanguageName = (isoCode: string): string => {
  const languageMap: { [key: string]: string } = {
    eng: "English",
    fra: "French",
    arb: "Arabic",
    spa: "Spanish",
    deu: "German",
    ita: "Italian",
    rus: "Russian",
    zho: "Chinese",
    jpn: "Japanese",
    hin: "Hindi",
    por: "Portuguese",
    nld: "Dutch",
    swe: "Swedish",
    tur: "Turkish",
    kor: "Korean",
    pol: "Polish",
    ukr: "Ukrainian",
    vie: "Vietnamese",
    tha: "Thai",
    ind: "Indonesian",
    hun: "Hungarian",
    ces: "Czech",
    ron: "Romanian",
    dan: "Danish",
    nor: "Norwegian",
    fin: "Finnish",
    slk: "Slovak",
    ell: "Greek",
    heb: "Hebrew",
    tam: "Tamil",
    ben: "Bengali",
    urd: "Urdu",
  };

  return languageMap[isoCode] || "Unknown Language";
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

export const splitTextIntoChunks = (
  text: string,
  maxLength: number
): string[] => {
  // Input validation
  if (!text || maxLength <= 0) {
    return [];
  }

  const chunks: string[] = [];
  let currentIndex = 0;

  while (currentIndex < text.length) {
    // Determine the potential end of the current chunk
    let endIndex = Math.min(currentIndex + maxLength, text.length);

    // If we're not at the end of the text, look for a proper sentence ending
    if (endIndex < text.length) {
      // Look for the last sentence ending within the chunk
      const lastPeriodIndex = text.lastIndexOf(".", endIndex);
      const lastExclamationIndex = text.lastIndexOf("!", endIndex);
      const lastQuestionIndex = text.lastIndexOf("?", endIndex);

      // Find the latest sentence ending
      const sentenceEndings = [
        lastPeriodIndex,
        lastExclamationIndex,
        lastQuestionIndex,
      ].filter((index) => index > currentIndex && index <= endIndex);

      if (sentenceEndings.length > 0) {
        endIndex = Math.max(...sentenceEndings) + 1;
      } else {
        // If no sentence ending is found, look for the last space
        const lastSpaceIndex = text.lastIndexOf(" ", endIndex);
        if (lastSpaceIndex > currentIndex) {
          endIndex = lastSpaceIndex;
        }
      }
    }

    // Extract and clean the chunk
    let chunk = text.slice(currentIndex, endIndex).trim();

    // Only add non-empty chunks
    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    // Move to the next chunk
    currentIndex = endIndex;
  }

  return chunks;
};
