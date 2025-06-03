import { useState, useEffect, useCallback } from 'react';
import {
  saveBookToIndexedDB,
  getBooksFromIndexedDB,
  deleteOldestBookFromIndexedDB,
  deleteBookFromIndexedDB,
} from '@/utils/indexedDb';

export interface BookData {
  id: string;
  fileName: string;
  fileUrl: string;
  lastPage: number;
  lastAccessed: number;
}

interface UseBookManagerOptions {
  bookLimit: number;
  onBookLimitExceeded?: () => void;
}

interface UseBookManagerResult {
  books: BookData[];
  currentBookId: string | null;
  currentFileUrl: string | null;
  addBook: (fileName: string, fileUrl: string) => Promise<BookData>;
  updateLastPage: (bookId: string, lastPage: number) => Promise<void>;
  deleteBook: (bookId: string) => Promise<void>;
  updateBookAccess: (bookId: string) => Promise<void>;
}

const saveToLocalStorage = (book: BookData) => {
  try {
    localStorage.setItem('latestBook', JSON.stringify(book));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

const loadFromLocalStorage = (): BookData | null => {
  try {
    const storedBook = localStorage.getItem('latestBook');
    return storedBook ? JSON.parse(storedBook) : null;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return null;
  }
};

export function useBookManager({ bookLimit, onBookLimitExceeded }: UseBookManagerOptions): UseBookManagerResult {
  const [books, setBooks] = useState<BookData[]>([]);
  const [currentBookId, setCurrentBookId] = useState<string | null>(null);
  const [currentFileUrl, setCurrentFileUrl] = useState<string | null>(null);

  // Load books from IndexedDB on mount
  useEffect(() => {
    const loadBooksFromDB = async () => {
      try {
        const savedBooks = await getBooksFromIndexedDB();
        if (savedBooks.length > 0) {
          // Sort books by lastAccessed timestamp
          const sortedBooks = savedBooks.sort(
            (a, b) => (b.lastAccessed || 0) - (a.lastAccessed || 0)
          );
          setBooks(sortedBooks);

          // Open the most recently accessed book
          const mostRecentBook = sortedBooks[0];
          setCurrentFileUrl(mostRecentBook.fileUrl);
          setCurrentBookId(mostRecentBook.id);
        }
      } catch (error) {
        console.error('Failed to load books from IndexedDB:', error);
        // Try loading from localStorage as fallback
        const lastBook = loadFromLocalStorage();
        if (lastBook) {
          setBooks([lastBook]);
          setCurrentFileUrl(lastBook.fileUrl);
          setCurrentBookId(lastBook.id);
        }
      }
    };

    loadBooksFromDB();
  }, []);

  const updateBookAccess = useCallback(async (bookId: string) => {
    const updatedBooks = books.map((book) =>
      book.id === bookId ? { ...book, lastAccessed: Date.now() } : book
    );

    const updatedBook = updatedBooks.find((book) => book.id === bookId);
    if (updatedBook) {
      try {
        await saveBookToIndexedDB(updatedBook);
        setBooks(updatedBooks);
        setCurrentBookId(bookId);
        setCurrentFileUrl(updatedBook.fileUrl);
      } catch (error) {
        console.error('Failed to update book access time:', error);
        saveToLocalStorage(updatedBook);
      }
    }
  }, [books]);

  const addBook = useCallback(async (fileName: string, fileUrl: string): Promise<BookData> => {
    const existingBook = books.find((book) => book.fileName === fileName);

    if (existingBook) {
      await updateBookAccess(existingBook.id);
      return existingBook;
    }

    const newBook: BookData = {
      id: `${Date.now()}`,
      fileName,
      fileUrl,
      lastPage: 0,
      lastAccessed: Date.now(),
    };

    const updatedBooks = [...books, newBook];
    if (updatedBooks.length > bookLimit) {
      try {
        await deleteOldestBookFromIndexedDB();
        updatedBooks.shift();
        onBookLimitExceeded?.();
      } catch (error) {
        console.error('Failed to delete oldest book:', error);
      }
    }

    try {
      await saveBookToIndexedDB(newBook);
      setBooks(updatedBooks);
      setCurrentBookId(newBook.id);
      setCurrentFileUrl(newBook.fileUrl);
    } catch (error) {
      console.error('Failed to save book to IndexedDB:', error);
      saveToLocalStorage(newBook);
    }

    return newBook;
  }, [books, bookLimit, updateBookAccess, onBookLimitExceeded]);

  const updateLastPage = useCallback(async (bookId: string, lastPage: number) => {
    const updatedBooks = books.map((book) =>
      book.id === bookId ? { ...book, lastPage, lastAccessed: Date.now() } : book
    );

    const updatedBook = updatedBooks.find((book) => book.id === bookId);
    if (updatedBook) {
      try {
        await saveBookToIndexedDB(updatedBook);
        setBooks(updatedBooks);
      } catch (error) {
        console.error('Failed to update last page:', error);
        saveToLocalStorage(updatedBook);
      }
    }
  }, [books]);

  const deleteBook = useCallback(async (bookId: string) => {
    try {
      await deleteBookFromIndexedDB(bookId);
      const updatedBooks = books.filter((book) => book.id !== bookId);
      setBooks(updatedBooks);

      if (bookId === currentBookId) {
        setCurrentBookId(null);
        setCurrentFileUrl(null);
      }
    } catch (error) {
      console.error('Failed to delete book:', error);
    }
  }, [books, currentBookId]);

  return {
    books,
    currentBookId,
    currentFileUrl,
    addBook,
    updateLastPage,
    deleteBook,
    updateBookAccess,
  };
} 