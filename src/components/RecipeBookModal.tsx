import React, { useState } from 'react';
import { X, BookOpen, Clock, Award, Sparkles, ChefHat } from 'lucide-react';
import { ALL_RECIPES, INGREDIENT_DETAILS } from '../data/recipes';
import { DishRecipe } from '../types';

interface RecipeBookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RecipeBookModal: React.FC<RecipeBookModalProps> = ({ isOpen, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const recipes = Object.values(ALL_RECIPES);

  if (!isOpen) return null;

  const categories = [
    { id: 'all', name: 'Semua Resep', icon: '📖' },
    { id: 'burger', name: 'Burger', icon: '🍔' },
    { id: 'pizza', name: 'Pizza', icon: '🍕' },
    { id: 'mie', name: 'Mie & Sup', icon: '🍜' },
    { id: 'cake', name: 'Kue & Manis', icon: '🧁' },
  ];

  const filteredRecipes = recipes.filter(r => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'mie') return r.category === 'mie' || r.category === 'soup';
    return r.category === selectedCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-gradient-to-b from-amber-50 to-orange-50 border-4 border-amber-500 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-amber-500 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-white/20 rounded-xl">
              <BookOpen className="w-6 h-6 text-white" />
            </span>
            <div>
              <h2 className="text-2xl font-bold font-['Fredoka'] tracking-wide">Buku Resep Koki Petualang</h2>
              <p className="text-xs text-amber-100 font-medium">Panduan lengkap bahan dan cara memasak setiap hidangan</p>
            </div>
          </div>
          <button
            id="btn-close-recipe-modal"
            onClick={onClose}
            className="p-2 bg-amber-600 hover:bg-amber-700 text-white rounded-full transition-transform active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 px-6 pt-4 pb-2 overflow-x-auto border-b border-amber-200">
          {categories.map((cat) => (
            <button
              key={cat.id}
              id={`tab-category-${cat.id}`}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-amber-100/80 text-amber-900 hover:bg-amber-200'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Recipe Cards List */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {filteredRecipes.map((recipe: DishRecipe) => (
            <div
              key={recipe.id}
              className="bg-white rounded-2xl border-2 border-amber-200 p-4 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-100 pb-3 mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-4xl p-2 bg-amber-50 rounded-2xl border border-amber-200">{recipe.icon}</span>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 font-['Fredoka']">{recipe.name}</h3>
                    <p className="text-xs text-slate-500 font-medium">{recipe.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="bg-amber-100 text-amber-800 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1 border border-amber-300">
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    +{recipe.score} Poin
                  </span>
                </div>
              </div>

              {/* Ingredients Required */}
              <div className="mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Bahan yang Dibutuhkan:</span>
                <div className="flex flex-wrap gap-2">
                  {recipe.requiredIngredients.map((ingKey, idx) => {
                    const ing = INGREDIENT_DETAILS[ingKey];
                    return (
                      <div
                        key={idx}
                        className={`text-xs px-2.5 py-1.5 rounded-xl font-bold border flex items-center gap-1.5 shadow-xs ${
                          ing?.color || 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        <span className="text-sm">{ing?.icon || '🍽️'}</span>
                        <span>{ing?.name || ingKey}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step By Step Instructions */}
              <div className="bg-amber-50/60 rounded-xl p-3 border border-amber-200/70">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                  <ChefHat className="w-3.5 h-3.5 text-amber-600" />
                  Langkah Pembuatan:
                </span>
                <ol className="text-xs text-slate-600 space-y-1 pl-4 list-decimal font-medium">
                  {recipe.preparationSteps.map((step, sIdx) => (
                    <li key={sIdx}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="bg-amber-100 px-6 py-3 border-t border-amber-200 flex justify-between items-center text-xs text-amber-900 font-medium">
          <span>💡 Tips: Selalu siapkan piring bersih sebelum mencampur bahan masakan!</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-all shadow-xs"
          >
            Tutup Buku
          </button>
        </div>
      </div>
    </div>
  );
};
