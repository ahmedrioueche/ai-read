import { AppAlerts } from "@/lib/appAlerts";
import axios from "axios";

interface VoiceResponse {
  data: any;
}

interface VoiceSettings {
  stability?: number;
  similarity_boost?: number;
}

export default class VoiceApi {
  private apiKeys: string[];
  private apiUrl: string;
  private static workingApiKey: string | null = null;
  private static readonly STORAGE_KEY = "elevenlabs-working-key";
  private appAlerts = new AppAlerts();

  constructor() {
    this.apiKeys = [
      process.env.NEXT_PUBLIC_ELEVENLABS_KEY_9 || "",
      process.env.NEXT_PUBLIC_ELEVENLABS_KEY_10 || "",
      process.env.NEXT_PUBLIC_ELEVENLABS_KEY_11 || "",
      process.env.NEXT_PUBLIC_ELEVENLABS_KEY_12 || "",
      process.env.NEXT_PUBLIC_ELEVENLABS_KEY_13 || "",
      process.env.NEXT_PUBLIC_ELEVENLABS_KEY_14 || "",
      process.env.NEXT_PUBLIC_ELEVENLABS_KEY_15 || "",
      process.env.NEXT_PUBLIC_ELEVENLABS_KEY_16 || "",
    ];

    this.apiUrl = "https://api.elevenlabs.io/v1";

    // Try to load the working key from localStorage on initialization
    if (typeof window !== "undefined") {
      const storedKey = localStorage.getItem(VoiceApi.STORAGE_KEY);
      if (storedKey && this.apiKeys.includes(storedKey)) {
        VoiceApi.workingApiKey = storedKey;
      }
    }
  }

  // Helper method to try API keys
  private async tryApiKeys<T>(
    requestFn: (apiKey: string) => Promise<T>
  ): Promise<T> {
    let startIndex = 0;

    // If a working API key exists, try it first
    if (VoiceApi.workingApiKey) {
      try {
        const result = await requestFn(VoiceApi.workingApiKey);
        return result;
      } catch (error) {
        console.error("Working API key failed, trying other keys...");
        // Find the index of the working API key and start from the next one
        startIndex = this.apiKeys.indexOf(VoiceApi.workingApiKey) + 1;
        VoiceApi.workingApiKey = null; // Reset the working API key since it failed
        // Clear from localStorage when key fails
        if (typeof window !== "undefined") {
          localStorage.removeItem(VoiceApi.STORAGE_KEY);
        }
      }
    }

    // Try the remaining API keys
    for (let i = startIndex; i < this.apiKeys.length; i++) {
      const apiKey = this.apiKeys[i];
      if (!apiKey) continue; // Skip empty keys

      try {
        const result = await requestFn(apiKey);
        VoiceApi.workingApiKey = apiKey; // Store the working API key
        // Save to localStorage when we find a working key
        if (typeof window !== "undefined") {
          localStorage.setItem(VoiceApi.STORAGE_KEY, apiKey);
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

  // Fetch available voices
  async getVoices(): Promise<any> {
    return this.tryApiKeys(async (apiKey) => {
      const response = await axios.get<VoiceResponse>(`${this.apiUrl}/voices`, {
        headers: {
          "xi-api-key": apiKey,
        },
      });
      return response.data;
    });
  }

  // Text to Speech conversion
  async textToSpeech(
    text: string,
    voiceId: string,
    voiceSettings: VoiceSettings = {}
  ): Promise<Buffer | string> {
    return this.tryApiKeys(async (apiKey) => {
      const url = `${this.apiUrl}/text-to-speech/${voiceId}`;
      const payload = {
        text,
        voice_settings: {
          stability: voiceSettings.stability || 0.5,
          similarity_boost: voiceSettings.similarity_boost || 0.5,
        },
        model_id: "eleven_multilingual_v2",
      };

      const response = await axios.post(url, payload, {
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        responseType: "arraybuffer",
      });

      return response.data;
    });
  }

  // Get the working API key
  getWorkingApiKey(): string | null {
    return VoiceApi.workingApiKey;
  }

  // Get the remaining credit for the valid API key
  async getValidKeyRemainingCredit(): Promise<number | null> {
    if (!VoiceApi.workingApiKey) {
      console.error("No valid API key found.");
      return null;
    }

    try {
      const response = await axios.get(`${this.apiUrl}/user`, {
        headers: {
          "xi-api-key": VoiceApi.workingApiKey,
        },
      });

      // Extract the remaining character limit from the response
      const remainingCredit =
        response.data.subscription.character_limit -
        response.data.subscription.character_count;
      return remainingCredit;
    } catch (error) {
      console.error("Failed to fetch remaining credit:", error);
      return null;
    }
  }
}

export class VoiceApi2 {
  private apiKey = process.env.NEXT_PUBLIC_AZURE_KEY_1;
  private apiUrl =
    "https://eastus.tts.speech.microsoft.com/cognitiveservices/v1";

  // Method to fetch available voices
  async getVoices(): Promise<any[]> {
    console.log("getVoices");

    const voicesUrl = `https://eastus.tts.speech.microsoft.com/cognitiveservices/voices/list`;

    const headers = {
      "Ocp-Apim-Subscription-Key": this.apiKey,
    };

    try {
      const response = await axios.get(voicesUrl, { headers });
      console.log("response", response);
      return response.data;
    } catch (error) {
      console.error("Error fetching available voices:", error);
      throw error;
    }
  }

  // Method to synthesize speech
  async textToSpeech(
    text: string,
    voiceName: string = "en-US-JennyNeural"
  ): Promise<ArrayBuffer> {
    const headers = {
      "Ocp-Apim-Subscription-Key": this.apiKey,
      "Content-Type": "application/ssml+xml",
      "X-Microsoft-OutputFormat": "audio-16khz-128kbitrate-mono-mp3",
    };

    const ssml = `
      <speak version='1.0' xml:lang='en-US'>
        <voice name='${voiceName}'>
          ${text}
        </voice>
      </speak>
    `;

    try {
      const response = await axios.post(this.apiUrl, ssml, {
        headers: headers,
        responseType: "arraybuffer",
      });

      return response.data;
    } catch (error) {
      console.error("Error synthesizing speech:", error);
      throw error;
    }
  }
}
