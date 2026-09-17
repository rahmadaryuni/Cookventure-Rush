import React from 'react';
import { X, Check, Sparkles, ChefHat } from 'lucide-react';
import { ChefCharacterId } from '../types';
import { CHARACTERS, CHARACTER_LIST } from '../data/characters';
import { sound } from '../utils/audio';

interface CharacterSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedId: ChefCharacterId;
  onSelectCharacter: (id: ChefCharacterId) => void;
}

export const CharacterSelectModal: React.FC<CharacterSelectModalProps> = ({
  isOpen,
  onClose,
  selectedId,
  onSelectCharacter,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in select-none">
      <div className="bg-gradient-to-b from-amber-50 via-white to-orange-50 border-4 border-amber-500 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-white/20 rounded-xl">
              <ChefHat className="w-6 h-6 text-white" />
            </span>
            <div>
              <h2 className="text-2xl font-black font-['Fredoka'] tracking-wide">Pilih Karakter Koki</h2>
              <p className="text-xs text-amber-100 font-bold">Pilih hewan koki favoritmu untuk memasak & menjelajah!</p>
            </div>
          </div>
          <button
            id="btn-close-char-modal"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 bg-amber-600 hover:bg-amber-700 text-white rounded-full transition-transform active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Character Grid */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[70vh] overflow-y-auto">
          {CHARACTER_LIST.map((char) => {
            const isSelected = char.id === selectedId;

            return (
              <div
                key={char.id}
                id={`char-option-${char.id}`}
                onClick={() => {
                  sound.playPick();
                  onSelectCharacter(char.id);
                  onClose();
                }}
                className={`relative rounded-2xl border-3 p-3.5 cursor-pointer transition-all flex items-center gap-3.5 shadow-sm group hover:scale-[1.02] ${
                  isSelected
                    ? 'bg-amber-100 border-amber-500 ring-3 ring-amber-400/50 shadow-md'
                    : 'bg-white border-amber-200 hover:border-amber-300'
                }`}
              >
                {/* Character Avatar with Chef Hat Badge */}
                <div className="relative">
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shadow-inner bg-gradient-to-tr ${char.bgGradient} border-2 border-white`}
                  >
                    <span>{char.avatar}</span>
                  </div>
                  {/* Mini Chef Hat on Corner */}
                  <span className="absolute -top-2 -right-1 text-sm bg-white rounded-full p-0.5 border border-amber-300 shadow-xs">
                    👨‍🍳
                  </span>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-base font-black font-['Fredoka'] text-slate-800 truncate">
                      {char.name}
                    </h3>
                    <span className="text-[10px] bg-amber-200/80 text-amber-900 font-extrabold px-1.5 py-0.5 rounded-md">
                      {char.species}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium line-clamp-2 mt-0.5 leading-snug">
                    {char.description}
                  </p>
                </div>

                {/* Selected Checkmark */}
                {isSelected && (
                  <div className="w-7 h-7 bg-amber-500 text-white rounded-full flex items-center justify-center shrink-0 shadow-xs animate-scale-in">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="bg-amber-100/70 px-6 py-3 border-t border-amber-200 flex items-center justify-between text-xs font-bold text-amber-900">
          <span>Karakter aktif: {CHARACTERS[selectedId]?.name} ({CHARACTERS[selectedId]?.species})</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-xs"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
