import React, { useEffect, useState } from "react";
import { X, Repeat2 } from "lucide-react";

interface MinimalCardProps {
  text: string;
  onClose: () => void;
  viewerRef: React.RefObject<HTMLDivElement>;
}

const MinimalCard: React.FC<MinimalCardProps> = ({
  text,
  onClose,
  viewerRef,
}) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    const handleScroll = () => {
      setIsExiting(true);
      setTimeout(onClose, 300); // Wait for exit animation
    };

    // Add scroll listener to the PDF viewer instead of window
    viewer.addEventListener("scroll", handleScroll);
    return () => {
      viewer.removeEventListener("scroll", handleScroll);
    };
  }, [onClose, viewerRef]);

  const handleCloseClick = () => {
    setIsExiting(true);
    setTimeout(onClose, 300);
  };

  return (
    <div
      className={`
        fixed
        bottom-[72px] // Position above Google's selection toolbar (usually ~60px)
        left-1/2
        -translate-x-1/2
        bg-gradient-to-r
        from-gray-900
        to-gray-800
        text-white
        py-6
        px-8
        shadow-2xl
        rounded-xl
        flex
        items-center
        justify-between
        gap-6
        w-[90%]
        max-w-2xl
        border
        border-gray-700/50
        backdrop-blur-sm
        transition-all
        duration-300
        z-[9999] // Ensure it's above Google's selection toolbar
        ${
          isExiting ? "opacity-0 translate-y-full" : "opacity-100 translate-y-0"
        }
      `}
      style={{
        // Additional styles to ensure it's above system UI
        WebkitTransform: "translate(-50%, 0)",
        transform: "translate(-50%, 0)",
      }}
    >
      <div className="flex items-center gap-4 flex-1">
        <div className="flex-shrink-0">
          <Repeat2 className="w-6 h-6 text-dark-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-medium leading-tight">{text}</p>
        </div>
      </div>
      <button
        onClick={handleCloseClick}
        className="flex-shrink-0 p-2 -m-2 text-gray-400 hover:text-white transition-colors duration-200 rounded-full hover:bg-gray-700/50"
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Progress bar animation */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700/30 overflow-hidden rounded-b-xl">
        <div className="h-full bg-dark-accent animate-progress-shrink" />
      </div>
    </div>
  );
};

// Add this to your global CSS file
const styles = `
@keyframes progress-shrink {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

@keyframes slide-up {
  from {
    transform: translateY(100%) translateX(-50%);
    opacity: 0;
  }
  to {
    transform: translateY(0) translateX(-50%);
    opacity: 1;
  }
}

.animate-progress-shrink {
  animation: progress-shrink 5s linear;
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}
`;

export default MinimalCard;
