"use client";

import React, { useEffect, useState } from "react";
import Main from "../components/Main";
import Landing from "@/components/Landing";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  saveBookToIndexedDB,
  getBooksFromIndexedDB,
  deleteOldestBookFromIndexedDB,
} from "@/utils/indexedDb";

export interface Book {
  id: string; // Unique identifier for IndexedDB
  fileName: string;
  fileUrl: string;
  lastPage: number;
}

const Home: React.FC = () => {
  const [pdfFileUrl, setPdfFileUrl] = useState<string | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [isSettingsModalOpen, setIsSettingModalOpen] = useState(false);
  const [currentBookId, setCurrentBookId] = useState<string | null>(null); // Track the currently opened book
  const language = "en";

  // Fallback mechanism for storing the latest book in localStorage
  const saveToLocalStorage = (book: Book) => {
    try {
      localStorage.setItem("latestBook", JSON.stringify(book));
    } catch (e) {
      console.error("Failed to save to localStorage:", e);
    }
  };

  const loadFromLocalStorage = (): Book | null => {
    try {
      const storedBook = localStorage.getItem("latestBook");
      return storedBook ? JSON.parse(storedBook) : null;
    } catch (e) {
      console.error("Failed to load from localStorage:", e);
      return null;
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onloadend = async () => {
        const fileUrl = reader.result as string;
        const fileName = file.name;

        // Check if the book already exists
        const existingBook = books.find((book) => book.fileName === fileName);

        if (existingBook) {
          // Open the existing book
          setPdfFileUrl(existingBook.fileUrl);
          setCurrentBookId(existingBook.id);
        } else {
          // Add a new book with default lastPage = 1
          const newBook: Book = {
            id: `${Date.now()}`, // Generate unique ID for the book
            fileName,
            fileUrl,
            lastPage: 1, // New book starts at the first page
          };

          // Add the book to the IndexedDB and handle the 5-book limit
          const updatedBooks = [...books, newBook];
          if (updatedBooks.length > 5) {
            try {
              await deleteOldestBookFromIndexedDB();
              updatedBooks.shift();
            } catch (err) {
              console.error("Failed to delete the oldest book:", err);
            }
          }

          setBooks(updatedBooks);

          // Save to IndexedDB or fallback to localStorage
          try {
            await saveBookToIndexedDB(newBook);
          } catch (err) {
            console.error(
              "IndexedDB failed. Saving to localStorage instead.",
              err
            );
            saveToLocalStorage(newBook);
          }

          setPdfFileUrl(fileUrl);
          setCurrentBookId(newBook.id);
        }
      };

      reader.onerror = () => {
        console.error("FileReader encountered an error.");
      };

      reader.readAsDataURL(file);
    }
  };

  const updateLastPage = async (id: string, lastPage: number) => {
    const updatedBooks = books.map((book) =>
      book.id === id ? { ...book, lastPage } : book
    );

    const updatedBook = updatedBooks.find((book) => book.id === id);
    if (updatedBook) {
      try {
        await saveBookToIndexedDB(updatedBook);
      } catch (err) {
        console.error("IndexedDB failed. Updating localStorage instead.", err);
        saveToLocalStorage(updatedBook);
      }
    }

    setBooks(updatedBooks);
  };

  useEffect(() => {
    const loadBooksFromDB = async () => {
      try {
        const savedBooks = await getBooksFromIndexedDB();
        setBooks(savedBooks);

        // Open the last accessed book, or start fresh
        if (savedBooks.length > 0) {
          const lastOpenedBook = savedBooks[savedBooks.length - 1];
          setPdfFileUrl(lastOpenedBook.fileUrl);
          setCurrentBookId(lastOpenedBook.id);
        }
      } catch (err) {
        console.error(
          "IndexedDB failed. Loading from localStorage instead.",
          err
        );

        // Fallback to localStorage
        const lastBook = loadFromLocalStorage();
        if (lastBook) {
          setBooks([lastBook]);
          setPdfFileUrl(lastBook.fileUrl);
          setCurrentBookId(lastBook.id);
        }
      }
    };

    loadBooksFromDB();
  }, []);

  useEffect(() => {
    let settingsData = JSON.parse(localStorage.getItem("settings") || "{}");
    if (
      !settingsData.languageData ||
      !settingsData.translation ||
      !settingsData.reading ||
      !settingsData.readingSpeed
    ) {
      settingsData = {
        languageData: { language: "english", rtl: false },
        translation: true,
        reading: true,
        readingSpeed: "normal",
      };

      // Save the default settings to localStorage
      localStorage.setItem("settings", JSON.stringify(settingsData));
    }
  }, []);

  const currentBook = books.find((book) => book.id === currentBookId);

  return (
    <div className="flex flex-col min-h-screen bg-dark-background">
      {/* Navbar */}
      <Navbar
        onUpload={handleFileChange}
        onToggleSettingsModal={(isOpen) => setIsSettingModalOpen(isOpen)}
      />
      {/* Main Content */}
      <div
        className={`flex flex-col items-center z-10 ${
          !pdfFileUrl ? "-mt-10" : ""
        }`}
      >
        {!pdfFileUrl ? (
          <Landing onFileChange={handleFileChange} />
        ) : (
          currentBook && (
            <Main
              book={currentBook}
              onLastPageChange={(lastPage: number) => {
                updateLastPage(currentBook.id, lastPage);
              }}
              isSettingsModalOpen={isSettingsModalOpen}
            />
          )
        )}
      </div>
      {!currentBook && <Footer />}
    </div>
  );
};

export default Home;
