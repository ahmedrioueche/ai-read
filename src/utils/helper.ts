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

    // Look for the last comma or full stop within the chunk
    const lastCommaIndex = text.lastIndexOf(",", endIndex);
    const lastFullStopIndex = text.lastIndexOf(".", endIndex);

    // Prioritize splitting at full stops, then commas
    if (lastFullStopIndex > currentIndex) {
      endIndex = lastFullStopIndex + 1; // Include the full stop
    } else if (lastCommaIndex > currentIndex) {
      endIndex = lastCommaIndex + 1; // Include the comma
    }

    // If no comma or full stop is found, split at the maxLength
    if (endIndex <= currentIndex) {
      endIndex = Math.min(currentIndex + maxLength, text.length);
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
