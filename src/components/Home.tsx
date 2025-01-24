"use client";

import React, { lazy, Suspense, useEffect, useState } from "react";
import Main from "../components/Main";
import Landing from "@/components/Landing";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  saveBookToIndexedDB,
  getBooksFromIndexedDB,
  deleteOldestBookFromIndexedDB,
} from "@/utils/indexedDb";
import { useAuth } from "@/context/AuthContext";
import { usePlan } from "@/context/PlanContext";
import { useVisitor } from "@/context/VisitorContext";
import { UserApi } from "@/apis/userApi";
import LoadingPage from "./ui/LoadingPage";

const FreeTrialModal = lazy(() => import("./FreeTrialModal"));
const BookList = lazy(() => import("./BookList"));

export interface BookData {
  id: string;
  fileName: string;
  fileUrl: string;
  lastPage: number;
  lastAccessed: number;
}

const Home: React.FC = () => {
  const [pdfFileUrl, setPdfFileUrl] = useState<string | null>(null);
  const [books, setBooks] = useState<BookData[]>([]);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [currentBookId, setCurrentBookId] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const BOOK_LIMIT = 5;
  const { user } = useAuth();
  const userApi = new UserApi();
  const { visitor, initializeVisitor } = useVisitor();
  const {
    init: initPlan,
    isFreeTrialActive,
    isFreeTrialModalOpen,
    setIsFreeTrialModalOpen,
    freeTrialEndDate,
  } = usePlan();

  useEffect(() => {
    initializeVisitor();
  }, []);

  useEffect(() => {
    if (visitor) {
      initPlan(visitor);
    }
  }, [visitor]);

  //update new user's free trial period to visitor's (no new free trial on every account creation on same machine)
  useEffect(() => {
    const updateUser = async () => {
      if (user && user?.email?.trim() !== "" && visitor) {
        // Normalize both dates to UTC
        const userDateUTC = new Date(user.freeTrialStartDate).toISOString();
        const visitorDateUTC = new Date(
          visitor.freeTrialStartDate
        ).toISOString();

        // Compare the normalized UTC dates
        if (userDateUTC !== visitorDateUTC) {
          // Add 1 hour offset to have a correct comparision later
          const adjustedVisitorDate = new Date(visitor.freeTrialStartDate);
          adjustedVisitorDate.setHours(adjustedVisitorDate.getHours() + 1);
          try {
            await userApi.updateUser(user.email, {
              freeTrialStartDate: adjustedVisitorDate,
            });
          } catch (e) {
            console.log(e);
          }
        }
      }
    };
    updateUser();
  }, [user, visitor]);

  const saveToLocalStorage = (book: BookData) => {
    try {
      localStorage.setItem("latestBook", JSON.stringify(book));
    } catch (e) {
      console.error("Failed to save to localStorage:", e);
    }
  };

  const loadFromLocalStorage = (): BookData | null => {
    try {
      const storedBook = localStorage.getItem("latestBook");
      return storedBook ? JSON.parse(storedBook) : null;
    } catch (e) {
      console.error("Failed to load from localStorage:", e);
      return null;
    }
  };

  // Update book's lastAccessed timestamp and save to DB
  const updateBookAccess = async (bookId: string) => {
    const updatedBooks = books.map((book) =>
      book.id === bookId ? { ...book, lastAccessed: Date.now() } : book
    );

    const updatedBook = updatedBooks.find((book) => book.id === bookId);
    if (updatedBook) {
      try {
        await saveBookToIndexedDB(updatedBook);
        setBooks(updatedBooks);
      } catch (err) {
        console.error("Failed to update book access time:", err);
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onloadend = async () => {
        const fileUrl = reader.result as string;
        const fileName = file.name;

        const existingBook = books.find((book) => book.fileName === fileName);

        if (existingBook) {
          await updateBookAccess(existingBook.id);
          setPdfFileUrl(existingBook.fileUrl);
          setCurrentBookId(existingBook.id);
        } else {
          const newBook: BookData = {
            id: `${Date.now()}`,
            fileName,
            fileUrl,
            lastPage: 0,
            lastAccessed: Date.now(),
          };

          const updatedBooks = [...books, newBook];
          if (updatedBooks.length > BOOK_LIMIT) {
            try {
              await deleteOldestBookFromIndexedDB();
              updatedBooks.shift();
            } catch (err) {
              console.error("Failed to delete the oldest book:", err);
            }
          }

          setBooks(updatedBooks);

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
      book.id === id ? { ...book, lastPage, lastAccessed: Date.now() } : book
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

        if (savedBooks.length > 0) {
          // Sort books by lastAccessed timestamp to find the most recently opened book
          const sortedBooks = savedBooks.sort(
            (a, b) => (b.lastAccessed || 0) - (a.lastAccessed || 0)
          );

          setBooks(sortedBooks);

          // Open the most recently accessed book
          const mostRecentBook = sortedBooks[0];
          setPdfFileUrl(mostRecentBook.fileUrl);
          setCurrentBookId(mostRecentBook.id);
        }
      } catch (err) {
        console.error(
          "IndexedDB failed. Loading from localStorage instead.",
          err
        );

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

  const handleToggleSettingsModal = (isOpen: boolean) => {
    setIsSettingsModalOpen(isOpen);
  };

  const currentBook = books.find((book) => book.id === currentBookId);

  return (
    <div className="flex flex-col min-h-screen bg-dark-background">
      <Navbar
        onUpload={handleFileChange}
        onToggleSettingsModal={handleToggleSettingsModal}
        onToggleFullScreen={(isFullScreen) => {
          setIsFullScreen(isFullScreen);
        }}
        onFreeTrialClick={() => setIsFreeTrialModalOpen(true)}
      />
      <div
        className={`flex flex-col items-center z-0 ${!pdfFileUrl ? "" : ""}`}
      >
        {!pdfFileUrl ? (
          <Landing onFileChange={handleFileChange} />
        ) : (
          currentBook && (
            <Main
              key={currentBookId}
              book={currentBook}
              onLastPageChange={(lastPage: number) => {
                updateLastPage(currentBook.id, lastPage);
              }}
              isSettingsModalOpen={isSettingsModalOpen}
              isFullScreen={isFullScreen}
            />
          )
        )}
        {!isFullScreen && currentBook && (
          <Suspense fallback={<LoadingPage />}>
            <BookList
              books={books}
              currentBookId={currentBookId}
              onBookSelect={async (book) => {
                await updateBookAccess(book.id);
                setPdfFileUrl(book.fileUrl);
                setCurrentBookId(book.id);
              }}
            />
          </Suspense>
        )}
      </div>
      <Suspense fallback={<LoadingPage />}>
        <FreeTrialModal
          user={user}
          isOpen={isFreeTrialModalOpen}
          onClose={() => setIsFreeTrialModalOpen(false)}
          isTrialActive={isFreeTrialActive}
          trialEndDate={freeTrialEndDate!}
        />
      </Suspense>

      {!currentBook && <Footer />}
    </div>
  );
};

export default Home;
