"use client";
import { AiApi } from "@/apis/aiApi";
import {
  Bot,
  Loader2,
  MessageCircle,
  Mic,
  Send,
  Square,
  X,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

interface Message {
  id: string;
  role: "user" | "model";
  content: string;
  isTyping?: boolean;
}

interface AiChatProps {
  isOpen: boolean;
  onClose: () => void;
  bookContext: string | null;
  currentPage: number;
  getPageText: (page: number) => Promise<string>;
  isDarkMode: boolean;
  language: string;
}

const AiChat: React.FC<AiChatProps> = ({
  isOpen,
  onClose,
  bookContext,
  currentPage,
  getPageText,
  isDarkMode,
  language,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isStartingMic, setIsStartingMic] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const isMountedRef = useRef(true);
  const aiApi = new AiApi();

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleClearChat = () => {
    setMessages([]);
  };

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Scroll to bottom when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => scrollToBottom("auto"), 100);
    }
  }, [isOpen]);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [input]);

  const startRecording = async () => {
    try {
      setIsStartingMic(true);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: "audio/webm" });
        setIsRecording(false);
        setIsTranscribing(true);
        try {
          const text = await aiApi.transcribeAudio(audioBlob);
          if (text) {
            setInput((prev) => (prev ? `${prev} ${text}` : text));
          }
        } catch (error) {
          console.error("Transcription failed:", error);
        } finally {
          setIsTranscribing(false);
        }
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setTimeout(() => {
        setIsStartingMic(false);
        setIsRecording(true);
      }, 500); // Brief loading effect as requested
    } catch (err) {
      console.error("Failed to start recording:", err);
      setIsStartingMic(false);
      alert("Please allow microphone access to use voice chat.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: "user", content: userMessage },
    ]);
    setIsLoading(true);
    // Force scroll to bottom for new user message
    setTimeout(() => scrollToBottom("smooth"), 0);

    try {
      if (!isMountedRef.current) return;
      const [prevPage, currPage, nextPage] = await Promise.all([
        getPageText(currentPage - 1),
        getPageText(currentPage),
        getPageText(currentPage + 1),
      ]);

      const dynamicContext = `
        PAGE ${currentPage - 1}: ${prevPage}
        PAGE ${currentPage}: ${currPage}
        PAGE ${currentPage + 1}: ${nextPage}
      `.trim();

      // Optimize history: Take last 10 messages and truncate long contents
      const MAX_HISTORY_MESSAGES = 10;
      const MAX_MESSAGE_LENGTH = 1500;

      const optimizedHistory = messages
        .slice(-MAX_HISTORY_MESSAGES)
        .map((m) => {
          let content = m.content;
          if (content.length > MAX_MESSAGE_LENGTH) {
            content =
              content.substring(0, MAX_MESSAGE_LENGTH) +
              "... [truncated for context]";
          }
          return {
            role: m.role === "user" ? ("user" as const) : ("model" as const),
            parts: [{ text: content }],
          };
        });

      const response = await aiApi.chatWithBook(
        userMessage,
        optimizedHistory,
        bookContext || "",
        dynamicContext,
        currentPage,
        language,
      );

      setIsLoading(false);

      if (response && isMountedRef.current) {
        // Create an initial empty model message with a stable ID
        const aiMessageId = (Date.now() + 1).toString();
        setMessages((prev) => [
          ...prev,
          { id: aiMessageId, role: "model", content: "", isTyping: true },
        ]);

        // Type out the message
        let currentText = "";
        const words = response.split(" ");
        for (let i = 0; i < words.length; i++) {
          if (!isMountedRef.current) break;
          
          // Check if user is at the bottom before updating content
          const container = scrollContainerRef.current;
          const isAtBottom = container 
            ? container.scrollHeight - container.scrollTop <= container.clientHeight + 100 
            : true;

          currentText += (i === 0 ? "" : " ") + words[i];
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiMessageId ? { ...m, content: currentText } : m,
            ),
          );

          if (isAtBottom) {
            scrollToBottom("auto");
          }

          await new Promise((resolve) =>
            setTimeout(resolve, 30 + Math.random() * 20),
          );
        }

        // Finalize typing state
        if (isMountedRef.current) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiMessageId ? { ...m, isTyping: false } : m,
            ),
          );
        }
      }
    } catch (error: any) {
      if (!isMountedRef.current) return;
      setIsLoading(false);
      console.error("Chat error:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "An error occurred. Please try again.";
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "model",
          content: errorMessage,
        },
      ]);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className={`fixed z-[100] ai-chat-container flex flex-col transition-all duration-300 border ${
          isDarkMode
            ? "bg-dark-background border-dark-secondary/50 filter invert hue-rotate-180"
            : "bg-white border-gray-200"
        } backdrop-blur-xl shadow-orange-500/10 shadow-2xl overflow-hidden
      /* Mobile: Smart Scaling Card - 90% width for tablet/flipped views */
      bottom-6 left-1/2 -translate-x-1/2 w-[90%] h-auto max-h-[90dvh] max-w-[600px] rounded-3xl
      /* Desktop: Fixed right-docking */
      md:top-auto md:left-auto md:right-4 md:bottom-24 md:translate-x-0 md:w-[400px] md:h-[600px] md:rounded-2xl
      `}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-4 py-2 border-b ${
            isDarkMode
              ? "border-dark-secondary/20 bg-dark-background"
              : "border-gray-100 bg-gray-50/50"
          }`}
        >
          <div className="flex items-center space-x-2">
            <div
              className={`p-2 rounded-lg ${isDarkMode ? "bg-dark-secondary/10 text-dark-secondary" : "bg-light-secondary/10 text-light-secondary"}`}
            >
              <Bot size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">AI Reading Guide</h3>
              <div className="flex items-center space-x-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">
                  Online
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={handleClearChat}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode ? "hover:bg-white/5 text-gray-400" : "hover:bg-gray-100 text-gray-400"
              }`}
              title="Clear Chat"
            >
              <Square size={16} />
            </button>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode ? "hover:bg-white/5 text-gray-400" : "hover:bg-gray-100 text-gray-400"
              }`}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Messages Window */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0"
          id="chat-messages"
        >
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <MessageCircle
                size={48}
                className={`mb-4 ${isDarkMode ? "text-dark-secondary/20" : "text-light-secondary/20"}`}
              />
              <p
                className={`text-sm ${isDarkMode ? "text-dark-foreground/60" : "text-gray-500"}`}
              >
                I can help you understand this book, summarize sections, or
                answer specific questions about the content.
              </p>
            </div>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[96%] md:max-w-[85%] p-3 rounded-2xl text-sm ${
                  m.role === "user"
                    ? isDarkMode
                      ? "bg-dark-secondary text-white rounded-tr-none shadow-lg shadow-orange-500/20"
                      : "bg-light-secondary text-white rounded-tr-none shadow-lg shadow-orange-500/20"
                    : isDarkMode
                      ? "bg-dark-secondary/10 text-dark-foreground rounded-tl-none"
                      : "bg-gray-100 text-gray-800 rounded-tl-none"
                }`}
              >
                <div className="flex items-start space-x-2">
                  {m.role === "model" &&
                    (m.isTyping ? (
                      <div className="flex items-center justify-center w-4 h-4 mt-1 relative flex-shrink-0">
                        <div
                          className={`absolute inset-0 rounded-full animate-ping opacity-40 ${isDarkMode ? "bg-dark-secondary" : "bg-light-secondary"}`}
                        />
                        <div
                          className={`relative w-1.5 h-1.5 rounded-full ${isDarkMode ? "bg-dark-secondary" : "bg-light-secondary"}`}
                        />
                      </div>
                    ) : (
                      <Bot size={14} className="mt-1 flex-shrink-0" />
                    ))}
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {m.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div
                className={`p-3 rounded-2xl rounded-tl-none text-sm ${
                  isDarkMode ? "bg-dark-secondary/10" : "bg-gray-100"
                }`}
              >
                <div className="flex items-center justify-center w-5 h-5 relative">
                  <div
                    className={`absolute inset-0 rounded-full animate-beaming ${isDarkMode ? "bg-dark-secondary" : "bg-light-secondary"}`}
                  />
                  <div
                    className={`relative w-2.5 h-2.5 rounded-full animate-chatgpt-beat ${isDarkMode ? "bg-dark-secondary" : "bg-light-secondary"}`}
                  />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form
          onSubmit={handleSend}
          className={`px-4 py-3 border-t ${
            isDarkMode ? "border-dark-secondary/20" : "border-gray-100"
          }`}
        >
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask about the book..."
                disabled={isRecording || isTranscribing}
                className={`scrollbar-hide w-full p-3 pr-10 rounded-xl text-sm outline-none transition-all border block resize-none min-h-[46px] overflow-y-auto ${
                  isDarkMode
                    ? "bg-dark-background border-dark-secondary/30 focus:border-dark-secondary text-dark-foreground"
                    : "bg-gray-50 border-gray-200 focus:bg-white focus:border-light-secondary text-gray-800"
                } ${isRecording ? "border-red-400 outline-none ring-2 ring-red-400/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]" : ""}`}
              />
              <button
                type="submit"
                disabled={
                  !input.trim() || isLoading || isRecording || isTranscribing
                }
                className={`absolute right-2 bottom-2.5 p-2 rounded-lg transition-all ${
                  input.trim() && !isLoading && !isRecording && !isTranscribing
                    ? isDarkMode
                      ? "bg-dark-secondary text-white hover:opacity-90"
                      : "bg-light-secondary text-white hover:opacity-90"
                    : "text-gray-400 cursor-not-allowed"
                }`}
              >
                <Send size={16} />
              </button>
            </div>

            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isLoading || isTranscribing || isStartingMic}
              className={`p-3 rounded-xl transition-all shadow-lg flex items-center justify-center self-end min-h-[46px] ${
                isRecording
                  ? "bg-red-500 text-white"
                  : isDarkMode
                    ? "bg-dark-secondary/10 text-dark-secondary hover:bg-dark-secondary/20"
                    : "bg-light-secondary/10 text-light-secondary hover:bg-light-secondary/20"
              } ${isTranscribing || isStartingMic ? "cursor-not-allowed opacity-80" : ""}`}
            >
              {isStartingMic || isTranscribing ? (
                <Loader2 size={20} className="animate-spin" />
              ) : isRecording ? (
                <Square size={20} fill="currentColor" />
              ) : (
                <Mic size={20} />
              )}
            </button>
          </div>
        </form>

        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
          @keyframes scan {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(100%);
            }
          }
          .animate-scan {
            animation: scan 1.5s ease-in-out infinite;
          }
          @keyframes chatgpt-beat {
            0%,
            100% {
              transform: scale(0.85);
              opacity: 0.6;
            }
            50% {
              transform: scale(1.15);
              opacity: 1;
            }
          }
          .animate-chatgpt-beat {
            animation: chatgpt-beat 1.5s ease-in-out infinite;
          }
          @keyframes beaming {
            0% {
              transform: scale(0.8);
              opacity: 0.8;
              box-shadow: 0 0 0 0 rgba(255, 107, 0, 0.4);
            }
            50% {
              transform: scale(1.2);
              opacity: 0.2;
              box-shadow: 0 0 0 15px rgba(255, 107, 0, 0);
            }
            100% {
              transform: scale(0.8);
              opacity: 0;
              box-shadow: 0 0 0 0 rgba(255, 107, 0, 0);
            }
          }
          .animate-beaming {
            animation: beaming 2s cubic-bezier(0, 0, 0.2, 1) infinite;
          }
        `}</style>
      </div>
    </>
  );
};

export default AiChat;
