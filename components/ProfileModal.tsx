import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { X, Save, UserCircle } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: UserProfile | null;
  onSave: (profile: UserProfile) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, currentProfile, onSave }) => {
  const [formData, setFormData] = useState<UserProfile>({
    name: '',
    conditions: '',
    goals: '',
    lifestyle: ''
  });

  useEffect(() => {
    if (currentProfile) {
      setFormData(currentProfile);
    }
  }, [currentProfile]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="bg-indigo-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <UserCircle size={24} />
            <h2 className="text-lg font-bold">Your Health Profile</h2>
          </div>
          <button onClick={onClose} className="text-indigo-100 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-sm text-slate-500 mb-4">
            NutriAgent will remember this information and use it to personalize every recommendation.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Name (Optional)</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="How should we call you?"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Medical Conditions</label>
            <input
              type="text"
              name="conditions"
              value={formData.conditions}
              onChange={handleChange}
              placeholder="e.g. Type 2 Diabetes, Hypertension, Celiac..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Health Goals</label>
            <textarea
              name="goals"
              value={formData.goals}
              onChange={handleChange}
              rows={2}
              placeholder="e.g. Lower cholesterol, loose 5kg, build muscle..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Lifestyle / Diet</label>
            <input
              type="text"
              name="lifestyle"
              value={formData.lifestyle}
              onChange={handleChange}
              placeholder="e.g. Vegetarian, Keto, Halal, Lactose Intolerant..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Save size={16} />
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};