import { useState } from "react";
import { splitTextIntoChunks } from "@/utils/helper";
import VoiceApi from "@/apis/voiceApi";

const useReading = (ttsType: "premium" | "basic", ttsVoice: string) => {
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
  let audioQueue: Blob[] = [];
  const voiceApi = new VoiceApi();

  // Function to read text using the browser's speech synthesis
  const readTextWebSpeechApi = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      const selectedVoice = window.speechSynthesis
        .getVoices()
        .find((voice) => voice.name === ttsVoice);

      utterance.lang = "en-US"; // Default language
      utterance.pitch = 1.1; // Set pitch (range 0 to 2)
      utterance.rate = readingSpeed; // Set rate (range 0.1 to 10)
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onstart = () => {
        setReadingState("reading");
        autoReading.isReading = true;
      };

      utterance.onend = () => {
        if (!autoReading.isActivated) {
          setReadingState("off");
        }
        autoReading.isReading = false;
      };

      // Speak the text
      window.speechSynthesis.speak(utterance);
    } else {
      console.error("Speech synthesis is not supported in this browser.");
    }
  };

  // Function to fetch TTS audio for premium voices
  const fetchPremiumTtsAudio = async (text: string): Promise<Blob> => {
    const voiceId = ttsVoice || "nPczCjzI2devNBz1zQrb"; // Default voice ID
    const audioBuffer = await voiceApi.textToSpeech(text, voiceId);
    return new Blob([audioBuffer], { type: "audio/mpeg" });
  };

  // Function to handle text-to-speech for both premium and basic TTS
  const handleTextToSpeech = async (text: string) => {
    const chunks = splitTextIntoChunks(text, ttsType === "premium" ? 200 : 400); // Split text into chunks
    const remainingCredit = await voiceApi.getValidKeyRemainingCredit();

    if (ttsType === "premium") {
      // TTS API is enabled
      try {
        // Fetch and store audio for the first chunk
        const firstChunk = chunks[0];
        if (firstChunk) {
          if (autoReading.isActivated) {
            const audioBlob = await fetchPremiumTtsAudio(firstChunk);
            audioQueue.push(audioBlob); // Add the first chunk to the queue
            playNextAudio(); // Start playback immediately
            setCurrentTextChunk(firstChunk);
          }
        }

        // Fetch and store audio for the remaining chunks in the background
        for (let i = 1; i < chunks.length; i++) {
          if (autoReading.isActivated) {
            const previousChunk = chunks[i - 1];
            const delayDuration = calculateChunkDuration(previousChunk);
            await delay(delayDuration);

            const chunk = chunks[i];
            try {
              const audioBlob = await fetchPremiumTtsAudio(chunk);
              console.log(`chunk ${i + 1} text`, chunk);

              console.log(`audioBlob for chunk ${i + 1}`, audioBlob);
              audioQueue.push(audioBlob); // Add to the queue

              console.log("delayDuration", delayDuration);
              console.log("audioQueue", audioQueue);
              setCurrentTextChunk(chunk);
            } catch (error) {
              console.error("Error fetching audio for chunk:", chunk, error);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching TTS API audio:", error);
        // Fallback to built-in TTS if TTS API fails
        for (const chunk of chunks) {
          if (!autoReading.isReading) {
            readTextWebSpeechApi(chunk);
            setCurrentTextChunk(chunk);
          }
        }
      }
    } else {
      // TTS API is disabled, use built-in TTS
      for (const chunk of chunks) {
        if (!autoReading.isReading) {
          readTextWebSpeechApi(chunk);
          setCurrentTextChunk(chunk);
        }
      }
    }
  };

  //function to read selected text
  const readSelectedText = async (text: string) => {
    if (ttsType === "premium") {
      const audioBlob = await fetchPremiumTtsAudio(text);
      playAudio(audioBlob);
    } else {
      readTextWebSpeechApi(text);
    }
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

  // Function to stop premium audio playback
  const stopPremiumAudio = () => {
    if (currentPremiumAudio) {
      currentPremiumAudio.pause();
      currentPremiumAudio.currentTime = 0;
      currentPremiumAudio.onended = null; // Remove the onended handler
      setCurrentPremiumAudio(null);
    }
    audioQueue = []; // Clear the audio queue
  };

  // Function to stop reading
  const stopReading = () => {
    stopPremiumAudio();
    window.speechSynthesis.cancel();
    setAutoReading({ isActivated: false, isReading: false });
    autoReading.isActivated = false;
    autoReading.isReading = false;
    setReadingState("off");
  };

  // Helper function to calculate chunk duration
  const calculateChunkDuration = (text: string): number => {
    const length = text.length;
    return length * 38; //value achieved through testing
  };

  // Helper function to delay execution
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  return {
    readingState,
    autoReading,
    currentTextChunk,
    ttsType,
    ttsVoice,
    readingSpeed,
    readSelectedText,
    setReadingSpeed,
    setReadingState,
    setAutoReading,
    readText: readTextWebSpeechApi,
    handleTextToSpeech,
    stopReading,
  };
};

export default useReading;
