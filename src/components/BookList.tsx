import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Book } from "@/app/page";

interface BookListProps {
  books: Book[];
  currentBookId: string | null;
  onBookSelect: (book: Book) => void;
}

const BookList: React.FC<BookListProps> = ({
  books,
  currentBookId,
  onBookSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;

    const diff = e.touches[0].clientX - startX;
    const panel = panelRef.current;
    if (!panel) return;

    if (isOpen) {
      setCurrentX(Math.min(diff, panel.offsetWidth));
    } else if (!isOpen && e.touches[0].clientX < 50) {
      setCurrentX(Math.max(diff, -panel.offsetWidth));
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    const threshold = 100;

    if (isOpen && currentX > threshold) {
      setIsOpen(false);
    } else if (!isOpen && currentX < -threshold) {
      setIsOpen(true);
    }
    setCurrentX(0);
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    panel.addEventListener("touchstart", handleTouchStart);
    panel.addEventListener("touchmove", handleTouchMove);
    panel.addEventListener("touchend", handleTouchEnd);

    return () => {
      panel.removeEventListener("touchstart", handleTouchStart);
      panel.removeEventListener("touchmove", handleTouchMove);
      panel.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isOpen, isDragging]);

  return (
    <>
      {/* Overlay when panel is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-[998]"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className="fixed top-0 left-0 h-full z-[999]">
        <div
          ref={panelRef}
          style={{
            transform: isDragging
              ? `translateX(${currentX}px)`
              : isOpen
              ? "translateX(0)"
              : "translateX(-100%)",
            width: "300px",
            touchAction: "pan-x",
            position: "absolute",
            left: 0,
            top: 0,
          }}
          className="h-full bg-dark-background shadow-lg transition-transform duration-300 ease-in-out"
        >
          <div className="p-4 h-full overflow-y-auto">
            <div className="space-y-2">
              {books &&
                books.length > 0 &&
                books
                  .slice()
                  .reverse()
                  .map((book) => (
                    <div
                      key={book.id}
                      onClick={() => {
                        onBookSelect(book);
                        setIsOpen(false);
                      }}
                      className={`p-3 rounded cursor-pointer transition-colors ${
                        book.id === currentBookId
                          ? "bg-dark-secondary text-white"
                          : "bg-dark-background text-dark-foreground hover:bg-dark-secondary/50"
                      }`}
                    >
                      <p className="font-medium truncate">{book.fileName}</p>
                      <p className="text-sm opacity-75">Page {book.lastPage}</p>
                    </div>
                  ))}
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            transform: isOpen ? "translateX(300px)" : "translateX(0)",
          }}
          className="absolute left-0 top-1/2 -translate-y-1/2 text-dark-accent bg-dark-background p-2 rounded-r-md shadow-md transition-transform duration-300"
        >
          <ChevronRight
            className={`transition-transform duration-300 ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}
          />
        </button>
      </div>
    </>
  );
};

export default BookList;
