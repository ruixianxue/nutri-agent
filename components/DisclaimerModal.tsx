import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

interface DisclaimerModalProps {
  isOpen: boolean;
  onAccept: () => void;
}

export const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ isOpen, onAccept }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-slideUp border border-red-100">
        <div className="bg-red-50 px-6 py-6 flex flex-col items-center text-center border-b border-red-100">
          <div className="bg-red-100 p-3 rounded-full mb-3 text-red-600">
             <AlertTriangle size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Medical Disclaimer</h2>
          <p className="text-sm text-red-600 font-semibold mt-1">Please read carefully before proceeding</p>
        </div>

        <div className="p-6 space-y-4 text-slate-600 text-sm leading-relaxed">
          <p>
            <strong>NutriAgent AI is an experimental tool</strong> powered by artificial intelligence. 
            It analyzes ingredients based on available data, which may be incomplete, outdated, or inaccurate.
          </p>
          
          <ul className="list-disc pl-5 space-y-2">
            <li>This app <strong>does not provide medical advice</strong>, diagnosis, or treatment.</li>
            <li><strong>Do not rely on this app</strong> for severe allergies (e.g., peanuts, shellfish) or life-threatening conditions.</li>
            <li>Always verify ingredients on the physical product packaging.</li>
            <li>Consult a qualified healthcare professional for personalized dietary guidance.</li>
          </ul>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs text-slate-500">
            By clicking "I Understand", you acknowledge that you use this tool at your own risk and will not hold the creators liable for any health consequences.
          </div>
        </div>

        <div className="p-6 pt-0">
          <button 
            onClick={onAccept}
            className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all active:scale-95 shadow-lg shadow-indigo-200"
          >
            <ShieldCheck size={18} />
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
};