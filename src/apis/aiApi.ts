import { preprocessText } from "@/utils/helper";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AppAlerts } from "@/lib/appAlerts";

export class AiApi {
  private apiKeys: string[];
  private static workingApiKey: string | null = null;
  private static readonly STORAGE_KEY = "gemini-working-key";
  private appAlerts = new AppAlerts();

  MAIN_PROMPT = `This an AI reader application, you are going to receive some text, with an instruction
  such as "translate, explain, summarize ..." you will receive the language to translate to, or the context of the text.
  Give directly the desired result with no introdution nor conclusion.`;

  constructor() {
    // Initialize with 10 API keys (add more if needed)
    this.apiKeys = [
      process.env.NEXT_PUBLIC_GEMINI_KEY_1 || "",
      process.env.NEXT_PUBLIC_GEMINI_KEY_2 || "",
      process.env.NEXT_PUBLIC_GEMINI_KEY_3 || "",
      process.env.NEXT_PUBLIC_GEMINI_KEY_4 || "",
      process.env.NEXT_PUBLIC_GEMINI_KEY_5 || "",
      process.env.NEXT_PUBLIC_GEMINI_KEY_6 || "",
      process.env.NEXT_PUBLIC_GEMINI_KEY_7 || "",
      process.env.NEXT_PUBLIC_GEMINI_KEY_8 || "",
      process.env.NEXT_PUBLIC_GEMINI_KEY_9 || "",
      process.env.NEXT_PUBLIC_GEMINI_KEY_10 || "",
    ].filter((key) => key.trim() !== ""); // Remove empty keys

    // Load working key from localStorage if available
    if (typeof window !== "undefined") {
      const storedKey = localStorage.getItem(AiApi.STORAGE_KEY);
      if (storedKey && this.apiKeys.includes(storedKey)) {
        AiApi.workingApiKey = storedKey;
      }
    }
  }

  // Helper method to try API keys
  private async tryApiKeys<T>(
    requestFn: (apiKey: string) => Promise<T>
  ): Promise<T> {
    let startIndex = 0;

    // If a working API key exists, try it first
    if (AiApi.workingApiKey) {
      try {
        const result = await requestFn(AiApi.workingApiKey);
        return result;
      } catch (error) {
        console.error("Working API key failed, trying other keys...");
        // Find the index of the working API key and start from the next one
        startIndex = this.apiKeys.indexOf(AiApi.workingApiKey) + 1;
        AiApi.workingApiKey = null; // Reset the working API key since it failed
        // Clear from localStorage when key fails
        if (typeof window !== "undefined") {
          localStorage.removeItem(AiApi.STORAGE_KEY);
        }
      }
    }

    // Try the remaining API keys
    for (let i = startIndex; i < this.apiKeys.length; i++) {
      const apiKey = this.apiKeys[i];
      if (!apiKey) continue; // Skip empty keys

      try {
        const result = await requestFn(apiKey);
        AiApi.workingApiKey = apiKey; // Store the working API key
        // Save to localStorage when we find a working key
        if (typeof window !== "undefined") {
          localStorage.setItem(AiApi.STORAGE_KEY, apiKey);
        }
        return result;
      } catch (error) {
        console.error(`Error with API key ${i + 1}:`, error);
        this.appAlerts.sendErrorAlert(`Error with API key ${i + 1}`);
        if (i === this.apiKeys.length - 1) {
          this.appAlerts.sendErrorAlert(`"All API keys failed`);
          throw new Error("All API keys failed");
        }
      }
    }

    throw new Error("No API keys available");
  }

  private async geminiGetAnswer(prompt: string): Promise<string | undefined> {
    return this.tryApiKeys(async (apiKey) => {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      return result.response.text() || undefined;
    });
  }

  promptAi = async (prompt: string) => {
    try {
      return await this.geminiGetAnswer(prompt);
    } catch (e) {
      console.log(`Failed to prompt AI after retries`, e);
      return undefined;
    }
  };

  getTranslation = async (text: string, language: string) => {
    const prompt = `${this.MAIN_PROMPT} Translate this text: "${text}" to this language: "${language}"
        you should use on the ${language} language and nothing else. `;
    try {
      return await this.promptAi(prompt);
    } catch (e) {
      console.log("Failed to translate text", e);
      return undefined;
    }
  };

  getSummary = async (text: string, language: string) => {
    const prompt = `${this.MAIN_PROMPT} Summarize this text: "${text}" in this language: "${language}"
    you should use only the ${language} language and nothing else. 
    You should give the meaining with as few words as possible.
    `;
    try {
      return await this.promptAi(prompt);
    } catch (e) {
      console.log("Failed to summarize text", e);
      return undefined;
    }
  };

  getExplantion = async (
    text: string,
    language: string,
    bookContext: string
  ) => {
    const prompt = `${this.MAIN_PROMPT} Explain this text: "${text}" in this language: "${language}",
    you should use only the ${language} language and nothing else (dont use letters from a language in 
      another different language like english letters in arabic translation).  
    given this book context: "${bookContext}". if the text is a few words, explain them without 
    refering to the context, the context is only given to enhance your undertanding of the text.`;
    try {
      return await this.promptAi(prompt);
    } catch (e) {
      console.log("Failed to explain text", e);
      return undefined;
    }
  };

  getBookTitle = async (bookContext: string) => {
    const prompt = `${this.MAIN_PROMPT} Give the title of this book: "${bookContext}", only the title with nothing else.`;
    try {
      return await this.promptAi(prompt);
    } catch (e) {
      console.log("Failed to get book title", e);
      return undefined;
    }
  };

  preprocessText = async (text: string): Promise<string> => {
    const prompt = `${this.MAIN_PROMPT} Preprocess this text: "${text}". 
    Remove all the extra spaces and fix the text. 
    Add a full stop at the end of every title if found. 
    All text have to make sense, remove any extra words or letters.
    Remove the source numbers if found. 
    If what seems like the title of the book or part number (like the ones put on the head or the side of the page) is found at the start of the text, remove it.
    Do not change the text,
     just clean it. Give back the cleaned text with no introduction or conclusion.`;
    try {
      const response = await this.promptAi(prompt);
      return response && response !== text ? response : preprocessText(text);
    } catch (e) {
      console.log("Failed to preprocess text with AI, using local fallback", e);
      return preprocessText(text);
    }
  };

  // Get the working API key
  getWorkingApiKey(): string | null {
    return AiApi.workingApiKey;
  }
}
