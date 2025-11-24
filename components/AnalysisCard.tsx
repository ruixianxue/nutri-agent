import React from 'react';
import { HealthAnalysis } from '../types';
import { ShieldCheck, ShieldAlert, ShieldBan, Leaf, ArrowRight } from 'lucide-react';

interface AnalysisCardProps {
  analysis: HealthAnalysis;
}

export const AnalysisCard: React.FC<AnalysisCardProps> = ({ analysis }) => {
  const getVerdictStyle = (verdict: string) => {
    switch (verdict) {
      case 'SAFE': return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: <ShieldCheck className="w-5 h-5" /> };
      case 'CAUTION': return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: <ShieldAlert className="w-5 h-5" /> };
      case 'AVOID': return { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', icon: <ShieldBan className="w-5 h-5" /> };
      default: return { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', icon: <ShieldCheck className="w-5 h-5" /> };
    }
  };

  const style = getVerdictStyle(analysis.verdict);

  return (
    <div className="flex flex-col gap-3 w-full max-w-md">
      {/* Verdict Header */}
      <div className={`rounded-xl border ${style.border} ${style.bg} p-4 shadow-sm`}>
        <div className="flex items-center gap-3 mb-2">
          <div className={`${style.text}`}>{style.icon}</div>
          <span className={`font-bold tracking-tight ${style.text}`}>{analysis.verdict}</span>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed">
          {analysis.summary}
        </p>
      </div>

      {/* Concerns */}
      {analysis.keyConcerns?.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Key Concerns</h4>
          <div className="flex flex-wrap gap-2">
            {analysis.keyConcerns.map((concern, idx) => (
              <span key={idx} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                {concern}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Alternatives */}
      {analysis.alternatives?.length > 0 && (
        <div className="bg-indigo-50/50 rounded-xl border border-indigo-100 p-4 shadow-sm">
          <h4 className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3">
            <Leaf className="w-3 h-3" /> Better Alternatives
          </h4>
          <div className="space-y-3">
            {analysis.alternatives.map((alt, idx) => (
              <div key={idx} className="flex flex-col gap-1 bg-white p-3 rounded-lg border border-indigo-50 shadow-sm">
                <div className="font-semibold text-slate-800 text-sm">{alt.name}</div>
                <div className="text-xs text-slate-500 flex items-start gap-1">
                   <ArrowRight className="w-3 h-3 mt-0.5 shrink-0 text-indigo-300" />
                   {alt.reason}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};