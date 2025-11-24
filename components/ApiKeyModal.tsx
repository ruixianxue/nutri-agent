
import React, { useState } from 'react';
import { Key, CheckCircle, ExternalLink } from 'lucide-react';
import { STORAGE_KEYS } from '../constants';

interface ApiKeyModalProps {
  isOpen: boolean;
  onSave: () => void;
  onClose: () => void;
  canClose: boolean;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onSave, onClose, canClose }) => {
  const [key, setKey] = useState('');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim()) {
      localStorage.setItem(STORAGE_KEYS.API_KEY, key.trim());
      onSave();
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slideUp">
        <div className="bg-slate-800 px-6 py-6 flex flex-col items-center text-center">
          <div className="bg-slate-700 p-3 rounded-full mb-3 text-indigo-400">
             <Key size={32} />
          </div>
          <h2 className="text-xl font-bold text-white">Configure AI Access</h2>
          <p className="text-sm text-slate-400 mt-1">Bring Your Own Key</p>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div className="text-sm text-slate-600 leading-relaxed">
            <p className="mb-2">
              To keep this app free and private, it runs using your own personal <strong>Google Gemini API Key</strong>.
            </p>
            <p>
              The key is stored securely in your browser's local storage and is never sent to our servers.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Your API Key</label>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-mono"
              required
            />
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline mt-2"
            >
              Get a free key from Google AI Studio <ExternalLink size={10} />
            </a>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            {canClose && (
              <button 
                type="button" 
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
            )}
            <button 
              type="submit"
              className="flex items-center gap-2 px-6 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <CheckCircle size={16} />
              Save Key
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
