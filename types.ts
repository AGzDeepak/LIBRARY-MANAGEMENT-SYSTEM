
export enum BookStatus {
  AVAILABLE = "Available",
  ISSUED = "Issued"
}

export interface Book {
  id: number;
  title: string;
  author: string;
  status: BookStatus;
}

export interface Student {
  id: number;
  name: string;
  course: string;
  email: string;
  phone: string;
}

export interface IssuedBookRecord {
  id: number;
  studentName: string;
  bookName: string;
  issueDate: string;
  dueDate: string;
}

export type UserRole = 'admin' | 'user';

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  department?: string;
  bio?: string;
  joinDate?: string;
}

export type ViewState = 'dashboard' | 'books' | 'students' | 'issue_book' | 'profile';
