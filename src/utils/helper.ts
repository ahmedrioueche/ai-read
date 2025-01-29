export const formatLanguageToLocalCode = (
  language: string | null,
  inputFormat: "fullName" | "iso6391" | "iso6393" = "fullName"
): string => {
  if (!language) return "en-US"; // Default to English for null or undefined

  const lowerCasedLanguage = language.toLowerCase(); // Handle case-insensitivity

  // Map the input to a language code based on the specified format
  let languageCode: string;

  switch (inputFormat) {
    case "fullName":
      // Use the languageMap to convert full names to ISO 639-1 codes
      languageCode = languageMap[lowerCasedLanguage] || lowerCasedLanguage;
      break;
    case "iso6391":
      // ISO 639-1 codes are already in the correct format
      languageCode = lowerCasedLanguage;
      break;
    case "iso6393":
      // Convert ISO 639-3 codes to ISO 639-1 codes using a mapping
      const iso6391Code = iso6393ToIso6391Map[lowerCasedLanguage];
      languageCode = iso6391Code || lowerCasedLanguage;
      break;
    default:
      languageCode = lowerCasedLanguage; // Fallback to the input as-is
  }

  // Match the language code to a locale
  switch (languageCode) {
    case "en":
      return "en-US"; // English (United States)
    case "fr":
      return "fr-FR"; // French (France)
    case "de":
      return "de-DE"; // German (Germany)
    case "es":
      return "es-ES"; // Spanish (Spain)
    case "it":
      return "it-IT"; // Italian (Italy)
    case "ar":
      return "ar-SA"; // Arabic (Saudi Arabia)
    case "ru":
      return "ru-RU"; // Russian (Russia)
    case "zh":
      return "zh-CN"; // Chinese (Simplified, China)
    case "ja":
      return "ja-JP"; // Japanese (Japan)
    case "ko":
      return "ko-KR"; // Korean (South Korea)
    case "hi":
      return "hi-IN"; // Hindi (India)
    case "pt":
      return "pt-BR"; // Portuguese (Brazil)
    case "nl":
      return "nl-NL"; // Dutch (Netherlands)
    case "sv":
      return "sv-SE"; // Swedish (Sweden)
    case "tr":
      return "tr-TR"; // Turkish (Turkey)
    case "pl":
      return "pl-PL"; // Polish (Poland)
    case "uk":
      return "uk-UA"; // Ukrainian (Ukraine)
    case "vi":
      return "vi-VN"; // Vietnamese (Vietnam)
    case "th":
      return "th-TH"; // Thai (Thailand)
    case "id":
      return "id-ID"; // Indonesian (Indonesia)
    case "hu":
      return "hu-HU"; // Hungarian (Hungary)
    case "cs":
      return "cs-CZ"; // Czech (Czech Republic)
    case "ro":
      return "ro-RO"; // Romanian (Romania)
    case "da":
      return "da-DK"; // Danish (Denmark)
    case "no":
      return "nb-NO"; // Norwegian Bokmål (Norway)
    case "fi":
      return "fi-FI"; // Finnish (Finland)
    case "el":
      return "el-GR"; // Greek (Greece)
    case "he":
      return "he-IL"; // Hebrew (Israel)
    case "ta":
      return "ta-IN"; // Tamil (India)
    case "bn":
      return "bn-BD"; // Bengali (Bangladesh)
    case "ur":
      return "ur-PK"; // Urdu (Pakistan)
    default:
      return "en-US"; // Default to English if language is not recognized
  }
};

// Mapping from ISO 639-3 codes to ISO 639-1 codes
const iso6393ToIso6391Map: { [key: string]: string } = {
  eng: "en",
  fra: "fr",
  deu: "de",
  spa: "es",
  ita: "it",
  arb: "ar",
  rus: "ru",
  zho: "zh",
  jpn: "ja",
  hin: "hi",
  por: "pt",
  nld: "nl",
  swe: "sv",
  tur: "tr",
  kor: "ko",
  pol: "pl",
  ukr: "uk",
  vie: "vi",
  tha: "th",
  ind: "id",
  hun: "hu",
  ces: "cs",
  ron: "ro",
  dan: "da",
  nor: "no",
  fin: "fi",
  slk: "sk",
  ell: "el",
  heb: "he",
  tam: "ta",
  ben: "bn",
  urd: "ur",
};

// Existing languageMap (full names to ISO 639-1 codes)
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

/**
 * Converts an ISO 639-3 language code (e.g., "eng") to the full language name (e.g., "English").
 * @param languageCode - The ISO 639-3 language code (e.g., "eng").
 * @returns The full language name (e.g., "English").
 */
export const formatLanguageToName = (languageCode: string | null): string => {
  if (!languageCode) return "English"; // Default to English for null or undefined

  // Convert the ISO 639-3 code to ISO 639-1 code using the existing map
  const iso6391Code = iso6393ToIso6391Map[languageCode.toLowerCase()];

  if (!iso6391Code) return "English"; // Default to English if the code is not recognized

  // Find the full language name from the languageMap
  for (const [fullName, code] of Object.entries(languageMap)) {
    if (code === iso6391Code) {
      return fullName.charAt(0).toUpperCase() + fullName.slice(1); // Capitalize the first letter
    }
  }

  return "English"; // Default to English if no match is found
};

export function getLanguages(dict: Record<string, any>): string[] {
  return Object.keys(dict);
}

export function shortenLocaleName(localeName: string): string {
  return localeName.replace(/\(([^)]+)\)/, (_, country) => {
    const countryParts = country.split(" ");
    if (countryParts.length > 1) {
      // If the country name has more than one word, return initials
      const initials = countryParts
        .map((word: string[]) => word[0].toUpperCase())
        .join("");
      return `(${initials})`;
    }
    // Otherwise, return the full country name
    return `(${country})`;
  });
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
  if (!text || maxLength <= 0) return [];

  const chunks: string[] = [];
  let currentIndex = 0;
  // Improved regex to detect URLs and numbers
  const urlNumberRegex =
    /((?:https?:\/\/|www\.|[\w-]+\.)[\w-]+\.[a-z]{2,}(?:\.[a-z]{2,})*|\$\d+\.\d+|\d+\.\d+)/i;

  while (currentIndex < text.length) {
    let endIndex = Math.min(currentIndex + maxLength, text.length);
    let searchEnd = endIndex;

    // Look for natural sentence boundaries
    let lastGoodBreak = -1;

    // Search backward for proper sentence endings
    for (let i = endIndex; i > currentIndex; i--) {
      const prevChar = text[i - 1];
      const nextChar = text[i];

      // Check for sentence-ending punctuation followed by space or end
      if (
        /[.!?]/.test(prevChar) &&
        (/\s|$/.test(nextChar) || i === text.length)
      ) {
        // Check if punctuation is part of URL/number
        const precedingText = text.slice(currentIndex, i);
        const isSpecial = urlNumberRegex.test(precedingText);

        if (!isSpecial) {
          lastGoodBreak = i;
          break;
        }
      }
    }

    // If we found a good break point, use it
    if (lastGoodBreak > currentIndex) {
      endIndex = lastGoodBreak;
    } else {
      // Find next whitespace or maintain URL/numbers
      while (endIndex > currentIndex) {
        const precedingText = text.slice(currentIndex, endIndex);
        const isSpecial = urlNumberRegex.test(precedingText);

        if (isSpecial || /\s/.test(text[endIndex - 1])) {
          break;
        }
        endIndex--;
      }

      // If no break found, extend to preserve special patterns
      if (endIndex === currentIndex) {
        const remainingText = text.slice(currentIndex);
        const specialMatch = remainingText.match(urlNumberRegex);

        if (specialMatch) {
          endIndex = currentIndex + specialMatch[0].length;
        } else {
          endIndex = Math.min(currentIndex + maxLength, text.length);
        }
      }
    }

    const chunk = text.slice(currentIndex, endIndex).trim();
    if (chunk) chunks.push(chunk);
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
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            body {
              font-family: 'Inter', sans-serif;
              background-color: #f9fafb;
              color: #111827;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              background-color: #1e40af;
              padding: 24px;
              text-align: center;
            }
            .header .logo {
              font-size: 1.75rem;
              font-weight: 700;
              color: #ffffff;
              text-decoration: none;
              transition: opacity 0.3s ease;
            }
            .header .logo:hover {
              opacity: 0.9;
            }
            .content {
              padding: 32px;
              font-size: 1rem;
              line-height: 1.6;
              color: #374151;
            }
            .content p {
              margin: 0 0 16px;
            }
            .footer {
              padding: 24px;
              text-align: center;
              font-size: 0.875rem;
              color: #6b7280;
              background-color: #f9fafb;
              border-top: 1px solid #e5e7eb;
            }
            .footer a {
              color: #1e40af;
              text-decoration: none;
              transition: color 0.3s ease;
            }
            .footer a:hover {
              color: #1e3a8a;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <a href="#" class="logo">AIRead</a>
            </div>
            <div class="content">
              ${content}
            </div>
            <div class="footer">
              <p>If you have any questions, feel free to <a href="mailto:support@airead.com">contact us</a>.</p>
              <p>&copy; ${new Date().getFullYear()} AIRead. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>`,
  };
};

// Define weights for additional punctuation marks
const punctuationWeights = {
  ",": 70, // Weight for commas
  "!": 120, // Weight for exclamation marks
  "?": 120, // Weight for question marks
  ".": 170, // Weight for full stops
  ";": 95, // Weight for semicolons
  ":": 95, // Weight for colons
  "-": 50, // Weight for hyphens
  "(": 40, // Weight for opening parentheses
  ")": 40, // Weight for closing parentheses
  '"': 60, // Weight for double quotes
  "'": 60, // Weight for single quotes
  "…": 220, // Weight for ellipsis
  "–": 70, // Weight for en dash
  "—": 120, // Weight for em dash
};

export const calculateDelay = (text: string, readingSpeed: number) => {
  const textLength = text.length;
  const baseDelay = Math.max(100, textLength * 55 * readingSpeed);

  // Calculate the additional delay based on punctuation marks
  let punctuationDelay = 0;
  for (const [punctuation, weight] of Object.entries(punctuationWeights)) {
    // Use a regular expression to count occurrences of the punctuation mark
    const regex = new RegExp(`\\${punctuation}`, "g");
    const count = (text.match(regex) || []).length;
    punctuationDelay += count * weight;
  }

  // Calculate the total delay
  const totalDelay = baseDelay + punctuationDelay;
  return totalDelay;
};

export const formatCurrency = (value: string) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(parseFloat(value));
};
