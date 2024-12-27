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
  const panelRef = useRef<HTMLDivElement>(null);

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
            transform: isOpen ? "translateX(0)" : "translateX(-100%)",
            width: "300px",
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
