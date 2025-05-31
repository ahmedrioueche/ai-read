import { useState } from "react";
import {
  delay,
  formatLanguageToLocalCode,
  splitTextIntoChunks,
} from "@/utils/helper";
import VoiceApi, { VoiceApi2 } from "@/apis/voiceApi";
import { useSettings } from "@/context/SettingsContext";

const useReading = () => {
  const [readingState, setReadingState] = useState<
    "loading" | "reading" | "off"
  >("off");
  const [autoReading, setAutoReading] = useState<{
    isActivated: boolean;
    isReading: boolean;
  }>({
    isActivated: false,
    isReading: false,
  });
  const [currentTextChunk, setCurrentTextChunk] = useState("");
  const [currentPremiumAudio, setCurrentPremiumAudio] =
    useState<HTMLAudioElement | null>(null);
  const [readingSpeed, setReadingSpeed] = useState<number>(0.9);
  let audioQueue: Blob[] = []; // Queue for premium TTS audio chunks
  const voiceApi = new VoiceApi();
  const voiceApi2 = new VoiceApi2();

  const { settings } = useSettings();
  const ttsType = settings.ttsType;
  const ttsVoice = settings.ttsVoice;
  const bookLanguage = settings.bookLanguage;

  // Function to read text using the browser's speech synthesis
  const readTextWebSpeechApi = (text: string, resolve: () => void) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      const selectedVoice = window.speechSynthesis
        .getVoices()
        .find((voice) => voice.name === ttsVoice.value);

      const lang = formatLanguageToLocalCode(bookLanguage);
      utterance.lang = lang;
      utterance.pitch = 1.1; // Set pitch (range 0 to 2)
      utterance.rate = readingSpeed; // Set rate (range 0.1 to 10)
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onend = () => {
        if (!autoReading.isActivated) {
          setReadingState("off");
        }
        autoReading.isReading = false;
        resolve();
      };

      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event);
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    } else {
      console.error("Speech synthesis not supported");
      resolve();
    }
  };

  //Function to fetch TTS audio for premium voices
  const fetchTtsAudio = async (text: string): Promise<Blob> => {
    try {
      const voiceId = ttsVoice.value || "nPczCjzI2devNBz1zQrb";
      const audioBuffer = await voiceApi.textToSpeech(text, voiceId);

      // Validate the buffer
      if (!audioBuffer || audioBuffer.byteLength === 0) {
        throw new Error("Empty audio buffer received");
      }

      return new Blob([audioBuffer], { type: "audio/mpeg" });
    } catch (error) {
      console.error("Error in fetchTtsAudio:", error);
      throw new Error("Failed to create audio blob");
    }
  };

  //const fetchTtsAudio = async (text: string): Promise<Blob> => {
  //  const audioBuffer = await voiceApi2.textToSpeech(text, ttsVoice.value);
  //  return new Blob([audioBuffer], { type: "audio/mpeg" });
  //};

  // Function to handle text-to-speech for both premium and basic TTS
  const handleTextToSpeech = async (text: string): Promise<void> => {
    return new Promise(async (resolve) => {
      if (ttsType === "premium") {
        try {
          const audioBlob = await fetchTtsAudio(text);
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);

          audio.play();
          audio.onended = () => {
            URL.revokeObjectURL(audioUrl);
            resolve();
          };
          audio.onerror = (error) => {
            console.error("Audio playback error:", error);
            resolve();
          };
        } catch (error) {
          console.error("Error fetching TTS audio:", error);
          // Fallback to basic TTS
          readTextWebSpeechApi(text, resolve);
        }
      } else {
        readTextWebSpeechApi(text, resolve);
      }
    });
  };

  // Function to read selected text
  const readText = async (text: string) => {
    handleTextToSpeech(text);
  };

  // Function to play audio from the queue
  const playAudio = (audioBlob: Blob) => {
    const audio = new Audio(URL.createObjectURL(audioBlob));
    audio.play();
    setCurrentPremiumAudio(audio);
    audio.onended = () => {
      autoReading.isReading = false; // Update reading state
      playNextAudio(); // Play the next audio in the queue
    };
    autoReading.isReading = true; // Update reading state
  };

  // Function to play the next audio in the queue
  const playNextAudio = () => {
    if (audioQueue.length > 0) {
      if (autoReading.isActivated && !autoReading.isReading) {
        setReadingState("reading");
        const audioBlob = audioQueue.shift(); // Get the next audio from the queue
        if (audioBlob) {
          playAudio(audioBlob);
        }
      }
    } else {
      stopReading();
    }
  };

  // Function to stop reading
  const stopReading = () => {
    // Stop any active premium audio
    if (currentPremiumAudio) {
      currentPremiumAudio.pause();
      currentPremiumAudio.currentTime = 0;
      currentPremiumAudio.onended = null;
      setCurrentPremiumAudio(null);
    }

    // Clear the audio queue
    audioQueue = [];

    // Cancel any speech synthesis
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    // Update state immediately
    autoReading.isActivated = false;
    autoReading.isReading = false;
    setAutoReading({ isActivated: false, isReading: false });
    setReadingState("off");
  };

  return {
    readingState,
    autoReading,
    currentTextChunk,
    ttsType,
    ttsVoice,
    readingSpeed,
    readText,
    setReadingSpeed,
    setReadingState,
    setAutoReading,
    handleTextToSpeech,
    stopReading,
  };
};

export default useReading;
