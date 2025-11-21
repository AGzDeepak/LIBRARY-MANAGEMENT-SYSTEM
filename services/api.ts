import { Book, Student, IssuedBookRecord, BookStatus } from '../types';
import { db } from '../lib/db';

// Helper to simulate network delay (optional, for UI feel)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  books: {
    list: async (): Promise<Book[]> => {
      await delay(200);
      return await db.books.toArray();
    },
    create: async (book: Omit<Book, 'id'>): Promise<number> => {
      await delay(200);
      // Cast to unknown then Book to satisfy TS constraint on strict 'id' property
      // Dexie handles the missing ID by auto-incrementing
      return await db.books.add(book as unknown as Book); 
    },
    updateStatus: async (bookId: number, status: BookStatus): Promise<void> => {
      await db.books.update(bookId, { status });
    },
    delete: async (id: number): Promise<void> => {
      await db.books.delete(id);
    },
    bulkDelete: async (ids: number[]): Promise<void> => {
      await db.books.bulkDelete(ids);
    }
  },
  students: {
    list: async (): Promise<Student[]> => {
      await delay(200);
      return await db.students.toArray();
    },
    create: async (student: Omit<Student, 'id'>): Promise<number> => {
      await delay(200);
      return await db.students.add(student as unknown as Student);
    },
    delete: async (id: number): Promise<void> => {
      await db.students.delete(id);
    },
    bulkDelete: async (ids: number[]): Promise<void> => {
      await db.students.bulkDelete(ids);
    }
  },
  circulation: {
    list: async (): Promise<IssuedBookRecord[]> => {
      await delay(200);
      return await db.issuedBooks.toArray();
    },
    issue: async (record: Omit<IssuedBookRecord, 'id'>): Promise<void> => {
      await delay(400);
      
      // Transaction ensures both operations succeed or fail together
      await (db as any).transaction('rw', db.issuedBooks, db.books, async () => {
        // 1. Add the issued record (Dexie generates ID)
        await db.issuedBooks.add(record as unknown as IssuedBookRecord);
        
        // 2. Find the book ID by title and update status
        const book = await db.books.where('title').equals(record.bookName).first();
        if (book) {
          await db.books.update(book.id, { status: BookStatus.ISSUED });
        }
      });
    },
    return: async (recordId: number, bookName: string): Promise<void> => {
       await delay(400);
       
       await (db as any).transaction('rw', db.issuedBooks, db.books, async () => {
         // 1. Delete the issued record
         await db.issuedBooks.delete(recordId);
         
         // 2. Update book status back to Available
         const book = await db.books.where('title').equals(bookName).first();
         if (book) {
           await db.books.update(book.id, { status: BookStatus.AVAILABLE });
         }
       });
    }
  },
  system: {
    exportData: async () => {
      const books = await db.books.toArray();
      const students = await db.students.toArray();
      const issuedBooks = await db.issuedBooks.toArray();
      return {
        books,
        students,
        issuedBooks,
        version: 1,
        timestamp: new Date().toISOString()
      };
    },
    importData: async (data: any) => {
      if (!data || typeof data !== 'object') throw new Error("Invalid data format");
      
      await (db as any).transaction('rw', db.books, db.students, db.issuedBooks, async () => {
         // We will append data rather than clearing to avoid accidental data loss, 
         // but removing IDs is crucial to let DB re-assign auto-increments to avoid collisions
         
         const clean = (arr: any[]) => arr.map(({ id, ...rest }) => rest);

         if (Array.isArray(data.books)) {
           await db.books.bulkAdd(clean(data.books) as any);
         }
         if (Array.isArray(data.students)) {
           await db.students.bulkAdd(clean(data.students) as any);
         }
         if (Array.isArray(data.issuedBooks)) {
           await db.issuedBooks.bulkAdd(clean(data.issuedBooks) as any);
         }
      });
    }
  }
};