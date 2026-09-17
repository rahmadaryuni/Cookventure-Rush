import React, { useState } from 'react';
import { Play, BookOpen, Volume2, VolumeX, RotateCcw, Award, Star, ChefHat, Sparkles, User } from 'lucide-react';
import { LevelProgress, ChefCharacterId } from '../types';
import { CHARACTERS } from '../data/characters';
import { sound } from '../utils/audio';
import { RecipeBookModal } from './RecipeBookModal';

interface MainMenuProps {
  onStartGame: () => void;
  progressList: Record<number, LevelProgress>;
  characterId: ChefCharacterId;
  onResetProgress: () => void;
  onOpenCharacterSelect: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onStartGame,
  progressList,
  characterId,
  onResetProgress,
  onOpenCharacterSelect,
}) => {
  const currentCharacter = CHARACTERS[characterId] || CHARACTERS.cat;
  const [isRecipeOpen, setIsRecipeOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(sound.getMuted());
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Calculate total stars
  const progressArray = Object.values(progressList) as LevelProgress[];
  const totalStars = progressArray.reduce((acc, curr) => acc + curr.stars, 0);
  const unlockedCount = progressArray.filter((p) => p.unlocked).length;

  const handleAudioToggle = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      sound.playClick();
    }
  };

  return (
    <div className="relative w-full h-full min-h-[600px] flex flex-col items-center justify-between p-6 bg-gradient-to-b from-amber-400 via-orange-400 to-amber-600 text-slate-800 overflow-hidden select-none">
      {/* Background Decor Elements */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#fff_2px,transparent_2px)] [background-size:24px_24px]"></div>
      
      {/* Floating Kitchen Utensils & Food in Background */}
      <div className="absolute top-10 left-10 text-5xl opacity-30 animate-pulse">🍔</div>
      <div className="absolute top-20 right-16 text-5xl opacity-30 animate-bounce">🍕</div>
      <div className="absolute bottom-24 left-16 text-5xl opacity-30 animate-bounce">🍜</div>
      <div className="absolute bottom-32 right-12 text-5xl opacity-30 animate-pulse">🧁</div>
      <div className="absolute top-1/2 left-6 text-4xl opacity-20">🍳</div>
      <div className="absolute top-1/3 right-8 text-4xl opacity-20">🥩</div>

      {/* Top Bar with Audio, Character Selector & Progress Summary */}
      <div className="w-full max-w-4xl flex items-center justify-between z-10 pt-2 gap-2 flex-wrap">
        {/* Progress Badge */}
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-xs px-4 py-2 rounded-2xl shadow-md border-2 border-amber-300">
          <div className="flex items-center gap-1 text-amber-600">
            <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
            <span className="font-black font-['Fredoka'] text-base">{totalStars} / 15</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="text-xs font-bold text-slate-600">
            {unlockedCount} / 5 Level Terbuka
          </div>
        </div>

        {/* Right side: Character Selector button & Sound toggle */}
        <div className="flex items-center gap-2">
          {/* Character Selector Button */}
          <button
            id="btn-menu-character-select"
            onClick={() => {
              sound.playClick();
              onOpenCharacterSelect();
            }}
            className="flex items-center gap-2 bg-white/95 hover:bg-white border-2 border-amber-300 px-3 py-2 rounded-2xl shadow-md transition-transform active:scale-95 text-slate-800 cursor-pointer"
            title="Pilih Karakter Koki"
          >
            <span className="text-2xl">{currentCharacter.avatar}</span>
            <div className="flex flex-col items-start leading-none text-left">
              <span className="text-xs font-black font-['Fredoka'] text-amber-900">
                {currentCharacter.name}
              </span>
              <span className="text-[9px] text-amber-600 font-bold">
                {currentCharacter.species} • Ganti
              </span>
            </div>
          </button>

          {/* Sound Toggle */}
          <button
            id="btn-toggle-sound-menu"
            onClick={handleAudioToggle}
            className="p-3 bg-white/90 hover:bg-white text-slate-700 rounded-2xl shadow-md border-2 border-amber-300 active:scale-95 transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            title={isMuted ? 'Nyalakan Audio' : 'Matikan Audio'}
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-rose-500" /> : <Volume2 className="w-5 h-5 text-emerald-600" />}
            <span className="hidden sm:inline">{isMuted ? 'Bisu' : 'Suara'}</span>
          </button>
        </div>
      </div>

      {/* Hero Center Section */}
      <div className="flex flex-col items-center text-center z-10 my-auto py-6">
        {/* Chef Mascot & Logo Badge with Chosen Character */}
        <div
          onClick={() => {
            sound.playPick();
            onOpenCharacterSelect();
          }}
          className="relative mb-3 cursor-pointer group"
          title="Klik untuk ganti karakter koki"
        >
          <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-3xl shadow-xl border-4 border-white bg-gradient-to-tr ${currentCharacter.bgGradient} flex items-center justify-center transform -rotate-3 group-hover:rotate-0 transition-all group-hover:scale-105`}>
            <span className="text-6xl sm:text-7xl">{currentCharacter.avatar}</span>
          </div>
          {/* Mini Chef Hat Badge */}
          <span className="absolute -top-3 -right-2 bg-white text-amber-600 p-1.5 rounded-2xl shadow-md border-2 border-amber-400 text-lg">
            👨‍🍳
          </span>
          <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-amber-900/90 text-amber-200 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-400 whitespace-nowrap shadow-xs">
            {currentCharacter.name} ({currentCharacter.species})
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-6xl font-black font-['Fredoka'] text-white drop-shadow-[0_4px_8px_rgba(180,83,9,0.7)] tracking-wide mt-2">
          Cookventure Rush
        </h1>
        <p className="mt-2 text-sm sm:text-base font-bold text-amber-100 max-w-md drop-shadow-xs">
          Jelajahi World Map dan menjadi koki favorit, kendarai truk keliling, dan taklukkan dapur cepat Overcooked!
        </p>

        {/* Food Truck Miniature Graphic */}
        <div className="my-4 relative bg-white/80 backdrop-blur-xs p-3 px-6 rounded-2xl border-2 border-amber-200 shadow-lg flex items-center gap-4">
          <div className="text-4xl animate-bounce">🚚</div>
          <div className="text-left">
            <span className="text-xs font-black text-amber-800 uppercase tracking-wider block">Cookventure Rush</span>
            <span className="text-xs font-semibold text-slate-600">Siap melaju dari Rumah Makan hingga Restoran Bintang 5!</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full max-w-sm mt-2">
          <button
            id="btn-start-game"
            onClick={() => {
              sound.playClick();
              sound.playHonk();
              onStartGame();
            }}
            className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black font-['Fredoka'] text-xl rounded-2xl shadow-xl border-b-6 border-emerald-700 active:translate-y-1 active:border-b-2 transition-all flex items-center justify-center gap-3 cursor-pointer"
          >
            <Play className="w-6 h-6 fill-white" />
            <span>MULAI PETUALANGAN</span>
          </button>

          <button
            id="btn-open-recipe-book"
            onClick={() => {
              sound.playClick();
              setIsRecipeOpen(true);
            }}
            className="w-full py-3 px-5 bg-white/95 hover:bg-white text-amber-900 font-bold font-['Fredoka'] text-base rounded-2xl shadow-md border-2 border-amber-300 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <BookOpen className="w-5 h-5 text-amber-600" />
            <span>Buku Resep & Panduan</span>
          </button>
        </div>
      </div>

      {/* Footer Info & Reset Data Option */}
      <div className="w-full max-w-4xl flex items-center justify-between text-xs text-amber-900 font-bold z-10 pt-2 border-t border-amber-300/40">
        <span>🎮 Kontrol: [W][A][S][D] / [Panah] + [SPASI] Ambil + [E] Potong</span>

        {showResetConfirm ? (
          <div className="flex items-center gap-2 bg-white/90 p-1.5 px-3 rounded-xl border border-rose-300 shadow-md">
            <span className="text-rose-600">Yakin hapus progres?</span>
            <button
              onClick={() => {
                onResetProgress();
                setShowResetConfirm(false);
              }}
              className="px-2 py-0.5 bg-rose-600 text-white rounded-md font-extrabold cursor-pointer"
            >
              Ya
            </button>
            <button
              onClick={() => setShowResetConfirm(false)}
              className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded-md font-bold cursor-pointer"
            >
              Batal
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="text-amber-900 hover:text-rose-700 flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Progres</span>
          </button>
        )}
      </div>

      {/* Recipe Book Modal */}
      <RecipeBookModal isOpen={isRecipeOpen} onClose={() => setIsRecipeOpen(false)} />
    </div>
  );
};
