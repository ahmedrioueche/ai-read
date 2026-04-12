import { useState, useRef } from "react";
import { formatLanguageToLocalCode } from "@/utils/helper";
import VoiceApi from "@/apis/voiceApi";
import { useSettings } from "@/context/SettingsContext";
import { ReadingState } from "@/utils/types";

const useReading = () => {
  const [readingState, setReadingState] = useState<ReadingState>("off");
  const [autoReading, setAutoReading] = useState({
    isActivated: false,
    isReading: false,
  });
  const [readingSpeed, setReadingSpeed] = useState<number>(0.9);


  const currentAudio = useRef<HTMLAudioElement | null>(null);
  const voiceApi = new VoiceApi();
  //const voiceApi2 = new VoiceApi2();

  const { settings } = useSettings();
  const { ttsType, ttsVoice, bookLanguage } = settings;

  // Unified audio playback handler
  const playAudio = (audioBlob: Blob, onEnd?: () => void) => {
    // Clean up previous audio if exists
    if (currentAudio.current) {
      currentAudio.current.pause();
      currentAudio.current = null;
    }

    const audio = new Audio(URL.createObjectURL(audioBlob));
    currentAudio.current = audio;

    audio.onended = () => {
      if (audio.src && typeof audio.src === "string" && audio.src.includes("blob:")) {
        URL.revokeObjectURL(audio.src);
      }
      onEnd?.();
    };

    audio.onerror = (error) => {
      console.error("Audio playback error:", error);
      onEnd?.();
    };

    audio.play().catch((error) => {
      console.error("Playback failed to start:", error);
      onEnd?.();
    });

    return audio;
  };



  const handleTextToSpeech = async (text: string): Promise<void> => {
    return new Promise(async (resolve) => {
      try {
        if (ttsType === "premium") {
          const audioBlob = await fetchTtsAudio(text);
          playAudio(audioBlob, resolve);
          setReadingState("reading");
        } else {
          readTextWebSpeechApi(text, resolve);
          setReadingState("reading");
        }
      } catch (error) {
        console.error("TTS Error:", error);
        readTextWebSpeechApi(text, resolve); // Fallback
        setReadingState("reading");
      }
    });
  };

  const readTextWebSpeechApi = (text: string, resolve: () => void) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      const selectedVoice = window.speechSynthesis
        .getVoices()
        .find((voice) => voice.name === ttsVoice.value);

      utterance.lang = formatLanguageToLocalCode(bookLanguage);
      utterance.pitch = 1.1;
      utterance.rate = readingSpeed;
      if (selectedVoice) utterance.voice = selectedVoice;

      utterance.onend = () => {
        if (!autoReading.isActivated) setReadingState("off");
        setAutoReading((prev) => ({ ...prev, isReading: false }));
        resolve();
      };

      utterance.onerror = () => resolve();
      window.speechSynthesis.speak(utterance);
    } else {
      console.error("Speech synthesis not supported");
      resolve();
    }
  };

  const fetchTtsAudio = async (text: string): Promise<Blob> => {
    try {
      const voiceId = ttsVoice.value || "nPczCjzI2devNBz1zQrb";
      const audioBuffer = await voiceApi.textToSpeech(text, voiceId);

      if (!audioBuffer?.byteLength) {
        throw new Error("Empty audio buffer");
      }

      return new Blob([audioBuffer], { type: "audio/mpeg" });
    } catch (error) {
      console.error("TTS fetch error:", error);
      throw error;
    }
  };

  const stopReading = () => {
    // Stop audio playback and clean up
    if (currentAudio.current) {
      const audioToClean = currentAudio.current;
      const currentSrc = audioToClean.src;
      
      if (typeof currentSrc === "string" && currentSrc.includes("blob:")) {
        URL.revokeObjectURL(currentSrc);
      }
      
      audioToClean.pause();
      audioToClean.currentTime = 0;
      audioToClean.src = "";
      audioToClean.removeAttribute("src");
      currentAudio.current = null;
    }


    // Cancel speech synthesis and flush the queue
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      // Force reset on Chrome (which sometimes keeps internal state)
      const utterance = new SpeechSynthesisUtterance("");
      window.speechSynthesis.speak(utterance);
      window.speechSynthesis.cancel();
    }

    // Reset state
    setReadingState("off");
    setAutoReading({ isActivated: false, isReading: false });
  };

  const readText = (text: string) => {
    handleTextToSpeech(text);
  };

  return {
    readingState,
    autoReading,
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
