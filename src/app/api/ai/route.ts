import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const API_KEYS = [
  process.env.GEMINI_API_KEY_1 || "",
  process.env.GEMINI_API_KEY_2 || "",
  process.env.GEMINI_API_KEY_3 || "",
  process.env.GEMINI_API_KEY_4 || "",
  process.env.GEMINI_API_KEY_5 || "",
  process.env.GEMINI_API_KEY_6 || "",
  process.env.GEMINI_API_KEY_7 || "",
  process.env.GEMINI_API_KEY_8 || "",
  process.env.GEMINI_API_KEY_9 || "",
  process.env.GEMINI_API_KEY_10 || "",
  process.env.GEMINI_API_KEY_11 || "",
  process.env.GEMINI_API_KEY_12 || "",
  process.env.GEMINI_API_KEY_13 || "",
  process.env.GEMINI_API_KEY_14 || "",
  process.env.GEMINI_API_KEY_15 || "",
  process.env.GEMINI_API_KEY_16 || "",
  process.env.GEMINI_API_KEY_17 || "",
  process.env.GEMINI_API_KEY_18 || "",
  process.env.GEMINI_API_KEY_19 || "",
  process.env.GEMINI_API_KEY_20 || "",
  process.env.GEMINI_API_KEY_21 || "",
  process.env.GEMINI_API_KEY_22 || "",
  process.env.GEMINI_API_KEY_23 || "",
  process.env.GEMINI_API_KEY_24 || "",
  process.env.GEMINI_API_KEY_25 || "",
].filter((key) => key.trim() !== "");

async function tryApiKeys<T>(
  requestFn: (apiKey: string) => Promise<T>,
): Promise<T> {
  console.log(`[Gemini] Starting request with ${API_KEYS.length} available keys`);
  
  for (let i = 0; i < API_KEYS.length; i++) {
    const apiKey = API_KEYS[i];
    const maskedKey = `${apiKey.substring(0, 6)}...${apiKey.substring(apiKey.length - 4)}`;
    console.log(`[Gemini] Trying API key ${i + 1}/${API_KEYS.length} (${maskedKey})`);
    console.log(`API key (DEBUG): ${apiKey}`);
    
    try {
      return await requestFn(apiKey);
    } catch (error: any) {
      console.error(`[Gemini] API key ${i + 1} failed:`, error.message);
      if (i === API_KEYS.length - 1) throw error;
    }
  }
  throw new Error("All Gemini API keys failed or no keys found");
}

export async function POST(req: Request) {
  try {
    const { action, prompt, history, systemInstruction } = await req.json();

    if (action === "prompt" || action === "chat") {
      const result = await tryApiKeys(async (apiKey) => {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: "gemini-2.5-flash",
          systemInstruction,
        });

        if (action === "chat" && history) {
          const chat = model.startChat({ history });
          const response = await chat.sendMessage(prompt);
          return response.response.text();
        } else {
          const response = await model.generateContent(prompt);
          return response.response.text();
        }
      });

      return NextResponse.json({ result });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("AI Route Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
