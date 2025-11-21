
import { Book, BookStatus, Student, IssuedBookRecord } from './types';

export const FINE_PER_DAY = 10; // Currency unit
export const LOAN_PERIOD_DAYS = 7;

export const INITIAL_BOOKS: Book[] = [
  { id: 1, title: "Python 101", author: "Guido van Rossum", status: BookStatus.AVAILABLE },
  { id: 2, title: "C Programming", author: "Dennis Ritchie", status: BookStatus.ISSUED },
  { id: 3, title: "Clean Code", author: "Robert C. Martin", status: BookStatus.AVAILABLE },
  { id: 4, title: "The Pragmatic Programmer", author: "Andy Hunt", status: BookStatus.AVAILABLE },
  { id: 5, title: "JavaScript: The Good Parts", author: "Douglas Crockford", status: BookStatus.ISSUED },
  { id: 6, title: "Design Patterns", author: "Erich Gamma", status: BookStatus.AVAILABLE },
  { id: 7, title: "Introduction to Algorithms", author: "Thomas H. Cormen", status: BookStatus.ISSUED },
];

export const INITIAL_STUDENTS: Student[] = [
  { id: 1, name: "Arun Kumar", course: "BCA", email: "arun.k@library.edu", phone: "+91 98765 43210" },
  { id: 2, name: "Divya Sharma", course: "B.Sc CS", email: "divya.s@library.edu", phone: "+91 98765 43211" },
  { id: 3, name: "Rahul Verma", course: "B.Tech IT", email: "rahul.v@library.edu", phone: "+91 98765 43212" },
  { id: 4, name: "Sneha Gupta", course: "MBA", email: "sneha.g@library.edu", phone: "+91 98765 43213" },
];

// Helper to get past dates for demo purposes
const getPastDate = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
};

export const INITIAL_ISSUED_BOOKS: IssuedBookRecord[] = [
  { 
    id: 1, 
    studentName: "Arun Kumar", 
    bookName: "C Programming", 
    issueDate: getPastDate(10), // Issued 10 days ago
    dueDate: getPastDate(3)     // Due 3 days ago (OVERDUE)
  },
  { 
    id: 2, 
    studentName: "Divya Sharma", 
    bookName: "JavaScript: The Good Parts", 
    issueDate: getPastDate(2),  // Issued 2 days ago
    dueDate: getPastDate(-5)    // Due in 5 days (NOT OVERDUE)
  },
  {
    id: 3,
    studentName: "Rahul Verma",
    bookName: "Introduction to Algorithms",
    issueDate: getPastDate(20), // Issued 20 days ago
    dueDate: getPastDate(13)    // Due 13 days ago (HEAVILY OVERDUE)
  }
];