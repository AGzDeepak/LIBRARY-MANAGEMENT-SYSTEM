
import React, { useState } from 'react';
import { ArrowRight, Mail, Lock, ShieldCheck, User, Loader2 } from 'lucide-react';
import { UserRole } from '../types';

interface LoginProps {
  onLogin: (role: UserRole) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'admin' | 'user'>('admin');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate API check
    setTimeout(() => {
      if (activeTab === 'admin' && email === 'admin@library.com' && password === 'admin123') {
        onLogin('admin');
      } else if (activeTab === 'user' && email === 'user@library.com' && password === 'user123') {
        onLogin('user');
      } else {
        setError('Invalid credentials. Try admin@library.com / admin123');
        setLoading(false);
      }
    }, 1000);
  };

  // Demo credentials helper
  const fillDemo = (role: 'admin' | 'user') => {
    setActiveTab(role);
    setEmail(role === 'admin' ? 'admin@library.com' : 'user@library.com');
    setPassword(role === 'admin' ? 'admin123' : 'user123');
    setError('');
  };

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center relative overflow-hidden bg-[#f0f0f2]">
      
      {/* Responsive Liquid Blobs */}
      <div className="absolute top-[-10%] left-[-20%] w-[300px] md:w-[800px] h-[300px] md:h-[800px] bg-gray-300/50 rounded-full mix-blend-multiply filter blur-[60px] md:blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-20%] w-[250px] md:w-[600px] h-[250px] md:h-[600px] bg-zinc-300/40 rounded-full mix-blend-multiply filter blur-[50px] md:blur-[80px] animate-pulse delay-75"></div>
      
      <div className="container mx-auto flex justify-center items-center relative z-10 px-4 py-6">
        
        <div className="w-full max-w-[420px] flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          {/* Branding */}
          <div className="text-center mb-6 md:mb-8">
             <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-900 rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-gray-400 mb-4 md:mb-6 transform rotate-3 hover:rotate-0 transition-all duration-500 cursor-default">
               <span className="text-white font-serif font-bold text-3xl md:text-4xl">L</span>
             </div>
             <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-2">Welcome Back</h1>
             <p className="text-slate-500 text-sm font-medium">Library Management System</p>
          </div>

          {/* Glass Login Card */}
          <div className="glass-card rounded-[32px] md:rounded-[40px] p-1 shadow-2xl border border-white/80 backdrop-blur-3xl bg-white/40">
            
            {/* Role Toggle Tabs */}
            <div className="flex p-1.5 bg-white/40 rounded-[28px] mb-6 border border-white/50 mx-4 mt-4">
              <button 
                onClick={() => { setActiveTab('admin'); setError(''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[24px] text-xs md:text-sm font-bold transition-all duration-300 ${
                  activeTab === 'admin' 
                  ? 'bg-slate-900 shadow-md text-white scale-100' 
                  : 'text-gray-500 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <ShieldCheck size={16} /> Admin
              </button>
              <button 
                onClick={() => { setActiveTab('user'); setError(''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[24px] text-xs md:text-sm font-bold transition-all duration-300 ${
                  activeTab === 'user' 
                  ? 'bg-slate-900 shadow-md text-white scale-100' 
                  : 'text-gray-500 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <User size={16} /> User
              </button>
            </div>

            <div className="px-4 md:px-8 pb-6 md:pb-8">
              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                
                <div className="space-y-1.5">
                  <label className="text-[10px] md:text-xs font-bold text-slate-500 ml-4 uppercase tracking-wider">Email Address</label>
                  <div className="relative flex items-center group">
                    <Mail className="absolute left-5 text-gray-400 group-focus-within:text-slate-900 transition-colors pointer-events-none" size={18} />
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-6 py-4 md:py-5 glass-input rounded-3xl outline-none text-base md:text-sm text-slate-900 placeholder-gray-400 focus:bg-white transition-all shadow-sm focus:shadow-lg focus:border-slate-900/10"
                      placeholder="name@library.com"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                   <label className="text-[10px] md:text-xs font-bold text-slate-500 ml-4 uppercase tracking-wider">Password</label>
                   <div className="relative flex items-center group">
                    <Lock className="absolute left-5 text-gray-400 group-focus-within:text-slate-900 transition-colors pointer-events-none" size={18} />
                    <input
                      type="password"
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-6 py-4 md:py-5 glass-input rounded-3xl outline-none text-base md:text-sm text-slate-900 placeholder-gray-400 focus:bg-white transition-all shadow-sm focus:shadow-lg focus:border-slate-900/10"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 md:p-4 bg-red-50/90 border border-red-100 rounded-2xl text-red-600 text-xs font-bold text-center animate-pulse">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-slate-900 text-white py-4 md:py-5 px-6 rounded-3xl shadow-xl shadow-gray-300 hover:bg-slate-800 hover:scale-[1.01] active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 mt-4"
                >
                  {loading ? (
                    <Loader2 size={24} className="animate-spin text-white" />
                  ) : (
                    <>
                      <span className="font-bold text-base md:text-lg">Sign In</span>
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </form>

              {/* Demo Helpers */}
              <div className="mt-8 pt-6 border-t border-gray-200/50 text-center">
                <p className="text-[10px] text-gray-400 mb-3 font-bold tracking-wider uppercase">Tap to Auto-Fill (Demo)</p>
                <div className="flex justify-center gap-3">
                  <button 
                    type="button"
                    onClick={() => fillDemo('admin')} 
                    className="text-xs bg-white/80 hover:bg-slate-900 hover:text-white border border-gray-200 px-4 py-2 rounded-full text-slate-600 font-bold transition-all shadow-sm active:scale-95"
                  >
                    Admin
                  </button>
                  <button 
                    type="button"
                    onClick={() => fillDemo('user')} 
                    className="text-xs bg-white/80 hover:bg-slate-900 hover:text-white border border-gray-200 px-4 py-2 rounded-full text-slate-600 font-bold transition-all shadow-sm active:scale-95"
                  >
                    User
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-center text-slate-400 text-[10px] md:text-xs mt-6 md:mt-8 font-medium mix-blend-darken">
            &copy; 2025 Library Management System. Secure Access.
          </p>
        </div>
      </div>
    </div>
  );
};