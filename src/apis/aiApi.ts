import axios from "axios";
import { preprocessText } from "@/utils/helper";

export class AiApi {
  MAIN_PROMPT = `You are the AI Reading Guide. You will receive text alongside instructions such as "translate", "explain", or "summarize".
  Your goal is to provide direct, clean results without introductions or conclusions.`;

  private async callAiRoute(data: any) {
    try {
      const response = await axios.post("/api/ai", data);
      return response.data.result;
    } catch (error) {
      console.error("AI Bridge Error:", error);
      throw error;
    }
  }

  promptAi = async (prompt: string) => {
    try {
      return await this.callAiRoute({ action: "prompt", prompt });
    } catch (e) {
      console.log(`Failed to prompt AI after retries`, e);
      return undefined;
    }
  };

  getTranslation = async (text: string, language: string) => {
    const prompt = `${this.MAIN_PROMPT} Translate this text: "${text}" to this language: "${language}"
        you should use on the ${language} language and nothing else. `;
    return this.promptAi(prompt);
  };

  getSummary = async (text: string, language: string) => {
    const prompt = `${this.MAIN_PROMPT} Summarize this text: "${text}" in this language: "${language}"
    you should use only the ${language} language and nothing else. 
    You should give the meaining with as few words as possible.
    `;
    return this.promptAi(prompt);
  };

  getExplantion = async (
    text: string,
    language: string,
    bookContext: string,
  ) => {
    const prompt = `${this.MAIN_PROMPT} Explain this text: "${text}" in this language: "${language}",
    you should use only the ${language} language and nothing else (dont use letters from a language in 
      another different language like english letters in arabic translation).  
    given this book context: "${bookContext}". if the text is a few words, explain them without 
    refering to the context, the context is only given to enhance your undertanding of the text.`;
    return this.promptAi(prompt);
  };

  getBookTitle = async (bookContext: string) => {
    const prompt = `${this.MAIN_PROMPT} Give the title of this book: "${bookContext}", only the title with nothing else.`;
    return this.promptAi(prompt);
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

  chatWithBook = async (
    message: string,
    history: { role: "user" | "model"; parts: { text: string }[] }[],
    bookContext: string,
    dynamicContext: string,
    currentPage: number,
    language: string,
  ) => {
    const systemInstruction = `You are the AI Reading Guide. 
    You are helping the user with the book they are currently reading.
    
    BOOKS OVERVIEW CONTEXT (First few pages):
    "${bookContext}"
    
    CURRENT PAGE CONTEXT (Page ${currentPage} and surroundings):
    "${dynamicContext}"
    
    GUARDRAILS:
    1. Only answer questions related to the book or the text provided.
    2. If the user asks something unrelated, politely decline and steer back to the book.
    3. You must respond ONLY in the ${language} language.
    4. Keep your responses concise and to the point. Avoid long-winded answers unless necessary for complexity or if specifically requested.
    5. You have access to the first few pages and the pages around the user's current page (${currentPage}). 
    6. If you don't find the answer in the provided context, but it's a well-known book, you can use your general knowledge, but prioritize the provided text.
    7. ALWAYS maintain a helpful and premium tone.`;

    return await this.callAiRoute({
      action: "chat",
      prompt: message,
      history,
      systemInstruction,
    });
  };
}
