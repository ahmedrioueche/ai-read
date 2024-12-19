import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { URL } from "url";

// Load environment variables from .env file
dotenv.config();

// Get API key from environment variables
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_KEY;

if (!API_KEY) {
  console.error("API key is missing!");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);

// Resolve the dictionary path and convert it to a file URL
const dictPath = path.resolve("./src/utils/dict.js");
const dictURL = new URL(`file://${dictPath}`); // Convert to file:// URL

let dict;
try {
  dict = (await import(dictURL)).dict; // Dynamically import the dict.js module
} catch (error) {
  console.error("Error loading dictionary:", error.message);
  process.exit(1);
}

// Define model
const model = genAI?.getGenerativeModel({ model: "gemini-1.5-flash" });

const languages = {
  en: "English",
  zh: "Mandarin Chinese",
  hi: "Hindi",
  es: "Spanish",
  ar: "Arabic",
  bn: "Bengali",
  pt: "Portuguese",
  ru: "Russian",
  ja: "Japanese",
  pa: "Punjabi",
  de: "German",
  jv: "Javanese",
  wu: "Wu Chinese",
  ms: "Malay",
  te: "Telugu",
  vi: "Vietnamese",
  ko: "Korean",
  fr: "French",
  mr: "Marathi",
  ta: "Tamil",
  ur: "Urdu",
  tr: "Turkish",
  it: "Italian",
  th: "Thai",
  gu: "Gujarati",
  fa: "Persian",
  pl: "Polish",
  uk: "Ukrainian",
  ml: "Malayalam",
  kn: "Kannada",
  my: "Burmese",
  fil: "Filipino",
  ro: "Romanian",
  nl: "Dutch",
  hu: "Hungarian",
  el: "Greek",
  cs: "Czech",
  sw: "Swahili",
  si: "Sinhala",
  bg: "Bulgarian",
  hr: "Croatian",
  az: "Azerbaijani",
  he: "Hebrew",
  sk: "Slovak",
  da: "Danish",
  fi: "Finnish",
  id: "Indonesian",
  no: "Norwegian",
  sv: "Swedish",
  am: "Amharic",
};

// Function to list available languages
const listLanguages = () => {
  console.log("Available languages for translation:");
  for (const [code, name] of Object.entries(languages)) {
    console.log(`${code}: ${name}`);
  }
};

// Main translation prompt
const ADD_PROMPT = `Please translate the following object values into the target language, 
while keeping the structure the same. You will receive a dict object with key "en", 
give back the same structure with the target language. For example:
If you receive:
{
  en: {
    Auth: {
      login: "Login",
      logout: "Logout"
    }
  }
}
and the target language "fr" (French),
you should return:
{
  en: {
    Auth: {
      login: "Se connecter",
      logout: "Se déconnecter"
    }
  },
  fr: {
    Auth: {
      login: "Se connecter",
      logout: "Se déconnecter"
    }
  }
}
Do not give an introduction or conclusion. If you cannot do it for some reason, just return "error".`;

// Synchronization prompt
const SYNC_PROMPT = `Please synchronize the translations from the reference language (en) with the target language. 
You will receive a dict object with key "en" and possibly other languages. 
Your task is to synchronize the existing translations in the target language with the keys from the reference language ("en").
all languages should have the same keys as the english (en) translation, with the values corresponding to that specific language.
For example:
If you receive:
{
  en: {
    Auth: {
      login: "Login",
      logout: "Logout"
    }
  },
  fr: {
    Auth: {
      logout: "Se déconnecter"
    }
  }
}
and you are synchronizing with "en", you should return:
{
  en: {
    Auth: {
      login: "Login",
      logout: "Logout"
    }
  },
  fr: {
    Auth: {
      login: "Se connecter",
      logout: "Se déconnecter"
    }
  }
}
Do not give an introduction or conclusion. If you cannot do it for some reason, just return "error".`;

// Function to clean the response and make it valid JSON
const cleanResponse = (response) => {
  let cleanedResponse = response.replace(/```json|```/g, "").trim();

  try {
    JSON.parse(cleanedResponse); // Check if it's valid JSON
  } catch (e) {
    console.error("Error cleaning response:", e);
    return null; // Return null if parsing fails
  }

  return cleanedResponse;
};

// Function to get an answer from the generative model
const geminiGetAnswer = async (prompt) => {
  const result = await model?.generateContent(prompt);
  return result?.response.text();
};

// Function to translate text
async function translateText(text, language) {
  try {
    console.log(`Translating to ${languages[language]}...`);
    const prompt = `${ADD_PROMPT} Here is the text: ${JSON.stringify(
      text
    )}, translate it into ${language}.`;

    const response = await geminiGetAnswer(prompt);

    // Clean and parse the response
    const cleanedResponse = cleanResponse(response);
    if (!cleanedResponse) {
      console.error("Failed to clean or validate the response.");
      return null; // Return null if response cleaning fails
    }

    const parsedResponse = JSON.parse(cleanedResponse);
    return parsedResponse; // Return the entire translated object
  } catch (error) {
    console.error(`Error translating text: ${error.message}`);
    return null; // Return null in case of error
  }
}

// Function to synchronize translations
async function syncTranslations(text) {
  try {
    console.log("Synchronizing translations...");
    const prompt = `${SYNC_PROMPT} Here is the text: ${JSON.stringify(text)}.`;

    const response = await geminiGetAnswer(prompt);

    // Clean and parse the response
    const cleanedResponse = cleanResponse(response);
    if (!cleanedResponse) {
      console.error("Failed to clean or validate the response.");
      return null; // Return null if response cleaning fails
    }

    const parsedResponse = JSON.parse(cleanedResponse);
    return parsedResponse; // Return the entire synchronized object
  } catch (error) {
    console.error(`Error synchronizing translations: ${error.message}`);
    return null; // Return null in case of error
  }
}

// Function to save the translated or synchronized dict
async function saveTranslatedDict(translatedDict, outputPath) {
  try {
    const jsContent = `export const dict = ${JSON.stringify(
      translatedDict,
      null,
      2
    )};`;
    fs.writeFileSync(outputPath, jsContent, "utf8");
    console.log("Translation saved to", outputPath);
  } catch (error) {
    console.error("Error saving translated dictionary:", error.message);
  }
}

// Main function that orchestrates the actions
async function main() {
  // Get the language and action from the command-line arguments
  const targetLanguage = process.argv[3]; // Get the target language from the command line (e.g., 'fr')
  const action = process.argv[2]; // 'translate' or 'sync'

  if (!action || (action !== "add" && action !== "sync")) {
    console.error("Please provide a valid action ('add' or 'sync').");
    process.exit(1);
  }

  if (action === "add" && (!targetLanguage || !languages[targetLanguage])) {
    console.error("Please provide a valid target language code (e.g., 'fr').");
    listLanguages();
    process.exit(1);
  }

  console.log(
    `Selected language: ${languages[targetLanguage]}, Action: ${action}`
  );

  // Perform the selected action
  if (action === "add") {
    console.log("Starting translation... Please wait.");
    const translatedDict = await translateText(dict, targetLanguage);

    if (!translatedDict) {
      console.error("Translation failed or could not be added.");
      process.exit(1);
    }

    if (!translatedDict[targetLanguage]) {
      console.error("Target language translation not found.");
      process.exit(1);
    }

    dict[targetLanguage] = translatedDict[targetLanguage];
    const outputPath = dictPath; // Overwrite the dict.js file
    await saveTranslatedDict(dict, outputPath);
  } else if (action === "sync") {
    console.log("Starting synchronization... Please wait.");
    const syncedDict = await syncTranslations(dict);

    if (!syncedDict) {
      console.error("Synchronization failed.");
      process.exit(1);
    }

    dict = syncedDict;
    const outputPath = dictPath; // Overwrite the dict.js file
    await saveTranslatedDict(dict, outputPath);
  }
}

// Run the main function
main().catch((error) => {
  console.error("Error in main function:", error.message);
  process.exit(1);
});
