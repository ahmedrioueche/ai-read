import { useState, useEffect } from "react";

const useScroll = (
  enableAutoScrolling: boolean,
  readingSpeed: number,
  getVisibleText: () => Promise<{ text: string }>
) => {
  const [scrollIntervalId, setScrollIntervalId] = useState<number | null>(null);
  const [visibleText, setVisibleText] = useState("");

  // Function to calculate the scroll offset dynamically
  const calculateScrollOffset = (
    currentTextLength: number,
    lastTextLength: number,
    lastScrollOffset: number,
    readingSpeed: number
  ): number => {
    const baselineOffset = 22; // Baseline scroll offset
    const minOffset = baselineOffset * readingSpeed; // Minimum scroll offset
    const maxOffset = baselineOffset * 20; // Maximum scroll offset (e.g., 600)

    // Calculate the difference between current and last text length
    const textLengthDifference = lastTextLength - currentTextLength;

    // If text length is above 1000, reset to baseline offset
    if (currentTextLength > 1000) {
      return baselineOffset * readingSpeed;
    }

    // Adjust the scroll offset linearly based on the text length difference
    let scrollOffset = lastScrollOffset;

    if (textLengthDifference > 0) {
      // If text length is decreasing, increase the scroll offset linearly
      const increaseFactor = textLengthDifference / lastTextLength; // Normalized difference
      scrollOffset = lastScrollOffset * (1 + increaseFactor);
    } else if (textLengthDifference < 0) {
      // If text length is increasing, decrease the scroll offset linearly
      const decreaseFactor = -textLengthDifference / lastTextLength; // Normalized difference
      scrollOffset = lastScrollOffset * (1 - decreaseFactor);
    }

    // Ensure the scroll offset stays within reasonable bounds
    scrollOffset = Math.max(minOffset, Math.min(scrollOffset, maxOffset));

    return scrollOffset;
  };

  // Function to start scrolling the PDF
  const scrollPDF = (scrollSpeed: number): number | null => {
    const container = document.querySelector(
      ".rpv-core__inner-pages"
    ) as HTMLElement;
    if (!container) {
      console.log("Scroll container not found");
      return null;
    }

    let lastVisibleTextLength = 0; // Track the length of the last visible text
    let lastScrollOffset = 30 * readingSpeed; // Track the last scroll offset

    const intervalId = window.setInterval(async () => {
      // Check if we've reached the end of the document
      if (
        container.scrollTop + container.clientHeight >=
        container.scrollHeight
      ) {
        clearInterval(intervalId);
        console.log("Reached the end of the document");
        return;
      }

      // Get the currently visible text using the existing getVisibleText function
      const { text: visibleText } = await getVisibleText();
      setVisibleText(visibleText);

      // Calculate the scroll offset based on visible text length
      const currentVisibleTextLength = visibleText.length;

      // Calculate the scroll offset dynamically
      const scrollOffset = calculateScrollOffset(
        currentVisibleTextLength,
        lastVisibleTextLength,
        lastScrollOffset,
        readingSpeed
      );

      // Update the last visible text length and scroll offset
      lastVisibleTextLength = currentVisibleTextLength;
      lastScrollOffset = scrollOffset;

      // Scroll downward with the calculated offset
      container.scrollBy({
        top: scrollOffset,
        behavior: "smooth",
      });
    }, scrollSpeed);

    return intervalId;
  };

  // Function to start scrolling
  const startScrolling = (scrollSpeed: number) => {
    if (enableAutoScrolling) {
      const intervalId = scrollPDF(scrollSpeed);
      if (intervalId) {
        setScrollIntervalId(intervalId);
      }
    }
  };

  // Function to stop scrolling
  const stopScrolling = () => {
    if (scrollIntervalId) {
      clearInterval(scrollIntervalId);
      setScrollIntervalId(null);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScrolling();
    };
  }, []);

  return {
    visibleText,
    startScrolling,
    stopScrolling,
  };
};

export default useScroll;
