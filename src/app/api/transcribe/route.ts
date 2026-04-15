import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { checkRateLimit } from "@/utils/rateLimiter";

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
  for (let i = 0; i < API_KEYS.length; i++) {
    const apiKey = API_KEYS[i];
    try {
      return await requestFn(apiKey);
    } catch (error: any) {
      console.error(`[Gemini Transcribe] API key ${i + 1} failed:`, error.message);
      if (i === API_KEYS.length - 1) throw error;
    }
  }
  throw new Error("All Gemini API keys failed or no keys found");
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "anonymous";
    const limiter = checkRateLimit(ip);

    if (!limiter.allowed) {
      return NextResponse.json({ error: limiter.message }, { status: 429 });
    }

    const formData = await req.formData();
    const audioFile = formData.get("audio") as Blob;
    
    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    const arrayBuffer = await audioFile.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = audioFile.type || "audio/webm";

    const result = await tryApiKeys(async (apiKey) => {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const response = await model.generateContent([
        {
          inlineData: {
            data: base64Audio,
            mimeType: mimeType
          }
        },
        { text: "Transcribe this audio. Return only the transcription text, nothing else. If the audio is silent or contains no speech, return an empty string." }
      ]);

      return response.response.text();
    });

    return NextResponse.json({ text: result.trim() });
  } catch (error: any) {
    console.error("Transcription Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
