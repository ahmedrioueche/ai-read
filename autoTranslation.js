import fs from "fs";
import path from "path";
import { watch } from "fs/promises";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_KEY;
if (!API_KEY) {
  console.error("API key is missing!");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

const DICT_PATH = "./src/utils/dict.js";
const WATCH_DIRECTORY = "./src";
const JSX_PATTERN = /\.(jsx?|tsx?)$/;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

// Load dictionary once
function loadDictionary() {
  if (!fs.existsSync(DICT_PATH)) return { en: {} };

  const dictContent = fs.readFileSync(DICT_PATH, "utf8");
  try {
    const match = dictContent.match(/=\s*({[\s\S]*});/);
    return match ? eval(`(${match[1]})`) : { en: {} };
  } catch (error) {
    console.error("Error loading dictionary:", error);
    return { en: {} };
  }
}

// Extract languages
function getLanguages(dict) {
  return Object.keys(dict);
}

// Extract all existing keys in a flat structure for quick lookup
function flattenKeys(dict) {
  const keys = new Set();
  function traverse(obj, prefix = "") {
    for (const key in obj) {
      const path = prefix ? `${prefix}.${key}` : key;
      keys.add(path);
      if (typeof obj[key] === "object" && obj[key] !== null) {
        traverse(obj[key], path);
      }
    }
  }
  traverse(dict.en || {});
  return keys;
}

// Extract text references from a file
function extractTextReferences(content) {
  const pattern = /text\.([a-zA-Z][\w.]*)/g;
  return [...new Set([...content.matchAll(pattern)].map((match) => match[1]))];
}

// Generate translations for all languages
async function generateTranslations(key, languages) {
  const results = {};
  await Promise.all(
    languages.map(async (lang) => {
      const prompt = `
        Translate the following UI key into ${lang}.
        Key: "${key}"
        Provide only the translated text for ${lang}.
      `.trim();
      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
          const result = await model.generateContent(prompt);
          const translation = result.response
            .text()
            .trim()
            .replace(/["']/g, "");

          // Ensure valid script for specific languages
          if (lang === "ar" && !/[\u0600-\u06FF]/.test(translation)) {
            throw new Error(`Invalid Arabic script for key: ${key}`);
          }

          results[lang] = translation;
          return;
        } catch (error) {
          console.error(`Translation failed for ${key} in ${lang}:`, error);
          if (attempt === MAX_RETRIES) {
            results[lang] = key; // Fallback to key as value
          }
          await new Promise((r) => setTimeout(r, RETRY_DELAY * attempt));
        }
      }
    })
  );
  return results;
}

// Update the dictionary with new translations
async function updateDictionary(dict, newKeys, existingKeys, languages) {
  for (const key of newKeys) {
    if (existingKeys.has(key)) continue;

    const translations = await generateTranslations(key, languages);
    for (const lang of languages) {
      const keys = key.split(".");
      let current = dict[lang] || {};
      dict[lang] = current;

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]] = current[keys[i]] || {};
      }

      // Preserve existing value if it exists
      const finalKey = keys[keys.length - 1];
      if (!(finalKey in current)) {
        current[finalKey] = translations[lang] || key;
      }
    }
  }
}

// Save the dictionary
function saveDictionary(dict) {
  try {
    const content = `export const dict = ${JSON.stringify(dict, null, 2)};`;
    fs.writeFileSync(DICT_PATH, content, "utf8");
    console.log("Dictionary saved successfully");
  } catch (error) {
    console.error("Error saving dictionary:", error);
  }
}

// Main watcher
// Main watcher
async function watchFiles() {
  try {
    const watcher = watch(WATCH_DIRECTORY, { recursive: true });
    console.log(`Watching ${WATCH_DIRECTORY} for changes...`);

    for await (const event of watcher) {
      if (!event.filename || !JSX_PATTERN.test(event.filename)) continue;

      const filePath = path.join(WATCH_DIRECTORY, event.filename);
      try {
        const content = fs.readFileSync(filePath, "utf8");
        const textRefs = extractTextReferences(content);

        // Reload the dictionary from file to ensure the latest state
        const currentDict = loadDictionary();
        const languages = getLanguages(currentDict);
        const existingKeys = flattenKeys(currentDict);

        const newKeys = textRefs.filter((key) => !existingKeys.has(key));

        if (newKeys.length > 0) {
          console.log(`Found ${newKeys.length} new keys:`, newKeys);
          await updateDictionary(currentDict, newKeys, existingKeys, languages);
          saveDictionary(currentDict);
        }
      } catch (error) {
        console.error(`Error processing ${filePath}:`, error);
      }
    }
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  }
}

watchFiles();
