import axios from "axios";

// Define types for voice response and API key
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
  private static workingApiKey: string | null = null; // Static variable to persist the working key

  constructor() {
    // Define the API keys from environment variables
    this.apiKeys = [process.env.NEXT_PUBLIC_ELEVENLABS_KEY_8 || ""];

    this.apiUrl = "https://api.elevenlabs.io/v1";
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
      }
    }

    // Try the remaining API keys
    for (let i = startIndex; i < this.apiKeys.length; i++) {
      const apiKey = this.apiKeys[i];
      if (!apiKey) continue; // Skip empty keys

      try {
        const result = await requestFn(apiKey);
        VoiceApi.workingApiKey = apiKey; // Store the working API key
        return result;
      } catch (error) {
        console.error(`Error with API key ${i + 1}:`, error);
        if (i === this.apiKeys.length - 1) {
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

  // Get the working API key (for debugging or other purposes)
  getWorkingApiKey(): string | null {
    return VoiceApi.workingApiKey;
  }
}
