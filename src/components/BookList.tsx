import React, { useState, useRef, useEffect } from "react";
import { ChevronRight, Trash2, X } from "lucide-react";
import { BookData } from "@/app/Home";

interface BookListProps {
  books: BookData[];
  currentBookId: string | null;
  onBookSelect: (book: BookData) => void;
  onBookDelete: (bookId: string) => void; // Add delete handler prop
}

const BookList: React.FC<BookListProps> = ({
  books,
  currentBookId,
  onBookSelect,
  onBookDelete,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<BookData | null>(null);
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

  const handleDeleteClick = (e: React.MouseEvent, book: BookData) => {
    e.stopPropagation(); // Prevent triggering the book selection
    setBookToDelete(book);
  };

  const confirmDelete = () => {
    if (bookToDelete) {
      onBookDelete(bookToDelete.id);
      setBookToDelete(null);
    }
  };

  return (
    <>
      {/* Delete Confirmation Modal */}
      {bookToDelete && (
        <div className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center animate-fade-in">
          <div className="bg-dark-background dark:bg-dark-background p-6 sm:p-8 rounded-2xl max-w-md w-full mx-4 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-dark-foreground dark:text-dark-foreground">
                Delete Book
              </h3>
              <button
                onClick={() => setBookToDelete(null)}
                className="text-dark-foreground hover:text-white transition-colors"
              >
                <X size={22} />
              </button>
            </div>
            <p className="text-dark-foreground mb-6">
              Are you sure you want to delete "
              <span className="font-medium">{bookToDelete.fileName}</span>"?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setBookToDelete(null)}
                className="px-4 py-2 rounded-md border border-dark-foreground text-dark-foreground hover:bg-dark-foreground hover:text-dark-background transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

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
          <div className="flex flex-row items-center space-x-2 mt-4 ml-6 mb-2">
            <img src="/images/logo.png" alt="Logo" className="h-6 w-5" />
            <div className="text-xl font-bold font-dancing">
              <span className="text-dark-secondary">AI</span>
              <span className="text-white">Read</span>
            </div>
          </div>
          <div className="p-4 h-full overflow-y-auto">
            <div className="space-y-2">
              {books &&
                books.length > 0 &&
                books.map((book) => (
                  <div
                    key={book.id}
                    onClick={() => {
                      onBookSelect(book);
                      setIsOpen(false);
                    }}
                    className={`p-3 rounded cursor-pointer transition-colors group ${
                      book.id === currentBookId
                        ? "bg-dark-secondary text-white"
                        : "bg-dark-background text-dark-foreground hover:bg-dark-secondary/50"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{book.fileName}</p>
                        <p className="text-sm opacity-75">
                          Page {book.lastPage}
                        </p>
                      </div>
                      <button
                        onClick={(e) => handleDeleteClick(e, book)}
                        className={`opacity-0 group-hover:opacity-100 text-dark-foreground hover:scale-105 transition-opacity ${
                          book.id === currentBookId ? "text-white" : ""
                        }`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
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
