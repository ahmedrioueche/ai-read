import { GoogleGenerativeAI } from "@google/generative-ai";
const REACT_APP_GEMINI_KEY = "AIzaSyBowicWyGh8ZaVtyc6h0a5qhv-Q6Yjicyk"; //shouldnt be here

const API_KEY: string | undefined = REACT_APP_GEMINI_KEY;
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;
const model = genAI?.getGenerativeModel({ model: "gemini-1.5-flash" });

export class AiApi {
  MAIN_PROMPT = `This a AI reader application, you are going to receive some text, with an instruction
  such as "translate, explain, summarize ..." you will receive the language to translate to, or the context of the text.
  Give directly the desired result with no introdution nor conclusion.`;

  geminiGetAnswer = async (prompt: string) => {
    const result = await model?.generateContent(prompt);

    return result?.response.text();
  };

  promptAi = async (prompt: string) => {
    try {
      const response = this.geminiGetAnswer(prompt);
      return response;
    } catch (e) {
      console.log(`Failed to prompt AI`);
    }
  };

  getTranslation = async (text: string, language: string) => {
    const prompt = `${this.MAIN_PROMPT} Translate this text: "${text}" to this language: "${language}"`;
    try {
      const response = await this.promptAi(prompt);
      return response;
    } catch (e) {
      console.log("Failed to translate text");
    }
  };

  getSummary = async (text: string, language: string) => {
    const prompt = `${this.MAIN_PROMPT} Summarize this text: "${text}" in this language: "${language}". 
    You should give the meaining with as few words as possible
    `;
    try {
      const response = await this.promptAi(prompt);
      return response;
    } catch (e) {
      console.log("Failed to summarize text");
    }
  };

  getExplantion = async (
    text: string,
    language: string,
    bookContext: string
  ) => {
    const prompt = `${this.MAIN_PROMPT} Explain this text: "${text}" in this language: "${language}" 
    given this book context: "${bookContext}". if the text is a few words, explain them without 
    refering to the context, the context is only given to enhance your undertanding of the text.`;
    try {
      const response = await this.promptAi(prompt);
      return response;
    } catch (e) {
      console.log("Failed to explain text");
    }
  };
}
