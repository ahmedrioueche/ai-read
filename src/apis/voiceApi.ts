import axios from "axios";

interface VoiceSettings {
  stability?: number;
  similarity_boost?: number;
}

export default class VoiceApi {
  // Fetch available voices via backend bridge
  async getVoices(): Promise<any> {
    try {
      const response = await axios.post("/api/tts", { action: "voices", provider: "elevenlabs" });
      return response.data;
    } catch (error) {
      console.error("Voices Bridge Error:", error);
      throw error;
    }
  }

  // Text to Speech conversion via backend bridge
  async textToSpeech(
    text: string,
    voiceId: string,
    voiceSettings: VoiceSettings = {},
  ): Promise<ArrayBuffer> {
    try {
      const response = await axios.post("/api/tts", {
        action: "speech",
        provider: "elevenlabs",
        text,
        voiceId,
        voiceSettings,
      }, {
        responseType: "arraybuffer",
      });

      return response.data;
    } catch (error) {
      console.error("TTS Bridge Error:", error);
      throw new Error("Failed to generate speech");
    }
  }

  // Get the remaining credit via backend bridge
  async getValidKeyRemainingCredit(): Promise<number | null> {
    try {
      const response = await axios.post("/api/tts", { action: "credit", provider: "elevenlabs" });
      return response.data.remaining;
    } catch (error) {
      console.error("Credit Bridge Error:", error);
      return null;
    }
  }
}

export class VoiceApi2 {
  // Method to fetch available voices via backend bridge
  async getVoices(): Promise<any[]> {
    try {
      const response = await axios.post("/api/tts", { action: "voices", provider: "azure" });
      return response.data;
    } catch (error) {
      console.error("Azure Voices Bridge Error:", error);
      throw error;
    }
  }

  // Method to synthesize speech via backend bridge
  async textToSpeech(
    text: string,
    voiceName: string = "en-US-JennyNeural",
  ): Promise<ArrayBuffer> {
    try {
      const response = await axios.post("/api/tts", {
        action: "speech",
        provider: "azure",
        text,
        voiceName,
      }, {
        responseType: "arraybuffer",
      });

      return response.data;
    } catch (error) {
      console.error("Azure TTS Bridge Error:", error);
      throw error;
    }
  }
}
