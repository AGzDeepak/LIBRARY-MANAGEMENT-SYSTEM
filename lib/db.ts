
import Dexie, { Table } from 'dexie';
import { Book, Student, IssuedBookRecord } from '../types';
import { INITIAL_BOOKS, INITIAL_STUDENTS, INITIAL_ISSUED_BOOKS } from '../constants';

export class LibraryDatabase extends Dexie {
  books!: Table<Book>;
  students!: Table<Student>;
  issuedBooks!: Table<IssuedBookRecord>;

  constructor() {
    super('LibraryDB');
    
    // Define tables and indexes
    // ++id means auto-increment primary key
    (this as any).version(1).stores({
      books: '++id, title, author, status',
      students: '++id, name, course, email',
      issuedBooks: '++id, studentName, bookName, issueDate, dueDate'
    });

    // Populate with initial data only when the database is first created
    (this as any).on('populate', () => {
       this.books.bulkAdd(INITIAL_BOOKS);
       this.students.bulkAdd(INITIAL_STUDENTS);
       this.issuedBooks.bulkAdd(INITIAL_ISSUED_BOOKS);
    });
  }
}

export const db = new LibraryDatabase();
