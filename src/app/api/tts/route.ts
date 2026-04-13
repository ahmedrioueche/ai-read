import axios from "axios";
import { NextResponse } from "next/server";

const ELEVENLABS_KEYS = [
  process.env.ELEVENLABS_KEY_1 || process.env.NEXT_PUBLIC_ELEVENLABS_KEY_1 || "",
  process.env.ELEVENLABS_KEY_2 || process.env.NEXT_PUBLIC_ELEVENLABS_KEY_2 || "",
  process.env.ELEVENLABS_KEY_3 || process.env.NEXT_PUBLIC_ELEVENLABS_KEY_3 || "",
  process.env.ELEVENLABS_KEY_4 || process.env.NEXT_PUBLIC_ELEVENLABS_KEY_4 || "",
  process.env.ELEVENLABS_KEY_5 || process.env.NEXT_PUBLIC_ELEVENLABS_KEY_5 || "",
  process.env.ELEVENLABS_KEY_6 || process.env.NEXT_PUBLIC_ELEVENLABS_KEY_6 || "",
  process.env.ELEVENLABS_KEY_7 || process.env.NEXT_PUBLIC_ELEVENLABS_KEY_7 || "",
  process.env.ELEVENLABS_KEY_8 || process.env.NEXT_PUBLIC_ELEVENLABS_KEY_8 || "",
  process.env.ELEVENLABS_KEY_9 || process.env.NEXT_PUBLIC_ELEVENLABS_KEY_9 || "",
  process.env.ELEVENLABS_KEY_10 || process.env.NEXT_PUBLIC_ELEVENLABS_KEY_10 || "",
  process.env.ELEVENLABS_KEY_11 || process.env.NEXT_PUBLIC_ELEVENLABS_KEY_11 || "",
  process.env.ELEVENLABS_KEY_12 || process.env.NEXT_PUBLIC_ELEVENLABS_KEY_12 || "",
  process.env.ELEVENLABS_KEY_13 || process.env.NEXT_PUBLIC_ELEVENLABS_KEY_13 || "",
  process.env.ELEVENLABS_KEY_14 || process.env.NEXT_PUBLIC_ELEVENLABS_KEY_14 || "",
  process.env.ELEVENLABS_KEY_15 || process.env.NEXT_PUBLIC_ELEVENLABS_KEY_15 || "",
  process.env.ELEVENLABS_KEY_16 || process.env.NEXT_PUBLIC_ELEVENLABS_KEY_16 || "",
].filter((key) => key.trim() !== "");

const AZURE_KEY = process.env.AZURE_KEY_1 || process.env.NEXT_PUBLIC_AZURE_KEY_1 || "";

async function tryElevenLabsKeys<T>(
  requestFn: (apiKey: string) => Promise<T>
): Promise<T> {
  for (let i = 0; i < ELEVENLABS_KEYS.length; i++) {
    const apiKey = ELEVENLABS_KEYS[i];
    try {
      return await requestFn(apiKey);
    } catch (error: any) {
      console.error(`ElevenLabs API key ${i + 1} failed:`, error.message);
      if (i === ELEVENLABS_KEYS.length - 1) throw error;
    }
  }
  throw new Error("All ElevenLabs API keys failed");
}

export async function POST(req: Request) {
  try {
    const { action, text, voiceId, voiceSettings, voiceName, provider } = await req.json();

    if (provider === "azure") {
      const azureUrl = "https://eastus.tts.speech.microsoft.com/cognitiveservices/v1";
      if (action === "speech") {
        const ssml = `
          <speak version='1.0' xml:lang='en-US'>
            <voice name='${voiceName || "en-US-JennyNeural"}'>
              ${text}
            </voice>
          </speak>
        `;
        const response = await axios.post(azureUrl, ssml, {
          headers: {
            "Ocp-Apim-Subscription-Key": AZURE_KEY,
            "Content-Type": "application/ssml+xml",
            "X-Microsoft-OutputFormat": "audio-16khz-128kbitrate-mono-mp3",
          },
          responseType: "arraybuffer",
        });
        return new Response(response.data, {
          headers: { "Content-Type": "audio/mpeg" },
        });
      } else if (action === "voices") {
        const voicesUrl = "https://eastus.tts.speech.microsoft.com/cognitiveservices/voices/list";
        const response = await axios.get(voicesUrl, {
          headers: { "Ocp-Apim-Subscription-Key": AZURE_KEY },
        });
        return NextResponse.json(response.data);
      }
    } else {
      // Default to ElevenLabs
      const elUrl = "https://api.elevenlabs.io/v1";
      
      if (action === "speech") {
        return await tryElevenLabsKeys(async (apiKey) => {
          const response = await axios.post(`${elUrl}/text-to-speech/${voiceId}`, {
            text,
            voice_settings: {
              stability: voiceSettings?.stability || 0.5,
              similarity_boost: voiceSettings?.similarity_boost || 0.5,
            },
            model_id: "eleven_multilingual_v2",
          }, {
            headers: { "xi-api-key": apiKey },
            responseType: "arraybuffer",
          });
          return new Response(response.data, {
            headers: { "Content-Type": "audio/mpeg" },
          });
        });
      } else if (action === "voices") {
        return await tryElevenLabsKeys(async (apiKey) => {
          const response = await axios.get(`${elUrl}/voices`, {
            headers: { "xi-api-key": apiKey },
          });
          return NextResponse.json(response.data);
        });
      } else if (action === "credit") {
        return await tryElevenLabsKeys(async (apiKey) => {
          const response = await axios.get(`${elUrl}/user`, {
            headers: { "xi-api-key": apiKey },
          });
          const remaining = response.data.subscription.character_limit - response.data.subscription.character_count;
          return NextResponse.json({ remaining });
        });
      }
    }

    return NextResponse.json({ error: "Invalid action or provider" }, { status: 400 });
  } catch (error: any) {
    console.error("TTS Route Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
