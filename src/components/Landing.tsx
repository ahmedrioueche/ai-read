import React, { useState } from "react";
import { Search } from "lucide-react";

// Types
interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  rating: number;
  category: string;
}

interface LandingProps {
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

// Sample data
const sampleBooks: Book[] = [
  {
    id: "1",
    title: "The Midnight Library",
    author: "Matt Haig",
    cover: "/api/placeholder/200/300",
    rating: 4.5,
    category: "Fiction",
  },
  {
    id: "2",
    title: "Atomic Habits",
    author: "James Clear",
    cover: "/api/placeholder/200/300",
    rating: 4.8,
    category: "Self-Help",
  },
  {
    id: "3",
    title: "Project Hail Mary",
    author: "Andy Weir",
    cover: "/api/placeholder/200/300",
    rating: 4.7,
    category: "Science Fiction",
  },
];

// Book Card Component
const BookCard = ({ book }: { book: Book }) => {
  return (
    <div className="bg-dark-background border border-dark-primary rounded-lg overflow-hidden shadow-lg transition-transform duration-300 hover:scale-105">
      <img
        src={book.cover}
        alt={book.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-dark-foreground font-semibold text-lg mb-1">
          {book.title}
        </h3>
        <p className="text-dark-foreground/70 text-sm mb-2">{book.author}</p>
        <div className="flex items-center justify-between">
          <span className="text-dark-secondary text-sm">★ {book.rating}</span>
          <span className="text-dark-foreground/50 text-xs">
            {book.category}
          </span>
        </div>
      </div>
    </div>
  );
};

// Search Bar Component
const SearchBar = () => {
  return (
    <div className="relative w-full max-w-xl mb-8">
      <input
        type="text"
        placeholder="Search for books..."
        className="w-full px-4 py-2 pl-10 bg-dark-background border border-dark-primary rounded-lg text-dark-foreground focus:outline-none focus:ring-2 focus:ring-dark-secondary"
      />
      <Search
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-foreground/50"
        size={20}
      />
    </div>
  );
};

// Main Landing Component
const Landing: React.FC<LandingProps> = ({ onFileChange }) => {
  const [activeTab, setActiveTab] = useState<"recommended" | "trending">(
    "recommended"
  );

  return (
    <div className="min-h-screen bg-dark-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-dancing text-dark-foreground mb-4">
            Welcome to <span className="text-dark-secondary">AI</span>Read
          </h1>
          <p className="text-dark-foreground/70 text-lg mb-8">
            Discover, upload, and explore books with AI-powered recommendations
          </p>

          {/* Upload Button */}
          <label
            htmlFor="file-upload"
            className="inline-block px-6 py-3 bg-dark-primary hover:bg-dark-secondary text-dark-foreground rounded-lg transition-colors duration-300 cursor-pointer font-semibold mb-12"
          >
            Upload Your PDF
          </label>
          <input
            id="file-upload"
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={onFileChange}
          />
        </div>

        {/* Search Section */}
        <SearchBar />

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab("recommended")}
            className={`px-4 py-2 rounded-lg transition-colors duration-300 ${
              activeTab === "recommended"
                ? "bg-dark-secondary text-dark-foreground"
                : "text-dark-foreground/70 hover:text-dark-foreground"
            }`}
          >
            Recommended for You
          </button>
          <button
            onClick={() => setActiveTab("trending")}
            className={`px-4 py-2 rounded-lg transition-colors duration-300 ${
              activeTab === "trending"
                ? "bg-dark-secondary text-dark-foreground"
                : "text-dark-foreground/70 hover:text-dark-foreground"
            }`}
          >
            Trending Books
          </button>
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Landing;
