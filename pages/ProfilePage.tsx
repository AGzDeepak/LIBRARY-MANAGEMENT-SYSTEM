
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { User, Mail, Phone, Building2, Save, Edit2, Camera, Shield, Calendar, X } from 'lucide-react';

interface ProfilePageProps {
  profile: UserProfile;
  onSave: (updatedProfile: UserProfile) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ profile, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setFormData(profile);
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 800));
    onSave(formData);
    setIsEditing(false);
    setIsLoading(false);
  };

  const handleChange = (field: keyof UserProfile, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header / Cover */}
      <div className="relative h-48 md:h-64 rounded-[32px] overflow-hidden shadow-2xl group">
        <div className="absolute inset-0 bg-slate-900">
           <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>
           <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
        </div>
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 flex items-end justify-between">
           <div className="hidden md:block">
              <h1 className="text-3xl font-bold text-white tracking-tight">My Profile</h1>
              <p className="text-slate-300 text-sm font-medium mt-1">Manage your personal information</p>
           </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 px-4 md:px-2 -mt-20 relative z-10">
        
        {/* Sidebar Card */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          <div className="glass-card p-6 md:p-8 rounded-[32px] flex flex-col items-center text-center relative overflow-hidden border border-white/60 bg-white/80 backdrop-blur-xl shadow-xl">
             
             {/* Avatar */}
             <div className="relative group cursor-pointer">
               <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-2xl bg-gradient-to-br from-slate-100 to-slate-300 flex items-center justify-center text-slate-400 overflow-hidden">
                  <User size={64} strokeWidth={1.5} />
               </div>
               <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Camera className="text-white" size={24} />
               </div>
             </div>

             <h2 className="text-2xl font-bold text-slate-900 mt-4">{formData.name}</h2>
             <p className="text-slate-500 font-medium">{formData.role === 'admin' ? 'Administrator' : 'Library Member'}</p>

             <div className="mt-6 flex flex-wrap justify-center gap-2">
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border flex items-center gap-2 ${
                  formData.role === 'admin' 
                  ? 'bg-slate-100 text-slate-700 border-slate-200' 
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  <Shield size={12} /> {formData.role}
                </span>
             </div>
          </div>

          {/* Quick Stats / Info */}
          <div className="glass-card p-6 rounded-[32px] border border-white/60 bg-white/60 backdrop-blur-md shadow-lg space-y-4">
             <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/50">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                   <Calendar size={20} />
                </div>
                <div>
                   <p className="text-xs font-bold text-gray-400 uppercase">Joined</p>
                   <p className="text-sm font-bold text-slate-900">{formData.joinDate || 'Jan 2024'}</p>
                </div>
             </div>
             <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/50">
                <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                   <Building2 size={20} />
                </div>
                <div>
                   <p className="text-xs font-bold text-gray-400 uppercase">Department</p>
                   <p className="text-sm font-bold text-slate-900">{formData.department || 'General'}</p>
                </div>
             </div>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="flex-1 glass-card p-6 md:p-10 rounded-[32px] border border-white/60 bg-white/80 backdrop-blur-xl shadow-xl relative">
          
          <div className="flex justify-between items-center mb-8">
             <h3 className="text-xl font-bold text-slate-900">Personal Details</h3>
             {!isEditing ? (
               <button 
                 onClick={() => setIsEditing(true)}
                 className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-900 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm border border-gray-200 transition-all transform hover:-translate-y-0.5"
               >
                 <Edit2 size={16} /> Edit Profile
               </button>
             ) : (
               <button 
                 onClick={() => {
                   setFormData(profile); // Reset
                   setIsEditing(false);
                 }}
                 className="flex items-center gap-2 text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl text-sm font-bold transition-all"
               >
                 <X size={16} /> Cancel
               </button>
             )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Full Name</label>
                   <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="text" 
                        disabled={!isEditing}
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className={`w-full pl-12 pr-4 py-4 rounded-2xl outline-none transition-all border ${isEditing ? 'bg-white border-slate-200 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 shadow-sm' : 'bg-slate-50/50 border-transparent text-slate-600'}`}
                      />
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Email Address</label>
                   <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="email" 
                        disabled={!isEditing}
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className={`w-full pl-12 pr-4 py-4 rounded-2xl outline-none transition-all border ${isEditing ? 'bg-white border-slate-200 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 shadow-sm' : 'bg-slate-50/50 border-transparent text-slate-600'}`}
                      />
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Phone Number</label>
                   <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="text" 
                        disabled={!isEditing}
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        className={`w-full pl-12 pr-4 py-4 rounded-2xl outline-none transition-all border ${isEditing ? 'bg-white border-slate-200 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 shadow-sm' : 'bg-slate-50/50 border-transparent text-slate-600'}`}
                      />
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Department</label>
                   <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="text" 
                        disabled={!isEditing}
                        value={formData.department || ''}
                        onChange={(e) => handleChange('department', e.target.value)}
                        className={`w-full pl-12 pr-4 py-4 rounded-2xl outline-none transition-all border ${isEditing ? 'bg-white border-slate-200 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 shadow-sm' : 'bg-slate-50/50 border-transparent text-slate-600'}`}
                      />
                   </div>
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Bio</label>
                <textarea 
                  disabled={!isEditing}
                  value={formData.bio || ''}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  rows={4}
                  className={`w-full p-4 rounded-2xl outline-none transition-all border resize-none ${isEditing ? 'bg-white border-slate-200 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 shadow-sm' : 'bg-slate-50/50 border-transparent text-slate-600'}`}
                  placeholder="Tell us a bit about yourself..."
                />
             </div>

             {isEditing && (
               <div className="pt-4 flex justify-end">
                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
                  >
                    {isLoading ? 'Saving...' : <><Save size={20} /> Save Changes</>}
                  </button>
               </div>
             )}

          </form>
        </div>
      </div>
    </div>
  );
};
