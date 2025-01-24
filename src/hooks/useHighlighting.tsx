import { calculateDelay } from "@/utils/helper";
import { useRef, useEffect } from "react";

const useHighlighting = (
  activeHighlightElements: HTMLElement[],
  isHighlighting: boolean,
  setIsHighlighting: React.Dispatch<React.SetStateAction<boolean>>,
  readingSpeed: number
) => {
  const highlightTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentIndexRef = useRef<number>(0); // Track the current index in the array

  // Function to stop highlighting and clean up
  const stopHighlighting = () => {
    // Clear the timeout if it exists
    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
      highlightTimeoutRef.current = null;
    }

    // Remove any existing highlights
    activeHighlightElements.forEach((el) =>
      el.classList.remove("highlighted-text")
    );
    currentIndexRef.current = 0; // Reset the current index only when explicitly stopping
  };

  // Function to handle highlighting of elements
  const handleHighlighting = () => {
    if (!document.getElementById("highlight-styles")) {
      // Add CSS styles for smooth transition
      const style = document.createElement("style");
      style.id = "highlight-styles";
      style.textContent = `
        .highlighted-text {
          background-color: #f5690b;
          color: white;
          border-radius: 3px;
          transition: background-color 0.3s ease-out, color 0.3s ease-out;
        }
      `;
      document.head.appendChild(style);
    }

    const highlightNextElement = () => {
      if (!isHighlighting) {
        // Stop highlighting if isHighlighting is false
        stopHighlighting();
        return;
      }

      // Check if there are more elements to highlight
      if (currentIndexRef.current < activeHighlightElements.length) {
        const element = activeHighlightElements[currentIndexRef.current];

        // Remove highlight from the previous element
        if (currentIndexRef.current > 0) {
          activeHighlightElements[currentIndexRef.current - 1].classList.remove(
            "highlighted-text"
          );
        }

        // Fade in the next highlight
        element.classList.add("highlighted-text");

        // Extract the text content from the element
        const text = element.textContent || "";

        // Calculate the base delay based on text length and reading speed
        const delay = calculateDelay(text, readingSpeed);

        // Store the timeout ID so we can clear it later
        highlightTimeoutRef.current = setTimeout(() => {
          currentIndexRef.current++; // Move to the next element
          highlightNextElement(); // Continue highlighting
        }, delay);
      } else {
        // Stop highlighting when all elements are processed
        setIsHighlighting(false);
      }
    };

    // Stop any existing highlighting loop before starting a new one
    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
      highlightTimeoutRef.current = null;
    }

    if (activeHighlightElements.length > 0 && isHighlighting) {
      highlightNextElement();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopHighlighting();
    };
  }, []);

  // Restart highlighting only when isHighlighting changes
  useEffect(() => {
    if (isHighlighting) {
      handleHighlighting();
    } else {
      stopHighlighting();
    }
  }, [isHighlighting]);

  // Update the current index if activeHighlightElements changes
  useEffect(() => {
    if (currentIndexRef.current >= activeHighlightElements.length) {
      // If the current index is out of bounds, reset it
      currentIndexRef.current = 0;
    }
  }, [activeHighlightElements]);

  return {
    handleHighlighting,
    stopHighlighting,
  };
};

export default useHighlighting;
