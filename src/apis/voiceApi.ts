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
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    // Access the environment variable for the API key
    this.apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_KEY || "";

    if (!this.apiKey) {
      throw new Error(
        "API key not found! Please set NEXT_PUBLIC_ELEVENLABS_KEY in your environment variables."
      );
    }

    this.apiUrl = "https://api.elevenlabs.io/v1";
  }

  // Fetch available voices
  async getVoices(): Promise<any> {
    try {
      const response = await axios.get<VoiceResponse>(`${this.apiUrl}/voices`, {
        headers: {
          "xi-api-key": this.apiKey,
        },
      });
      console.log("Available Voices:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching voices:", error);
    }
  }

  // Text to Speech conversion
  async textToSpeech(
    text: string,
    voiceId: string,
    voiceSettings: VoiceSettings = {}
  ): Promise<Buffer | string> {
    const url = `${this.apiUrl}/text-to-speech/${voiceId}`;
    const payload = {
      text,
      voice_settings: {
        stability: voiceSettings.stability || 0.5,
        similarity_boost: voiceSettings.similarity_boost || 0.5,
      },
      model_id: "eleven_multilingual_v2",
    };

    try {
      const response = await axios.post(url, payload, {
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": this.apiKey,
        },
        responseType: "arraybuffer", // Get the audio as binary data
      });

      const audioBuffer = response.data;

      // Return the audio buffer directly (for playback in your app)
      return audioBuffer;
    } catch (error) {
      console.error("Error generating speech:", error);
      throw error;
    }
  }
}
