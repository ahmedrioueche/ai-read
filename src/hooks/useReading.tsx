import { useState, useRef } from "react";
import { formatLanguageToLocalCode } from "@/utils/helper";
import VoiceApi from "@/apis/voiceApi";
import { useSettings } from "@/context/SettingsContext";

const useReading = () => {
  const [readingState, setReadingState] = useState<
    "loading" | "reading" | "off"
  >("off");
  const [autoReading, setAutoReading] = useState({
    isActivated: false,
    isReading: false,
  });
  const [readingSpeed, setReadingSpeed] = useState<number>(0.9);

  const audioQueue = useRef<Blob[]>([]); // Using ref for queue persistence
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
      URL.revokeObjectURL(audio.src);
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

  // Process next item in queue
  const processQueue = () => {
    if (audioQueue.current.length > 0 && autoReading.isActivated) {
      setReadingState("reading");
      const nextBlob = audioQueue.current.shift();
      if (nextBlob) {
        playAudio(nextBlob, () => {
          if (audioQueue.current.length > 0) {
            processQueue();
          } else {
            stopReading();
          }
        });
      }
    }
  };

  const handleTextToSpeech = async (text: string): Promise<void> => {
    return new Promise(async (resolve) => {
      try {
        if (ttsType === "premium") {
          const audioBlob = await fetchTtsAudio(text);

          if (autoReading.isActivated) {
            // Add to queue for auto-reading flow
            audioQueue.current.push(audioBlob);
            if (!autoReading.isReading) {
              processQueue();
              setReadingState("reading");
            }
          } else {
            // Immediate playback for single utterances
            playAudio(audioBlob, resolve);
            setReadingState("reading");
          }
        } else {
          readTextWebSpeechApi(text, resolve);
        }
      } catch (error) {
        console.error("TTS Error:", error);
        readTextWebSpeechApi(text, resolve); // Fallback
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
      currentAudio.current.pause();
      currentAudio.current.currentTime = 0; // Reset playback position
      currentAudio.current.src = ""; // Clear the audio source
      currentAudio.current.removeAttribute("src"); // Force cleanup
      currentAudio.current = null;
    }

    // Clear queue
    audioQueue.current = [];

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
