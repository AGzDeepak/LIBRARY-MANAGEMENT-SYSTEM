import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { StatsCard } from './components/StatsCard';
import { Login } from './pages/Login';
import { ProfilePage } from './pages/ProfilePage';
import { api } from './services/api';
import { Book, Student, IssuedBookRecord, ViewState, BookStatus, UserRole, UserProfile } from './types';
import { FINE_PER_DAY, LOAN_PERIOD_DAYS } from './constants';
import { BookOpen, Users, BookCheck, Search, Plus, ArrowUpRight, Bell, AlertCircle, Filter, IndianRupee, MessageSquare, User, Menu, Clock, Loader2, Mail, Phone, QrCode, Smartphone, CheckCircle2, X, ScanLine, Download, Upload, Trash2 } from 'lucide-react';

const App: React.FC = () => {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('user');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // UI State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sendingNotificationId, setSendingNotificationId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Data State
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [books, setBooks] = useState<Book[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [issuedBooks, setIssuedBooks] = useState<IssuedBookRecord[]>([]);

  // Bulk Action State
  const [selectedBookIds, setSelectedBookIds] = useState<number[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);

  // Form States
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'AVAILABLE' | 'ISSUED'>('ALL');
  
  // New Entry States
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookAuthor, setNewBookAuthor] = useState('');
  
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentCourse, setNewStudentCourse] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentPhone, setNewStudentPhone] = useState('');

  // Issue/Return Form State
  const [circulationTab, setCirculationTab] = useState<'issue' | 'return'>('issue');
  const [issueStudentId, setIssueStudentId] = useState<string>('');
  const [issueBookId, setIssueBookId] = useState<string>('');
  const [returnRecordId, setReturnRecordId] = useState<string>('');
  
  // Fine & Payment State
  const [showFineModal, setShowFineModal] = useState(false);
  const [fineRecord, setFineRecord] = useState<{record: IssuedBookRecord, fine: number, overdueDays: number} | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  
  const [systemMsg, setSystemMsg] = useState<{text: string, type: 'success' | 'error' | 'info'} | null>(null);

  // --- Security Redirect ---
  useEffect(() => {
    // Strictly restrict these views to Admin only
    const restrictedViews: ViewState[] = ['students', 'issue_book'];
    if (isAuthenticated && userRole !== 'admin' && restrictedViews.includes(currentView)) {
      setCurrentView('dashboard');
      showToast('Access restricted to Administrators', 'error');
    }
  }, [userRole, currentView, isAuthenticated]);

  // --- API Loading Effect ---
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [fetchedBooks, fetchedStudents, fetchedIssued] = await Promise.all([
        api.books.list(),
        api.students.list(),
        api.circulation.list()
      ]);
      setBooks(fetchedBooks);
      setStudents(fetchedStudents);
      setIssuedBooks(fetchedIssued);
    } catch (error) {
      showToast('Failed to load data from database', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Helpers ---
  const calculateFine = (dueDateStr: string): number => {
    const today = new Date();
    const due = new Date(dueDateStr);
    today.setHours(0,0,0,0);
    due.setHours(0,0,0,0);
    if (today <= due) return 0;
    const diffTime = Math.abs(today.getTime() - due.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays * FINE_PER_DAY;
  };

  const getOverdueDays = (dueDateStr: string): number => {
    const today = new Date();
    const due = new Date(dueDateStr);
    today.setHours(0,0,0,0);
    due.setHours(0,0,0,0);
    if (today <= due) return 0;
    const diffTime = Math.abs(today.getTime() - due.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  };

  const isOverdue = (dueDateStr: string): boolean => {
    const today = new Date();
    const due = new Date(dueDateStr);
    today.setHours(0,0,0,0);
    due.setHours(0,0,0,0);
    return today > due;
  };

  const isDueSoon = (dueDateStr: string): boolean => {
    const today = new Date();
    const due = new Date(dueDateStr);
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 2 && today <= due;
  };

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setSystemMsg({ text: msg, type });
    setTimeout(() => setSystemMsg(null), 4000);
  };

  // --- Selection Logic ---
  const toggleBookSelection = (id: number) => {
    setSelectedBookIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleAllBooks = () => {
    if (selectedBookIds.length === filteredBooks.length) {
      setSelectedBookIds([]);
    } else {
      setSelectedBookIds(filteredBooks.map(b => b.id));
    }
  };

  const toggleStudentSelection = (id: number) => {
    setSelectedStudentIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleAllStudents = () => {
    if (selectedStudentIds.length === students.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(students.map(s => s.id));
    }
  };

  const handleBulkDeleteBooks = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedBookIds.length} books?`)) return;
    try {
      await api.books.bulkDelete(selectedBookIds);
      await loadData();
      setSelectedBookIds([]);
      showToast('Selected books deleted successfully');
    } catch (e) {
      showToast('Failed to delete selected books', 'error');
    }
  };

  const handleBulkDeleteStudents = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedStudentIds.length} students?`)) return;
    try {
      await api.students.bulkDelete(selectedStudentIds);
      await loadData();
      setSelectedStudentIds([]);
      showToast('Selected students deleted successfully');
    } catch (e) {
      showToast('Failed to delete selected students', 'error');
    }
  };

  // --- Import / Export Logic ---
  const handleExportData = async () => {
    try {
      const data = await api.system.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `library_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Data exported successfully');
    } catch (e) {
      showToast('Export failed', 'error');
    }
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        await api.system.importData(json);
        await loadData();
        showToast('Data imported successfully');
      } catch (err) {
        showToast('Invalid backup file', 'error');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Stats Logic
  const availableBooksCount = books.filter(b => b.status === BookStatus.AVAILABLE).length;
  const overdueCount = issuedBooks.filter(b => isOverdue(b.dueDate)).length;

  // --- Actions ---
  const handleLogin = (role: UserRole) => {
    setUserRole(role);
    setIsAuthenticated(true);
    setCurrentView('dashboard'); 

    // Initialize Profile
    const initialProfile: UserProfile = role === 'admin' 
      ? { 
          name: 'Administrator', 
          email: 'admin@library.edu', 
          role: 'admin', 
          phone: '+91 98765 43210',
          department: 'Central Library',
          bio: 'Managing the digital archives and system operations.',
          joinDate: 'Jan 10, 2024'
        }
      : { 
          name: 'Library Member', 
          email: 'user@library.edu', 
          role: 'user', 
          phone: '+91 99887 76655',
          department: 'Computer Science',
          bio: 'Avid reader and researcher.',
          joinDate: 'Feb 14, 2024'
        };
    setUserProfile(initialProfile);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole('user');
    setUserProfile(null);
    setCurrentView('dashboard');
  };

  const handleUpdateProfile = (updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile);
    showToast('Profile updated successfully');
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userRole !== 'admin') return; 
    if (!newBookTitle || !newBookAuthor) return;
    
    const newBook: Omit<Book, 'id'> = {
      title: newBookTitle,
      author: newBookAuthor,
      status: BookStatus.AVAILABLE
    };

    try {
      await api.books.create(newBook);
      await loadData();
      setNewBookTitle('');
      setNewBookAuthor('');
      setShowAddBookModal(false);
      showToast('Book added to database');
    } catch (err) {
      showToast('Failed to add book', 'error');
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userRole !== 'admin') return;
    if (!newStudentName || !newStudentCourse) return;

    const newStudent: Omit<Student, 'id'> = {
      name: newStudentName,
      course: newStudentCourse,
      email: newStudentEmail || `${newStudentName.toLowerCase().replace(' ', '.')}@library.edu`,
      phone: newStudentPhone || "+91 00000 00000"
    };

    try {
      await api.students.create(newStudent);
      await loadData();
      setNewStudentName('');
      setNewStudentCourse('');
      setNewStudentEmail('');
      setNewStudentPhone('');
      setShowAddStudentModal(false);
      showToast('Student registered in database');
    } catch (err) {
      showToast('Failed to add student', 'error');
    }
  };

  const handleIssueBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userRole !== 'admin') return;
    if (!issueStudentId || !issueBookId) return;

    const student = students.find(s => s.id === parseInt(issueStudentId));
    const book = books.find(b => b.id === parseInt(issueBookId));

    if (student && book && book.status === BookStatus.AVAILABLE) {
      const issueDate = new Date();
      const dueDate = new Date();
      dueDate.setDate(issueDate.getDate() + LOAN_PERIOD_DAYS);

      const newRecord: Omit<IssuedBookRecord, 'id'> = {
        studentName: student.name,
        bookName: book.title,
        issueDate: issueDate.toISOString().split('T')[0],
        dueDate: dueDate.toISOString().split('T')[0]
      };

      try {
        await api.circulation.issue(newRecord);
        await loadData();
        setIssueStudentId('');
        setIssueBookId('');
        showToast(`Issued "${book.title}" to ${student.name}`);
      } catch (err) {
        showToast('Transaction failed', 'error');
      }
    }
  };

  const processReturn = async (record: IssuedBookRecord) => {
    try {
       await api.circulation.return(record.id, record.bookName);
       await loadData();
       setReturnRecordId('');
       showToast(`Book "${record.bookName}" returned successfully`);
     } catch (err) {
       showToast('Return failed', 'error');
     }
  };

  const handleReturnBook = async (recordId: number, bookName: string) => {
     if (userRole !== 'admin') return; 
     const record = issuedBooks.find(r => r.id === recordId);
     if (!record) return;
     const fine = calculateFine(record.dueDate);
     if (fine > 0) {
        setFineRecord({ record, fine, overdueDays: getOverdueDays(record.dueDate) });
        setShowFineModal(true);
     } else {
        await processReturn(record);
     }
  };

  const handleReturnFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userRole !== 'admin') return; 
    if (!returnRecordId) return;
    const record = issuedBooks.find(r => r.id === parseInt(returnRecordId));
    if (!record) return;
    const fine = calculateFine(record.dueDate);
    if (fine > 0) {
        setFineRecord({ record, fine, overdueDays: getOverdueDays(record.dueDate) });
        setShowFineModal(true);
    } else {
        await processReturn(record);
    }
  };

  const handleConfirmPayment = async () => {
      if (!fineRecord) return;
      setIsProcessingPayment(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      showToast(`Payment of ₹${fineRecord.fine} recorded successfully.`, 'success');
      await processReturn(fineRecord.record);
      setIsProcessingPayment(false);
      setShowFineModal(false);
      setFineRecord(null);
  };

  const handleSendNotification = async (recordId: number, studentName: string, bookName: string, fine: number, type: 'overdue' | 'reminder') => {
    if (userRole !== 'admin') return;
    setSendingNotificationId(recordId);
    await new Promise(resolve => setTimeout(resolve, 1500));
    const student = students.find(s => s.name === studentName);
    const email = student ? student.email : 'unknown@library.edu';
    const phone = student ? student.phone : 'Unknown';
    if (type === 'overdue') {
      showToast(`Alert sent! SMS to ${phone} & Email to ${email}. Fine Amount: ₹${fine}`, 'error');
    } else {
      showToast(`Reminder sent! SMS to ${phone} & Email to ${email} regarding "${bookName}".`, 'info');
    }
    setSendingNotificationId(null);
  };

  // --- Derived Data for Views ---
  const filteredBooks = books.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          b.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' 
      ? true 
      : filterStatus === 'AVAILABLE' 
        ? b.status === BookStatus.AVAILABLE 
        : b.status === BookStatus.ISSUED;
    return matchesSearch && matchesStatus;
  });

  // Get recent books for User Dashboard (New Arrivals)
  const newArrivals = [...books].reverse().slice(0, 5);

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden relative bg-transparent">
      
      {/* Sidebar Layout */}
      <Sidebar 
        currentView={currentView} 
        onChangeView={setCurrentView} 
        onLogout={handleLogout} 
        userRole={userRole}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      
      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-auto relative p-4 md:p-6 w-full">
        
        {/* Global Toast */}
        {systemMsg && (
          <div className={`fixed top-6 right-6 z-[70] px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-5 flex items-center gap-3 border ${
            systemMsg.type === 'success' ? 'bg-emerald-100/90 border-emerald-200 text-emerald-900' : 
            systemMsg.type === 'error' ? 'bg-red-100/90 border-red-200 text-red-900' :
            'bg-gray-100/90 border-gray-300 text-gray-900'
          }`}>
            {systemMsg.type === 'success' && <BookCheck size={20} />}
            {systemMsg.type === 'info' && <Bell size={20} />}
            {systemMsg.type === 'error' && <AlertCircle size={20} />}
            <span className="font-bold text-sm">{systemMsg.text}</span>
          </div>
        )}
        
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-6 md:mb-8 glass-card rounded-3xl px-6 py-4 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 mr-1 rounded-xl hover:bg-slate-900/5 md:hidden transition-colors"
            >
              <Menu size={24} />
            </button>

            <div className="h-10 w-1.5 bg-slate-900 rounded-full hidden md:block"></div>
            <div>
               <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight capitalize">
                 {currentView.replace('_', ' ')}
               </h2>
               {isLoading ? (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Loader2 size={12} className="animate-spin" /> Syncing...
                  </div>
               ) : (
                  <p className="text-xs text-gray-500 font-medium">System Online • {userRole}</p>
               )}
            </div>
          </div>
          <div className="flex items-center gap-3 md:gap-4">
             <div className="hidden md:block text-xs font-bold text-slate-900 bg-white/80 px-4 py-2 rounded-full border border-white shadow-sm">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
             </div>
             <button 
               onClick={() => setCurrentView('profile')}
               className={`w-10 h-10 md:w-12 md:h-12 rounded-full border-2 shadow-md hover:scale-105 transition-transform flex items-center justify-center overflow-hidden ${
                 currentView === 'profile' ? 'border-slate-900 ring-2 ring-slate-900/20' : 'border-white'
               }`}
             >
               {userProfile ? (
                 <div className="w-full h-full bg-slate-900 text-white flex items-center justify-center font-bold text-lg">
                    {userProfile.name.charAt(0)}
                 </div>
               ) : (
                 <User size={20} className="text-gray-600 bg-gray-100 w-full h-full p-2" />
               )}
             </button>
          </div>
        </div>

        {/* Content */}
        {isLoading && books.length === 0 ? (
           <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
              <Loader2 size={48} className="animate-spin mb-4 text-slate-900" />
              <p className="text-sm font-medium">Connecting to database...</p>
           </div>
        ) : (
          <div className="animate-in fade-in duration-500">
            
            {/* Profile View */}
            {currentView === 'profile' && userProfile && (
               <ProfilePage profile={userProfile} onSave={handleUpdateProfile} />
            )}

            {/* Dashboard View */}
            {currentView === 'dashboard' && (
              <div className="max-w-7xl mx-auto space-y-6 pb-10">
                <div className={`grid grid-cols-1 ${userRole === 'admin' ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4 md:gap-6`}>
                  <StatsCard title="Total Books" value={books.length} icon={BookOpen} />
                  <StatsCard title="Available" value={availableBooksCount} icon={BookCheck} />
                  {userRole === 'admin' && <StatsCard title="Overdue" value={overdueCount} icon={AlertCircle} />}
                </div>
                
                {/* Admin Tools: Import/Export */}
                {userRole === 'admin' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div 
                      onClick={handleExportData}
                      className="glass-card p-6 rounded-2xl flex items-center gap-4 cursor-pointer hover:scale-[1.01] transition-transform group"
                    >
                       <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                          <Download size={24} />
                       </div>
                       <div>
                          <h4 className="font-bold text-slate-900">Export Database</h4>
                          <p className="text-xs text-slate-500">Download JSON backup</p>
                       </div>
                    </div>
                    <div 
                      onClick={handleImportClick}
                      className="glass-card p-6 rounded-2xl flex items-center gap-4 cursor-pointer hover:scale-[1.01] transition-transform group"
                    >
                       <div className="w-12 h-12 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center group-hover:bg-pink-600 group-hover:text-white transition-colors">
                          <Upload size={24} />
                       </div>
                       <div>
                          <h4 className="font-bold text-slate-900">Import Data</h4>
                          <p className="text-xs text-slate-500">Restore from backup file</p>
                       </div>
                       <input 
                         type="file" 
                         ref={fileInputRef} 
                         className="hidden" 
                         accept=".json"
                         onChange={handleFileChange}
                       />
                    </div>
                  </div>
                )}

                {userRole === 'admin' ? (
                  <div className="glass-card rounded-[32px] overflow-hidden">
                    <div className="px-6 py-4 md:px-8 md:py-6 border-b border-slate-900/5 flex justify-between items-center">
                      <h3 className="font-bold text-lg md:text-xl text-slate-900">Recent Activity</h3>
                      <button 
                        className="text-sm text-slate-900 font-bold flex items-center gap-1 hover:bg-white px-4 py-2 rounded-full transition-all"
                        onClick={() => setCurrentView('issue_book')}
                      >
                        Manage <ArrowUpRight size={16} />
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left min-w-[600px]">
                        <thead className="bg-white/60 text-gray-400 text-xs uppercase tracking-wider font-bold border-b border-slate-900/5">
                          <tr>
                            <th className="px-6 py-4">Student</th>
                            <th className="px-6 py-4">Book</th>
                            <th className="px-6 py-4">Due Date</th>
                            <th className="px-6 py-4">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-900/5">
                          {issuedBooks.slice().reverse().slice(0,5).map((record) => {
                            const fine = calculateFine(record.dueDate);
                            const overdue = fine > 0;
                            return (
                              <tr key={record.id} className="hover:bg-white/60 transition-colors">
                                <td className="px-6 py-4 font-bold text-slate-900">{record.studentName}</td>
                                <td className="px-6 py-4 text-slate-600">{record.bookName}</td>
                                <td className="px-6 py-4 text-gray-500 text-sm font-mono">{record.dueDate}</td>
                                <td className="px-6 py-4">
                                  {overdue ? (
                                    <span className="inline-flex items-center gap-1 text-red-600 text-xs font-bold bg-red-50 px-3 py-1.5 rounded-full border border-red-100 shadow-sm">
                                      <AlertCircle size={12} /> Overdue (₹{fine})
                                    </span>
                                  ) : (
                                    <span className="text-emerald-700 text-xs font-bold bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 shadow-sm">On Time</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                          {issuedBooks.length === 0 && (
                             <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">No activity recorded.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  // User Dashboard View - Enhanced
                  <div className="space-y-6">
                    {/* Welcome Banner */}
                    <div className="glass-card p-8 md:p-10 rounded-[32px] text-center space-y-4 border border-white/60 relative overflow-hidden">
                       <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/40 to-transparent pointer-events-none"></div>
                       <div className="relative z-10 max-w-2xl mx-auto">
                         <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Welcome back, {userProfile?.name.split(' ')[0]}!</h3>
                         <p className="text-slate-500 text-sm md:text-base leading-relaxed">
                           We have {books.length} books in our collection today. Check out the latest arrivals below or browse the full catalog.
                         </p>
                         <div className="mt-6 flex justify-center gap-3">
                           <button 
                             onClick={() => setCurrentView('books')}
                             className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-all flex items-center gap-2 text-sm"
                           >
                             <Search size={18} /> Browse All Books
                           </button>
                           <button 
                             onClick={() => setCurrentView('profile')}
                             className="bg-white text-slate-700 border border-gray-200 px-6 py-3 rounded-xl font-bold shadow-sm hover:bg-gray-50 transition-all flex items-center gap-2 text-sm"
                           >
                             <User size={18} /> My Profile
                           </button>
                         </div>
                       </div>
                    </div>

                    {/* New Arrivals Section */}
                    <div className="glass-card rounded-[32px] overflow-hidden">
                      <div className="px-6 py-5 border-b border-slate-900/5 flex items-center gap-2">
                         <div className="bg-emerald-100 p-1.5 rounded-lg text-emerald-700"><BookCheck size={18} /></div>
                         <h3 className="font-bold text-lg text-slate-900">New Arrivals</h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[500px]">
                          <thead className="bg-white/60 text-gray-400 text-xs uppercase font-bold tracking-wider border-b border-slate-900/5">
                            <tr>
                              <th className="px-6 py-4">Title</th>
                              <th className="px-6 py-4">Author</th>
                              <th className="px-6 py-4">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-900/5">
                             {newArrivals.map(book => (
                                <tr key={book.id} className="hover:bg-white/60 transition-colors">
                                   <td className="px-6 py-4 font-bold text-slate-900">{book.title}</td>
                                   <td className="px-6 py-4 text-slate-500 text-sm">{book.author}</td>
                                   <td className="px-6 py-4">
                                      <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase flex items-center gap-2 w-fit ${
                                        book.status === BookStatus.AVAILABLE 
                                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                          : 'bg-gray-100 text-gray-500 border border-gray-200'
                                      }`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${book.status === BookStatus.AVAILABLE ? 'bg-emerald-500' : 'bg-gray-400'}`}></div>
                                        {book.status}
                                      </span>
                                   </td>
                                </tr>
                             ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Books View */}
            {currentView === 'books' && (
              <div className="max-w-7xl mx-auto space-y-6 pb-10 relative">
                
                {/* Bulk Action Floating Bar - ADMIN ONLY */}
                {selectedBookIds.length > 0 && userRole === 'admin' && (
                   <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-10 fade-in">
                      <span className="text-sm font-bold border-r border-gray-600 pr-4">{selectedBookIds.length} Selected</span>
                      <button 
                        onClick={handleBulkDeleteBooks}
                        className="flex items-center gap-2 text-sm font-bold hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                      <button 
                        onClick={() => setSelectedBookIds([])}
                        className="ml-2 p-1 hover:bg-white/20 rounded-full"
                      >
                        <X size={14} />
                      </button>
                   </div>
                )}

                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                  <div className="relative w-full md:flex-1 md:max-w-md group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-slate-900 transition-colors" size={20} />
                    <input 
                        type="text"
                        placeholder="Search by title or author..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-10 py-4 glass-input rounded-2xl outline-none focus:bg-white transition-all"
                      />
                      {searchQuery && (
                        <button 
                          onClick={() => setSearchQuery('')}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-slate-900 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      )}
                  </div>
                  
                  <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto items-center">
                    <div className="flex p-1 bg-white/60 rounded-2xl border border-white/50 shadow-sm backdrop-blur-sm w-full md:w-auto">
                       {(['ALL', 'AVAILABLE', 'ISSUED'] as const).map((status) => (
                          <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all capitalize ${
                              filterStatus === status 
                              ? 'bg-slate-900 text-white shadow-md' 
                              : 'text-gray-500 hover:bg-white/60 hover:text-slate-900'
                            }`}
                          >
                            {status.toLowerCase()}
                          </button>
                       ))}
                    </div>

                    {/* Add Book Button - ADMIN ONLY */}
                    {userRole === 'admin' && (
                      <button 
                        onClick={() => setShowAddBookModal(true)}
                        className="w-full md:w-auto bg-slate-900 hover:bg-slate-800 text-white px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5"
                      >
                        <Plus size={20} />
                        <span className="font-bold whitespace-nowrap">Add Book</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Table View */}
                <div className="hidden md:block glass-card rounded-[32px] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[600px]">
                      <thead className="bg-white/60 text-gray-400 text-xs uppercase font-bold tracking-wider border-b border-slate-900/5">
                        <tr>
                          {/* Checkbox Column - ADMIN ONLY */}
                          {userRole === 'admin' && (
                             <th className="px-6 py-4 w-12">
                               <input 
                                 type="checkbox" 
                                 className="rounded border-gray-300 text-slate-900 focus:ring-slate-900"
                                 checked={selectedBookIds.length === filteredBooks.length && filteredBooks.length > 0}
                                 onChange={toggleAllBooks}
                               />
                             </th>
                          )}
                          <th className="px-6 py-4">ID</th>
                          <th className="px-6 py-4">Title</th>
                          <th className="px-6 py-4">Author</th>
                          <th className="px-6 py-4">Availability</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900/5">
                        {filteredBooks.map((book) => (
                          <tr key={book.id} className={`hover:bg-white/60 transition-colors group ${selectedBookIds.includes(book.id) ? 'bg-blue-50/50' : ''}`}>
                            {/* Checkbox Cell - ADMIN ONLY */}
                            {userRole === 'admin' && (
                              <td className="px-6 py-4">
                                <input 
                                   type="checkbox"
                                   checked={selectedBookIds.includes(book.id)}
                                   onChange={() => toggleBookSelection(book.id)}
                                   className="rounded border-gray-300 text-slate-900 focus:ring-slate-900"
                                />
                              </td>
                            )}
                            <td className="px-6 py-4 text-gray-300 font-mono text-sm group-hover:text-slate-900 transition-colors">#{book.id.toString().padStart(3, '0')}</td>
                            <td className="px-6 py-4 font-bold text-slate-900">{book.title}</td>
                            <td className="px-6 py-4 text-slate-500">{book.author}</td>
                            <td className="px-6 py-4">
                              <span className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase shadow-sm flex items-center gap-2 w-fit ${
                                book.status === BookStatus.AVAILABLE 
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                  : 'bg-gray-100 text-gray-500 border border-gray-200'
                              }`}>
                                <div className={`w-2 h-2 rounded-full ${book.status === BookStatus.AVAILABLE ? 'bg-emerald-500' : 'bg-gray-400'}`}></div>
                                {book.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {filteredBooks.length === 0 && (
                           <tr><td colSpan={userRole === 'admin' ? 5 : 4} className="px-6 py-8 text-center text-gray-400 font-bold">No books found.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile List View */}
                <div className="md:hidden space-y-4">
                   {filteredBooks.map((book) => (
                      <div key={book.id} className={`glass-card p-5 rounded-2xl border border-white/60 flex flex-col gap-3 relative ${selectedBookIds.includes(book.id) ? 'ring-2 ring-slate-900 bg-slate-50/50' : ''}`}>
                          {/* Checkbox Mobile - ADMIN ONLY */}
                          {userRole === 'admin' && (
                             <div className="absolute top-4 right-4">
                                <input 
                                   type="checkbox" 
                                   checked={selectedBookIds.includes(book.id)}
                                   onChange={() => toggleBookSelection(book.id)}
                                   className="w-5 h-5 rounded border-gray-300 text-slate-900"
                                />
                             </div>
                          )}
                          <div className="flex justify-between items-start pr-8">
                            <span className="text-xs font-mono text-gray-400">#{book.id}</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase shadow-sm flex items-center gap-2 ${
                              book.status === BookStatus.AVAILABLE 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                : 'bg-gray-100 text-gray-500 border border-gray-200'
                            }`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${book.status === BookStatus.AVAILABLE ? 'bg-emerald-500' : 'bg-gray-400'}`}></div>
                              {book.status}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 text-lg leading-snug">{book.title}</h3>
                            <p className="text-slate-500 text-sm mt-0.5">{book.author}</p>
                          </div>
                      </div>
                   ))}
                </div>
              </div>
            )}

            {/* Students View - ADMIN ONLY */}
            {currentView === 'students' && userRole === 'admin' && (
              <div className="max-w-7xl mx-auto space-y-8 pb-10">
                
                {/* Bulk Action Floating Bar */}
                {selectedStudentIds.length > 0 && (
                   <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-10 fade-in">
                      <span className="text-sm font-bold border-r border-gray-600 pr-4">{selectedStudentIds.length} Selected</span>
                      <button 
                        onClick={handleBulkDeleteStudents}
                        className="flex items-center gap-2 text-sm font-bold hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                      <button 
                        onClick={() => setSelectedStudentIds([])}
                        className="ml-2 p-1 hover:bg-white/20 rounded-full"
                      >
                        <X size={14} />
                      </button>
                   </div>
                )}

                <div className="flex justify-end">
                  <button 
                    onClick={() => setShowAddStudentModal(true)}
                    className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl flex items-center gap-2 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5"
                  >
                    <Plus size={20} />
                    <span className="font-bold">Add Student</span>
                  </button>
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block glass-card rounded-[32px] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[700px]">
                      <thead className="bg-white/60 text-gray-400 text-xs uppercase font-bold tracking-wider border-b border-slate-900/5">
                        <tr>
                          <th className="px-8 py-6 w-12">
                             <input 
                               type="checkbox" 
                               checked={selectedStudentIds.length === students.length && students.length > 0}
                               onChange={toggleAllStudents}
                               className="rounded border-gray-300 text-slate-900 focus:ring-slate-900"
                             />
                          </th>
                          <th className="px-8 py-6">ID</th>
                          <th className="px-8 py-6">Name</th>
                          <th className="px-8 py-6">Course</th>
                          <th className="px-8 py-6">Contact</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900/5">
                        {students.map((student) => (
                          <tr key={student.id} className={`hover:bg-white/60 transition-colors group ${selectedStudentIds.includes(student.id) ? 'bg-blue-50/50' : ''}`}>
                            <td className="px-8 py-6">
                               <input 
                                  type="checkbox"
                                  checked={selectedStudentIds.includes(student.id)}
                                  onChange={() => toggleStudentSelection(student.id)}
                                  className="rounded border-gray-300 text-slate-900 focus:ring-slate-900"
                               />
                            </td>
                            <td className="px-8 py-6 text-gray-300 font-mono text-sm group-hover:text-slate-900 transition-colors">#{student.id.toString().padStart(3, '0')}</td>
                            <td className="px-8 py-6 font-bold text-slate-900">{student.name}</td>
                            <td className="px-8 py-6 text-slate-500">
                              <span className="bg-white text-slate-800 px-3 py-1 rounded-lg text-sm font-bold border border-gray-200 shadow-sm">
                                {student.course}
                              </span>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex flex-col text-xs text-gray-500 gap-1.5">
                                <div className="flex items-center gap-2"><Mail size={12} /> {student.email}</div>
                                <div className="flex items-center gap-2"><Phone size={12} /> {student.phone}</div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile Cards View */}
                <div className="md:hidden space-y-4">
                  {students.map((student) => (
                    <div key={student.id} className={`glass-card p-5 rounded-2xl border border-white/60 flex flex-col gap-4 relative ${selectedStudentIds.includes(student.id) ? 'ring-2 ring-slate-900 bg-slate-50/50' : ''}`}>
                      <div className="absolute top-4 right-4">
                         <input 
                            type="checkbox" 
                            checked={selectedStudentIds.includes(student.id)}
                            onChange={() => toggleStudentSelection(student.id)}
                            className="w-5 h-5 rounded border-gray-300 text-slate-900"
                         />
                      </div>
                      <div className="flex justify-between items-start pr-8">
                        <div>
                          <h3 className="font-bold text-slate-900 text-lg">{student.name}</h3>
                          <span className="inline-block mt-1 bg-white text-slate-800 px-2 py-0.5 rounded text-xs font-bold border border-gray-200 shadow-sm">
                            {student.course}
                          </span>
                        </div>
                        <span className="text-xs font-mono text-gray-400">#{student.id.toString().padStart(3, '0')}</span>
                      </div>
                      <div className="space-y-2 bg-white/40 p-3 rounded-xl">
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <Mail size={14} className="text-slate-400" />
                          <span className="truncate">{student.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <Phone size={14} className="text-slate-400" />
                          {student.phone}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Issue/Return Book View - ADMIN ONLY */}
            {currentView === 'issue_book' && userRole === 'admin' && (
              <div className="max-w-7xl mx-auto space-y-8 pb-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Action Form (Issue/Return) */}
                  <div className="lg:col-span-1">
                    <div className="glass-card p-6 md:p-8 rounded-[32px] sticky top-32">
                      
                      {/* Toggle Issue/Return */}
                      <div className="flex p-1.5 bg-slate-100/80 rounded-2xl mb-6 border border-white/50">
                        <button 
                          onClick={() => setCirculationTab('issue')}
                          className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${
                            circulationTab === 'issue' 
                            ? 'bg-white text-slate-900 shadow-md' 
                            : 'text-gray-500 hover:text-slate-900'
                          }`}
                        >
                          Issue Book
                        </button>
                        <button 
                          onClick={() => setCirculationTab('return')}
                          className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${
                            circulationTab === 'return' 
                            ? 'bg-white text-slate-900 shadow-md' 
                            : 'text-gray-500 hover:text-slate-900'
                          }`}
                        >
                          Return Book
                        </button>
                      </div>

                      {circulationTab === 'issue' ? (
                        <form onSubmit={handleIssueBook} className="space-y-5 animate-in fade-in slide-in-from-left-4 duration-300">
                          {/* Existing Issue Form Fields */}
                          <h3 className="text-xl font-bold mb-2 text-slate-900">Issue Details</h3>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Select Student</label>
                            <div className="relative">
                              <select 
                                value={issueStudentId}
                                onChange={(e) => setIssueStudentId(e.target.value)}
                                className="w-full border border-white/60 bg-white/40 rounded-2xl px-4 py-4 focus:bg-white outline-none appearance-none transition-colors shadow-sm focus:border-slate-900/10"
                                required
                              >
                                <option value="">-- Select Student --</option>
                                {students.map(s => (
                                  <option key={s.id} value={s.id}>{s.name} ({s.course})</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Select Book</label>
                            <div className="relative">
                              <select 
                                value={issueBookId}
                                onChange={(e) => setIssueBookId(e.target.value)}
                                className="w-full border border-white/60 bg-white/40 rounded-2xl px-4 py-4 focus:bg-white outline-none appearance-none transition-colors shadow-sm focus:border-slate-900/10"
                                required
                              >
                                <option value="">-- Select Available Book --</option>
                                {books.filter(b => b.status === BookStatus.AVAILABLE).map(b => (
                                  <option key={b.id} value={b.id}>{b.title}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
                            <p className="text-xs text-blue-800 font-bold flex items-center gap-2">
                              <AlertCircle size={14} />
                              Due Date: 7 days from today
                            </p>
                          </div>
                          <button 
                            type="submit"
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl transition-all shadow-lg hover:shadow-2xl transform hover:-translate-y-0.5 mt-4"
                          >
                            Confirm Issue
                          </button>
                        </form>
                      ) : (
                        <form onSubmit={handleReturnFormSubmit} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                           <h3 className="text-xl font-bold mb-2 text-slate-900">Return Details</h3>
                           <div>
                            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Select Book to Return</label>
                            <div className="relative">
                              <select 
                                value={returnRecordId}
                                onChange={(e) => setReturnRecordId(e.target.value)}
                                className="w-full border border-white/60 bg-white/40 rounded-2xl px-4 py-4 focus:bg-white outline-none appearance-none transition-colors shadow-sm focus:border-slate-900/10"
                                required
                              >
                                <option value="">-- Select Book to Return --</option>
                                {issuedBooks.map(r => (
                                  <option key={r.id} value={r.id}>{r.bookName} (Issued to: {r.studentName})</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <button 
                            type="submit"
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl transition-all shadow-lg hover:shadow-2xl transform hover:-translate-y-0.5 mt-4"
                          >
                            Confirm Return
                          </button>
                        </form>
                      )}
                    </div>
                  </div>

                  {/* Circulation Log Table */}
                  <div className="lg:col-span-2">
                    <div className="glass-card rounded-[32px] overflow-hidden flex flex-col h-full">
                      <div className="px-6 py-6 md:px-8 border-b border-slate-900/5 bg-white/40">
                         <h3 className="text-xl font-bold text-slate-900">Circulation Log</h3>
                         <p className="text-xs text-slate-500 mt-1">Manage active loans and returns</p>
                      </div>
                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left min-w-[800px]">
                          <thead className="bg-white/60 text-gray-400 text-xs uppercase font-bold tracking-wider border-b border-slate-900/5">
                            <tr>
                              <th className="px-6 py-5">Book Details</th>
                              <th className="px-6 py-5">Dates</th>
                              <th className="px-6 py-5">Fine</th>
                              <th className="px-6 py-5">Status</th>
                              <th className="px-6 py-5 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-900/5">
                            {issuedBooks.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-400 font-bold">No active issued books.</td>
                              </tr>
                            ) : (
                              issuedBooks.map((record) => {
                                const fine = calculateFine(record.dueDate);
                                const overdue = fine > 0;
                                const dueSoon = !overdue && isDueSoon(record.dueDate);
                                
                                return (
                                  <tr key={record.id} className="hover:bg-white/60 transition-colors group">
                                    <td className="px-6 py-5">
                                      <div className="flex flex-col">
                                        <span className="font-bold text-slate-900">{record.bookName}</span>
                                        <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                          <User size={12} /> {record.studentName}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="px-6 py-5">
                                      <div className="flex flex-col text-xs font-mono text-gray-500 gap-1">
                                        <span className="flex items-center gap-2" title="Issue Date">
                                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> {record.issueDate}
                                        </span>
                                        <span className="flex items-center gap-2" title="Due Date">
                                          <span className={`w-1.5 h-1.5 rounded-full ${overdue ? 'bg-red-500' : 'bg-slate-300'}`}></span> {record.dueDate}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="px-6 py-5">
                                      {fine > 0 ? (
                                        <span className="font-bold text-red-600 flex items-center gap-0.5">
                                          <IndianRupee size={12} />{fine}
                                        </span>
                                      ) : (
                                        <span className="text-gray-300 font-bold">-</span>
                                      )}
                                    </td>
                                    <td className="px-6 py-5">
                                      {overdue ? (
                                        <span className="inline-flex items-center gap-1.5 text-red-700 text-xs font-bold bg-red-50 px-3 py-1.5 rounded-full border border-red-100 shadow-sm">
                                          <AlertCircle size={14} /> Overdue
                                        </span>
                                      ) : dueSoon ? (
                                        <span className="inline-flex items-center gap-1.5 text-amber-700 text-xs font-bold bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100 shadow-sm">
                                          <Clock size={14} /> Due Soon
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1.5 text-emerald-700 text-xs font-bold bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 shadow-sm">
                                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div> Active
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                      <div className="flex justify-end items-center gap-2">
                                        {(overdue || dueSoon) && (
                                          <button
                                            onClick={() => handleSendNotification(record.id, record.studentName, record.bookName, fine, overdue ? 'overdue' : 'reminder')}
                                            disabled={sendingNotificationId === record.id}
                                            className={`p-2 rounded-xl transition-all duration-300 group/btn relative ${
                                               overdue 
                                               ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg hover:shadow-xl' 
                                               : 'bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-200'
                                            }`}
                                          >
                                            {sendingNotificationId === record.id ? (
                                              <Loader2 size={16} className="animate-spin" />
                                            ) : (
                                              <MessageSquare size={16} />
                                            )}
                                          </button>
                                        )}
                                        
                                        <button
                                          onClick={() => handleReturnBook(record.id, record.bookName)}
                                          className="px-4 py-2 bg-white border border-gray-200 text-slate-600 hover:text-red-600 hover:border-red-100 hover:bg-red-50 rounded-xl text-xs font-bold transition-all shadow-sm"
                                        >
                                          Return
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                      {/* Mobile Cards View */}
                      <div className="md:hidden p-4 space-y-4">
                        {issuedBooks.length === 0 && (
                            <div className="text-center py-10 text-gray-400 font-medium">No active issued books.</div>
                        )}
                        {issuedBooks.map((record) => (
                            <div key={record.id} className="glass-card p-5 rounded-2xl border border-white/60 flex flex-col gap-4">
                                <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                                    <div>
                                        <h4 className="font-bold text-slate-900">{record.bookName}</h4>
                                        <p className="text-xs text-slate-500 mt-1">To: <span className="font-medium">{record.studentName}</span></p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="bg-white/40 p-2 rounded-lg">
                                        <span className="block text-gray-400 font-bold uppercase tracking-wider text-[10px]">Issued</span>
                                        <span className="font-mono text-slate-700">{record.issueDate}</span>
                                    </div>
                                    <div className="bg-white/40 p-2 rounded-lg">
                                        <span className="block text-gray-400 font-bold uppercase tracking-wider text-[10px]">Due</span>
                                        <span className="font-mono text-slate-700">{record.dueDate}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleReturnBook(record.id, record.bookName)}
                                    className="w-full bg-white border border-gray-200 text-slate-700 hover:bg-gray-50 hover:text-red-600 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm"
                                >
                                    Return
                                </button>
                            </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modals (Add Book, Add Student, Fine) - Reuse existing code */}
        {showAddBookModal && userRole === 'admin' && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white/90 backdrop-blur-xl border border-white shadow-2xl rounded-[32px] p-8 w-full max-w-md relative animate-in zoom-in-95 duration-300">
              <button onClick={() => setShowAddBookModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-slate-900 transition-colors bg-white p-2 rounded-full shadow-sm"><X size={20} /></button>
              <div className="mb-6"><div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg shadow-gray-300 mb-4"><BookOpen className="text-white" size={24} /></div><h3 className="text-2xl font-bold text-slate-900">Add New Book</h3></div>
              <form onSubmit={handleAddBook} className="space-y-4">
                <div><label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Book Title</label><input type="text" required value={newBookTitle} onChange={(e) => setNewBookTitle(e.target.value)} className="w-full glass-input px-4 py-3 rounded-2xl outline-none" /></div>
                <div><label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Author</label><input type="text" required value={newBookAuthor} onChange={(e) => setNewBookAuthor(e.target.value)} className="w-full glass-input px-4 py-3 rounded-2xl outline-none" /></div>
                <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl mt-4 shadow-xl">Add Book</button>
              </form>
            </div>
          </div>
        )}

        {showAddStudentModal && userRole === 'admin' && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white/90 backdrop-blur-xl border border-white shadow-2xl rounded-[32px] p-8 w-full max-w-md relative animate-in zoom-in-95 duration-300">
              <button onClick={() => setShowAddStudentModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-slate-900 transition-colors bg-white p-2 rounded-full shadow-sm"><X size={20} /></button>
              <div className="mb-6"><div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg shadow-gray-300 mb-4"><Users className="text-white" size={24} /></div><h3 className="text-2xl font-bold text-slate-900">Register Student</h3></div>
              <form onSubmit={handleAddStudent} className="space-y-4">
                <div><label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Full Name</label><input type="text" required value={newStudentName} onChange={(e) => setNewStudentName(e.target.value)} className="w-full glass-input px-4 py-3 rounded-2xl outline-none" /></div>
                <div><label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Course</label><input type="text" required value={newStudentCourse} onChange={(e) => setNewStudentCourse(e.target.value)} className="w-full glass-input px-4 py-3 rounded-2xl outline-none" /></div>
                <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl mt-4 shadow-xl">Register Student</button>
              </form>
            </div>
          </div>
        )}

        {showFineModal && fineRecord && userRole === 'admin' && (
           <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-white/95 backdrop-blur-xl border border-white shadow-2xl rounded-[40px] w-full max-w-lg relative animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col">
                 <div className="bg-slate-900 p-6 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/10 to-transparent opacity-20"></div>
                    <div className="relative z-10"><h3 className="text-2xl font-bold text-white">Collect Fine</h3><p className="text-slate-400 text-sm">Late Return Processing</p></div>
                    <button onClick={() => { setShowFineModal(false); setFineRecord(null); }} className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors bg-white/10 p-2 rounded-full"><X size={20} /></button>
                 </div>
                 <div className="p-8 space-y-8">
                    <div className="text-center"><h2 className="text-5xl font-bold text-slate-900 tracking-tight flex items-center justify-center gap-1"><IndianRupee size={32} className="mt-2" />{fineRecord.fine}</h2><div className="mt-4 inline-flex items-center gap-2 bg-red-50 text-red-700 px-4 py-1.5 rounded-full text-xs font-bold border border-red-100"><Clock size={12} /> Overdue by {fineRecord.overdueDays} days</div></div>
                    <button onClick={handleConfirmPayment} disabled={isProcessingPayment} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-bold text-lg shadow-xl flex items-center justify-center gap-2">{isProcessingPayment ? <Loader2 size={24} className="animate-spin" /> : <><CheckCircle2 size={24} /> Mark as Paid & Return</>}</button>
                 </div>
              </div>
           </div>
        )}
      </main>
    </div>
  );
};

export default App;