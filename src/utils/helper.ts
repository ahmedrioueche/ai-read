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

export const calculateRemainingTime = (endDate: Date | string): string => {
  const now = new Date().getTime();
  const end = new Date(endDate).getTime();
  const difference = end - now;

  if (difference <= 0) {
    return "0 minutes"; // Trial has ended
  }

  const minutes = Math.floor(difference / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} day${days > 1 ? "s" : ""}`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? "s" : ""}`;
  } else {
    return `${minutes} minute${minutes > 1 ? "s" : ""}`;
  }
};

export const languageMap: { [key: string]: string } = {
  english: "en",
  french: "fr",
  spanish: "es",
  german: "de",
  italian: "it",
  russian: "ru",
  portuguese: "pt",
  chinese: "zh",
  japanese: "ja",
  korean: "ko",
  hindi: "hi",
  turkish: "tr",
  polish: "pl",
  arabic: "ar",
  dutch: "nl",
  swedish: "sv",
  danish: "da",
  norwegian: "no",
  finnish: "fi",
  greek: "el",
  czech: "cs",
  hungarian: "hu",
  romanian: "ro",
  ukrainian: "uk",
  vietnamese: "vi",
  thai: "th",
  indonesian: "id",
  malay: "ms",
  filipino: "tl",
  swahili: "sw",
  afrikaans: "af",
  albanian: "sq",
  amharic: "am",
  armenian: "hy",
  azerbaijani: "az",
  basque: "eu",
  belarusian: "be",
  bengali: "bn",
  bosnian: "bs",
  bulgarian: "bg",
  burmese: "my",
  catalan: "ca",
  cebuano: "ceb",
  corsican: "co",
  croatian: "hr",
  esperanto: "eo",
  estonian: "et",
  fijian: "fj",
  frisian: "fy",
  galician: "gl",
  georgian: "ka",
  gujarati: "gu",
  haitian: "ht",
  hausa: "ha",
  hawaiian: "haw",
  hebrew: "he",
  hmong: "hmn",
  icelandic: "is",
  igbo: "ig",
  irish: "ga",
  javanese: "jv",
  kannada: "kn",
  kazakh: "kk",
  khmer: "km",
  kurdish: "ku",
  kyrgyz: "ky",
  lao: "lo",
  latin: "la",
  latvian: "lv",
  lithuanian: "lt",
  luxembourgish: "lb",
  macedonian: "mk",
  malagasy: "mg",
  malayalam: "ml",
  maltese: "mt",
  maori: "mi",
  marathi: "mr",
  mongolian: "mn",
  nepali: "ne",
  pashto: "ps",
  persian: "fa",
  punjabi: "pa",
  samoan: "sm",
  scots: "gd",
  serbian: "sr",
  sesotho: "st",
  shona: "sn",
  sindhi: "sd",
  sinhala: "si",
  slovak: "sk",
  slovenian: "sl",
  somali: "so",
  sundanese: "su",
  tajik: "tg",
  tamil: "ta",
  telugu: "te",
  urdu: "ur",
  uzbek: "uz",
  welsh: "cy",
  xhosa: "xh",
  yiddish: "yi",
  yoruba: "yo",
  zulu: "zu",
};

export const generateEmailContent = (content: string) => {
  return {
    text: content,
    html: `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Stix+Two+Text:wght@400;700&display=swap');
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              color: #333;
              padding: 20px;
              margin: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #fff;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              font-family: 'Stix Two Text', serif;
            }
            .header {
              display: flex;
              align-items: center;
              margin-bottom: 20px;
            }
            .header .logo {
              font-size: 2rem;
              font-weight: bold;
              color: #007bff;
              margin-right: 10px;
              cursor: pointer;
              transition: color 0.3s;
            }
            .header .logo:hover {
              color: #0056b3;
            }
            .content {
              font-size: 1rem;
              color: #333;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">AIRead</div>
            </div>
            <div class="content">
              ${content}
            </div>
          </div>
        </body>
      </html>`,
  };
};
