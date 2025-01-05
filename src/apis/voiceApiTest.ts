import axios from "axios";

export async function textToSpeech(text: string): Promise<Blob | string> {
  const jwtToken = process.env.NEXT_PUBLIC_VOICEGAIN_JWT_1; // Ensure this environment variable contains the JWT token
  const url = "https://api.voicegain.ai/v1/tts";

  const headers = {
    Authorization: `Bearer ${jwtToken}`, // Add JWT token here
    "Content-Type": "application/json",
  };

  const data = {
    text,
    voice: "en-US-Standard-B", // Adjust the voice as per your need
    output_format: "audio/mp3",
  };

  try {
    const response = await axios.post(url, data, {
      headers,
      responseType: "arraybuffer", // Ensure we get binary data
    });

    // Convert ArrayBuffer to Blob for browser compatibility
    const audioBlob = new Blob([response.data], { type: "audio/mp3" });
    return audioBlob;
  } catch (error: any) {
    console.error("Error converting text to speech:", error.message);
    return `Error: ${error.message}`;
  }
}
