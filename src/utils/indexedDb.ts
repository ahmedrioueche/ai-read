import { Book } from "@/app/page";
import { openDB, IDBPDatabase } from "idb";

const DB_NAME = "bookAppDB";
const STORE_NAME = "books";

let db: IDBPDatabase | null = null;

/**
 * Initialize the IndexedDB database and object store.
 */
const initDB = async (): Promise<IDBPDatabase> => {
  if (db) return db; // Return existing database instance if already initialized.

  try {
    db = await openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
      },
    });
    return db;
  } catch (error) {
    console.error("Failed to initialize IndexedDB:", error);
    throw new Error("Database initialization failed");
  }
};

/**
 * Save a book to IndexedDB.
 * @param book Book object to save.
 */
export const saveBookToIndexedDB = async (book: Book): Promise<boolean> => {
  try {
    const db = await initDB();
    await db.put(STORE_NAME, book);
    return true;
  } catch (error: any) {
    console.error("Failed to save book to IndexedDB:", error);
    return false;
  }
};

/**
 * Retrieve all books from IndexedDB.
 * @returns Array of books.
 */
export const getBooksFromIndexedDB = async (): Promise<Book[]> => {
  try {
    const db = await initDB();
    return (await db.getAll(STORE_NAME)) || [];
  } catch (error) {
    console.error("Failed to retrieve books from IndexedDB:", error);
    return [];
  }
};

/**
 * Delete a specific book from IndexedDB by ID.
 * @param id ID of the book to delete.
 */
export const deleteBookFromIndexedDB = async (id: string): Promise<boolean> => {
  try {
    const db = await initDB();
    await db.delete(STORE_NAME, id);
    return true;
  } catch (error) {
    console.error(`Failed to delete book with ID ${id} from IndexedDB:`, error);
    return false;
  }
};

/**
 * Delete the oldest book from IndexedDB.
 * Ensures only the first (oldest) entry is deleted.
 */
export const deleteOldestBookFromIndexedDB = async (): Promise<boolean> => {
  try {
    const books = await getBooksFromIndexedDB();
    if (books.length > 0) {
      const oldestBook = books[0];
      return await deleteBookFromIndexedDB(oldestBook.id);
    }
    return false; // No books to delete.
  } catch (error) {
    console.error("Failed to delete the oldest book from IndexedDB:", error);
    return false;
  }
};
