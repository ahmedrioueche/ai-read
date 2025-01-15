import { useRef, useEffect } from "react";

const useHighlighting = (
  isHighlighting: boolean,
  setIsHighlighting: React.Dispatch<React.SetStateAction<boolean>>,
  activeHighlightElements: HTMLElement[],
  readingSpeed: number
) => {
  const highlightTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Function to handle highlighting of elements
  const handleHighlighting = (elements: HTMLElement[]) => {
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

    let currentIndex = 0;

    const highlightNextElement = () => {
      if (!isHighlighting) {
        // Stop highlighting if isHighlighting is false
        return;
      }

      if (currentIndex > 0) {
        // Fade out the previous highlight
        elements[currentIndex - 1].classList.remove("highlighted-text");
      }

      if (currentIndex < elements.length) {
        // Fade in the next highlight
        elements[currentIndex].classList.add("highlighted-text");
        currentIndex++;

        // Adjust the delay based on the length of the text
        const textLength = elements[currentIndex - 1].textContent?.length || 0;
        const delay = Math.max(100, textLength * 66 * readingSpeed);

        // Store the timeout ID so we can clear it later
        highlightTimeoutRef.current = setTimeout(highlightNextElement, delay);
      } else {
        // Stop highlighting when all elements are processed
        setIsHighlighting(false);
      }
    };

    if (elements.length > 0 && isHighlighting) {
      highlightNextElement();
    } else {
      setIsHighlighting(false);
    }
  };

  // Function to stop highlighting
  const stopHighlighting = () => {
    setIsHighlighting(false);

    // Clear the timeout if it exists
    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
      highlightTimeoutRef.current = null;
    }

    // Remove any existing highlights
    const elements = Array.from(
      document.querySelectorAll(".rpv-core__text-layer-text")
    ) as HTMLElement[];
    elements.forEach((el) => el.classList.remove("highlighted-text"));
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopHighlighting();
    };
  }, []);

  return {
    isHighlighting,
    activeHighlightElements,
    setIsHighlighting,
    handleHighlighting,
    stopHighlighting,
  };
};

export default useHighlighting;
