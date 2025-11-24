
import React from 'react';
import { ProductData } from '../types';
import { Package, Search } from 'lucide-react';

interface ProductCardProps {
  data: ProductData;
}

export const ProductCard: React.FC<ProductCardProps> = ({ data }) => {
  const getNutriScoreColor = (score?: string) => {
    switch (score?.toLowerCase()) {
      case 'a': return 'bg-emerald-600';
      case 'b': return 'bg-lime-500';
      case 'c': return 'bg-yellow-400';
      case 'd': return 'bg-orange-500';
      case 'e': return 'bg-red-600';
      default: return 'bg-slate-300';
    }
  };

  const getLevelColor = (level?: string) => {
    switch (level) {
      case 'low': return 'text-emerald-700 bg-emerald-50 border-emerald-100';
      case 'moderate': return 'text-yellow-700 bg-yellow-50 border-yellow-100';
      case 'high': return 'text-red-700 bg-red-50 border-red-100';
      default: return 'text-slate-500 bg-slate-50 border-slate-100';
    }
  };

  const hasNutrients = data.nutrientLevels && (
    data.nutrientLevels.fat || 
    data.nutrientLevels.salt || 
    data.nutrientLevels.sugar || 
    data.nutrientLevels.saturatedFat
  );

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 mb-3 shadow-sm max-w-md">
      <div className="flex items-start gap-4">
        {data.imageUrl ? (
          <img 
            src={data.imageUrl} 
            alt={data.name} 
            className="w-16 h-16 object-contain bg-slate-50 rounded-md border border-slate-100" 
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://picsum.photos/100/100';
            }}
          />
        ) : (
          <div className="w-16 h-16 bg-slate-100 rounded-md flex items-center justify-center text-slate-400">
            <Package size={24} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-800 text-sm truncate">{data.name}</h3>
          <p className="text-xs text-slate-500 mb-2">{data.brand || 'Unknown Brand'}</p>
          <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase tracking-wider font-medium">
             {data.source === 'OpenFoodFacts' ? <Package size={10} /> : <Search size={10} />}
             Source: {data.source === 'OpenFoodFacts' ? 'OpenFoodFacts API' : 'Web Search'}
          </div>
        </div>
      </div>
      
      {/* Nutrition Info */}
      {(data.nutriScore || hasNutrients) && (
        <div className="mt-3 flex flex-wrap gap-3 items-center border-t border-slate-100 pt-3">
          {/* Nutri-Score Badge */}
          {data.nutriScore && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Nutri-Score</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm ${getNutriScoreColor(data.nutriScore)}`}>
                {data.nutriScore.toUpperCase()}
              </div>
            </div>
          )}

          {/* Nutrient Grid */}
          {data.nutrientLevels && (
            <div className="flex flex-wrap gap-2">
              {data.nutrientLevels.sugar && (
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${getLevelColor(data.nutrientLevels.sugar)}`}>
                  Sugar: {data.nutrientLevels.sugar}
                </span>
              )}
              {data.nutrientLevels.fat && (
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${getLevelColor(data.nutrientLevels.fat)}`}>
                  Fat: {data.nutrientLevels.fat}
                </span>
              )}
              {data.nutrientLevels.saturatedFat && (
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${getLevelColor(data.nutrientLevels.saturatedFat)}`}>
                  Sat. Fat: {data.nutrientLevels.saturatedFat}
                </span>
              )}
              {data.nutrientLevels.salt && (
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${getLevelColor(data.nutrientLevels.salt)}`}>
                  Salt: {data.nutrientLevels.salt}
                </span>
              )}
            </div>
          )}
        </div>
      )}
      
      <div className="mt-3 border-t border-slate-100 pt-3">
        <p className="text-xs font-medium text-slate-500 mb-1">Ingredients Found:</p>
        <div className="text-xs text-slate-600 leading-relaxed max-h-32 overflow-y-auto bg-slate-50 p-2 rounded border border-slate-100">
          {data.ingredients}
        </div>
      </div>
    </div>
  );
};
