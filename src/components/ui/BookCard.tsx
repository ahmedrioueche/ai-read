import React from "react";
import { Book } from "@/utils/types";

interface BookCardProps {
  book: Book;
  onOpen: (fileUrl: string) => void;
}

const BookCard: React.FC<BookCardProps> = ({ book, onOpen }) => {
  return (
    <div className="bg-dark-surface p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
      <img
        src={book.coverUrl}
        alt={book.title}
        className="w-full h-48 object-cover rounded-t-lg"
      />
      <div className="p-4">
        <h3 className="text-xl font-semibold text-dark-foreground">
          {book.title}
        </h3>
        <p className="text-sm text-dark-muted">{book.author}</p>
        <p className="text-sm text-dark-foreground mt-2">{book.description}</p>
        <button
          onClick={() => onOpen(book.fileUrl)}
          className="mt-4 w-full py-2 bg-dark-primary hover:bg-dark-secondary text-dark-foreground font-semibold rounded-lg transition-colors duration-300"
        >
          Open Book
        </button>
      </div>
    </div>
  );
};

export default BookCard;
