import MinimalCard from "@/components/ui/MinimalCard";
import OptionsMenu from "@/components/ui/OptionsMenu";
import TextCard from "@/components/ui/TextCard";
import { ReadingState } from "@/utils/types";
import React from "react";

interface ReaderOverlaysProps {
  selectedText: string | null;
  savedSelectedText: string;
  getExplanation: (text: string) => Promise<void>;
  getSummary: (text: string) => Promise<void>;
  startReading: () => Promise<void>;
  handleStopReading: () => void;
  readingState: ReadingState;
  isDarkMode: boolean;
  isFullScreen: boolean;
  translation: string | null;
  setTranslation: (val: string | null) => void;
  explanation: string | null;
  setExplanation: (val: string | null) => void;
  summary: string | null;
  setSummary: (val: string | null) => void;
  isSummarizing: boolean;
  isExplaining: boolean;
  translationLanguageData: any;
  viewerRef: React.RefObject<any>;
  setIsHoveredOver: (hovered: boolean) => void;
  handleChatClick: () => void;
}

const ReaderOverlays: React.FC<ReaderOverlaysProps> = ({
  selectedText,
  savedSelectedText,
  getExplanation,
  getSummary,
  startReading,
  handleStopReading,
  readingState,
  isDarkMode,
  isFullScreen,
  translation,
  setTranslation,
  explanation,
  setExplanation,
  summary,
  setSummary,
  isSummarizing,
  isExplaining,
  translationLanguageData,
  viewerRef,
  setIsHoveredOver,
  handleChatClick,
}) => {
  const shouldRenderMinimalCard = (text: string) => {
    return text && text?.trim()?.split(" ")?.length < 20;
  };

  const activeText = selectedText || savedSelectedText;

  return (
    <>
      <OptionsMenu
        selectedText={activeText}
        getExplanation={() => getExplanation(activeText)}
        getSummary={() => getSummary(activeText)}
        startReading={startReading}
        stopReading={handleStopReading}
        readingState={readingState}
        isDarkMode={isDarkMode}
        isFullScreen={isFullScreen}
        isSummarizing={isSummarizing}
        isExplaining={isExplaining}
        handleChatClick={handleChatClick}
      />

      {translation &&
        (shouldRenderMinimalCard(selectedText!) ||
        shouldRenderMinimalCard(savedSelectedText) ? (
          <div className="flex justify-center items-center fixed bottom-0 left-1/2 transform -translate-x-1/2 md:w-[80%] w-full z-50">
            <MinimalCard
              text={translation}
              onClose={() => setTranslation(null)}
              viewerRef={viewerRef}
              isDarkMode={isDarkMode}
            />
          </div>
        ) : (
          <div
            className="flex justify-center items-end w-full h-full"
            onMouseEnter={() => setIsHoveredOver(true)}
            onMouseLeave={() => setIsHoveredOver(false)}
          >
            <TextCard
              text={translation}
              type="translation"
              languageData={translationLanguageData}
              onClose={() => setTranslation(null)}
              isDarkMode={isDarkMode}
            />
          </div>
        ))}

      {explanation && (
        <div
          className="flex justify-center items-end w-full h-full"
          onMouseEnter={() => setIsHoveredOver(true)}
          onMouseLeave={() => setIsHoveredOver(false)}
        >
          <TextCard
            text={explanation}
            type="explanation"
            languageData={translationLanguageData}
            onClose={() => setExplanation(null)}
            isDarkMode={isDarkMode}
          />
        </div>
      )}

      {summary && (
        <div
          className="flex justify-center items-end w-full h-full"
          onMouseEnter={() => setIsHoveredOver(true)}
          onMouseLeave={() => setIsHoveredOver(false)}
        >
          <TextCard
            text={summary}
            type="summary"
            languageData={translationLanguageData}
            onClose={() => setSummary(null)}
            isDarkMode={isDarkMode}
          />
        </div>
      )}
    </>
  );
};

export default ReaderOverlays;
