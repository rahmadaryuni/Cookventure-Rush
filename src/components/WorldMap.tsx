import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, Lock, Play, BookOpen, Volume2, VolumeX, Sparkles, ChefHat, Clock, Award, Compass, Truck } from 'lucide-react';
import { LevelConfig, LevelProgress, ChefCharacterId } from '../types';
import { LEVELS } from '../data/levels';
import { CHARACTERS } from '../data/characters';
import { sound } from '../utils/audio';
import { RecipeBookModal } from './RecipeBookModal';

interface WorldMapProps {
  progressList: Record<number, LevelProgress>;
  currentLevelId: number;
  characterId: ChefCharacterId;
  onSelectLevel: (level: LevelConfig) => void;
  onBackToMenu: () => void;
  onOpenCharacterSelect: () => void;
}

export const WorldMap: React.FC<WorldMapProps> = ({
  progressList,
  currentLevelId,
  characterId,
  onSelectLevel,
  onBackToMenu,
  onOpenCharacterSelect,
}) => {
  const currentCharacter = CHARACTERS[characterId] || CHARACTERS.cat;
  const [selectedLevelId, setSelectedLevelId] = useState<number>(currentLevelId);
  const [truckPos, setTruckPos] = useState<{ x: number; y: number }>(() => {
    const lvl = LEVELS.find(l => l.id === currentLevelId) || LEVELS[0];
    return lvl.mapPosition;
  });
  const [isDriving, setIsDriving] = useState<boolean>(false);
  const [truckFacingLeft, setTruckFacingLeft] = useState<boolean>(false);
  const [isRecipeOpen, setIsRecipeOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(sound.getMuted());
  const [lockedNotice, setLockedNotice] = useState<string | null>(null);

  const selectedLevel = LEVELS.find(l => l.id === selectedLevelId) || LEVELS[0];
  const progressArray = Object.values(progressList) as LevelProgress[];
  const totalStars = progressArray.reduce((acc, curr) => acc + curr.stars, 0);

  // When selected level changes, animate truck travel
  const handleNodeClick = (level: LevelConfig) => {
    sound.playClick();
    const isUnlocked = progressList[level.id]?.unlocked;

    if (!isUnlocked) {
      sound.playFail();
      setLockedNotice(`🔒 ${level.title} masih terkunci! Dapatkan minimal 1 bintang di Level ${level.id - 1} untuk membuka.`);
      setTimeout(() => setLockedNotice(null), 4000);
      return;
    }

    setLockedNotice(null);
    if (selectedLevelId === level.id) {
      return;
    }

    // Drive truck to this location
    setIsDriving(true);
    sound.playHonk();

    // Determine facing direction
    if (level.mapPosition.x < truckPos.x) {
      setTruckFacingLeft(true);
    } else {
      setTruckFacingLeft(false);
    }

    setSelectedLevelId(level.id);
    setTruckPos(level.mapPosition);

    setTimeout(() => {
      setIsDriving(false);
    }, 950);
  };

  const handleStartSelected = () => {
    sound.playClick();
    sound.playHonk();
    onSelectLevel(selectedLevel);
  };

  return (
    <div className="relative w-full h-full min-h-[600px] flex flex-col bg-slate-900 select-none overflow-hidden font-['Nunito',sans-serif]">
      {/* Top Navigation Header */}
      <header className="z-20 bg-white/95 backdrop-blur-md border-b-2 border-amber-300 px-4 py-2.5 flex items-center justify-between shadow-md">
        {/* Left: Back & Title */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            id="btn-worldmap-back"
            onClick={() => {
              sound.playClick();
              onBackToMenu();
            }}
            className="p-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl transition-all active:scale-95 flex items-center gap-1.5 font-bold text-xs cursor-pointer"
            title="Kembali ke Menu Utama"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Menu</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="p-2 bg-gradient-to-tr from-amber-500 to-orange-500 text-white rounded-xl shadow-xs">
              <Compass className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-black font-['Fredoka'] text-slate-800 leading-tight">
                PETA PETUALANGAN (WORLD MAP)
              </h2>
              <p className="text-[10px] sm:text-xs text-slate-500 font-bold hidden sm:block">
                Pilih titik level, jalankan truk koki, dan dapatkan 3 bintang!
              </p>
            </div>
          </div>
        </div>

        {/* Center/Right: Character Selector in Top Navbar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Character Selector Button */}
          <button
            id="btn-worldmap-character-select"
            onClick={() => {
              sound.playClick();
              onOpenCharacterSelect();
            }}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border-2 border-amber-400 px-2.5 sm:px-3 py-1.5 rounded-2xl shadow-xs transition-transform active:scale-95 text-slate-800 cursor-pointer"
            title="Klik untuk memilih karakter koki"
          >
            <span className="text-xl sm:text-2xl">{currentCharacter.avatar}</span>
            <div className="flex flex-col items-start leading-none text-left">
              <span className="text-xs font-black font-['Fredoka'] text-amber-900">
                {currentCharacter.name}
              </span>
              <span className="text-[9px] text-amber-600 font-bold">
                {currentCharacter.species} • Ganti Karakter
              </span>
            </div>
          </button>

          {/* Total Star Counter */}
          <div className="flex items-center gap-1 bg-amber-50 border border-amber-300 px-3 py-1.5 rounded-2xl text-amber-600">
            <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
            <span className="font-black font-['Fredoka'] text-sm sm:text-base text-amber-900">
              {totalStars} / 15
            </span>
          </div>

          {/* Recipe Book Button */}
          <button
            id="btn-worldmap-recipes"
            onClick={() => {
              sound.playClick();
              setIsRecipeOpen(true);
            }}
            className="p-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-xs flex items-center gap-1 text-xs font-bold transition-all cursor-pointer"
            title="Buku Resep"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden md:inline">Resep</span>
          </button>

          {/* Sound Toggle */}
          <button
            id="btn-worldmap-sound"
            onClick={() => {
              const m = sound.toggleMute();
              setIsMuted(m);
            }}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
            title={isMuted ? 'Nyalakan Suara' : 'Matikan Suara'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
          </button>
        </div>
      </header>

      {/* Main Interactive Map Viewport */}
      <div className="relative flex-1 w-full overflow-hidden bg-gradient-to-b from-sky-200 via-emerald-100 to-amber-100">
        {/* Landscape Decorative Artwork (Mountains, Clouds, Rivers, Islands) */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          {/* Clouds */}
          <div className="absolute top-4 left-10 text-4xl animate-pulse">☁️</div>
          <div className="absolute top-12 left-1/3 text-3xl opacity-70">☁️</div>
          <div className="absolute top-6 right-20 text-5xl">☁️</div>
          {/* Mountains & Nature */}
          <div className="absolute top-24 left-4 text-3xl">🏔️</div>
          <div className="absolute top-20 right-1/4 text-4xl">⛰️</div>
          <div className="absolute bottom-12 left-1/4 text-2xl">🌲</div>
          <div className="absolute bottom-20 left-1/3 text-3xl">🌳</div>
          <div className="absolute bottom-8 right-1/3 text-2xl">🌻</div>
          <div className="absolute bottom-16 right-10 text-3xl">🌴</div>
        </div>

        {/* SVG Roads Connecting the 5 Levels */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <defs>
            <linearGradient id="roadGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="25%" stopColor="#ea580c" />
              <stop offset="50%" stopColor="#dc2626" />
              <stop offset="75%" stopColor="#db2777" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
            <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Road background border */}
          <path
            d="M 14% 68% C 24% 48%, 26% 40%, 34% 38% C 42% 36%, 44% 68%, 54% 72% C 64% 76%, 66% 38%, 74% 36% C 82% 34%, 84% 60%, 89% 64%"
            fill="none"
            stroke="#ffffff"
            strokeWidth="18"
            strokeLinecap="round"
            filter="url(#shadow)"
          />
          {/* Main Road strip */}
          <path
            d="M 14% 68% C 24% 48%, 26% 40%, 34% 38% C 42% 36%, 44% 68%, 54% 72% C 64% 76%, 66% 38%, 74% 36% C 82% 34%, 84% 60%, 89% 64%"
            fill="none"
            stroke="url(#roadGrad)"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Dashed Center Road Markings */}
          <path
            d="M 14% 68% C 24% 48%, 26% 40%, 34% 38% C 42% 36%, 44% 68%, 54% 72% C 64% 76%, 66% 38%, 74% 36% C 82% 34%, 84% 60%, 89% 64%"
            fill="none"
            stroke="#fef08a"
            strokeWidth="3"
            strokeDasharray="8 8"
            strokeLinecap="round"
          />
        </svg>

        {/* Level Stations / Nodes */}
        {LEVELS.map((lvl) => {
          const progress = progressList[lvl.id] || { unlocked: false, stars: 0, highScore: 0 };
          const isSelected = selectedLevelId === lvl.id;
          const isUnlocked = progress.unlocked;

          return (
            <div
              key={lvl.id}
              style={{ left: `${lvl.mapPosition.x}%`, top: `${lvl.mapPosition.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center cursor-pointer group"
              onClick={() => handleNodeClick(lvl)}
            >
              {/* Level Node Pin */}
              <div
                id={`level-node-${lvl.id}`}
                className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 transform group-hover:scale-110 shadow-lg border-3 ${
                  isUnlocked
                    ? isSelected
                      ? 'bg-gradient-to-tr from-amber-400 to-yellow-300 border-white ring-4 ring-amber-500 ring-offset-2 scale-105'
                      : 'bg-white border-amber-400'
                    : 'bg-slate-200 border-slate-300 text-slate-400 opacity-80'
                }`}
              >
                {/* Level Landmark Icon or Lock */}
                {isUnlocked ? (
                  <span className="text-2xl sm:text-3xl">{lvl.theme.icon}</span>
                ) : (
                  <Lock className="w-6 h-6 text-slate-400" />
                )}

                {/* Level Number Pill */}
                <div
                  className={`absolute -top-2.5 bg-gradient-to-r ${lvl.theme.bgGradient} text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs border border-white`}
                >
                  LVL {lvl.id}
                </div>

                {/* Stars earned badge */}
                {isUnlocked && (
                  <div className="absolute -bottom-2 flex items-center gap-0.5 bg-white px-1.5 py-0.5 rounded-full shadow-xs border border-amber-200">
                    {[1, 2, 3].map((starNum) => (
                      <Star
                        key={starNum}
                        className={`w-3 h-3 ${
                          progress.stars >= starNum
                            ? 'fill-amber-400 text-amber-500'
                            : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Level Name Label Underneath */}
              <div className="mt-4 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-xl shadow-xs border border-amber-200 text-center pointer-events-none">
                <span className="text-[11px] font-black text-slate-800 whitespace-nowrap block">
                  {lvl.theme.name}
                </span>
                {progress.highScore > 0 && (
                  <span className="text-[9px] font-bold text-amber-600">
                    High: {progress.highScore} pts
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* Traveling Food Truck Vehicle with Selected Character Driver */}
        <div
          id="vehicle-food-truck"
          style={{
            left: `${truckPos.x}%`,
            top: `${truckPos.y}%`,
            transition: 'left 0.9s cubic-bezier(0.34, 1.56, 0.64, 1), top 0.9s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
          className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none ${
            isDriving ? 'scale-115' : 'scale-100'
          }`}
        >
          {/* Suspension bounce & directional flip */}
          <div
            className={`relative flex flex-col items-center ${
              isDriving ? 'animate-bounce' : 'animate-pulse'
            } ${truckFacingLeft ? 'scale-x-[-1]' : ''}`}
          >
            {/* Overhead Chef Speech Bubble showing Chosen Animal Avatar */}
            <div
              className={`absolute -top-11 bg-white border-2 border-amber-400 px-2 py-0.5 rounded-full shadow-md text-xs font-bold flex items-center gap-1 ${
                truckFacingLeft ? 'scale-x-[-1]' : ''
              }`}
            >
              <span>{currentCharacter.avatar}</span>
              <span className="text-[10px] text-amber-900 font-extrabold">
                {currentCharacter.name} Siap!
              </span>
            </div>

            {/* Food Truck Graphic */}
            <div className="relative bg-gradient-to-r from-red-500 to-amber-500 p-2.5 rounded-2xl shadow-xl border-2 border-white flex items-center justify-center text-white">
              <span className="text-3xl">🚚</span>
              {/* Exhaust Smoke Particle when driving */}
              {isDriving && (
                <span className="absolute -left-3 bottom-0 text-xs animate-ping">💨</span>
              )}
            </div>

            {/* Wheels */}
            <div className="flex gap-4 -mt-1.5">
              <div className="w-3 h-3 bg-slate-800 rounded-full border border-slate-400"></div>
              <div className="w-3 h-3 bg-slate-800 rounded-full border border-slate-400"></div>
            </div>
          </div>
        </div>

        {/* Locked Notification Banner */}
        {lockedNotice && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-rose-500 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-lg border-2 border-white animate-bounce max-w-sm text-center">
            {lockedNotice}
          </div>
        )}

        {/* Bottom Level Inspector Card & Start Level CTA */}
        <div className="absolute bottom-4 left-4 right-4 max-w-2xl mx-auto z-20">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl border-3 border-amber-400 shadow-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Left: Info */}
            <div className="flex items-center gap-3.5 text-left">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner bg-gradient-to-tr ${selectedLevel.theme.bgGradient} text-white`}
              >
                {selectedLevel.theme.icon}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
                    LEVEL {selectedLevel.id}
                  </span>
                  <h3 className="text-lg font-black font-['Fredoka'] text-slate-800">
                    {selectedLevel.title}
                  </h3>
                </div>
                <p className="text-xs text-slate-600 font-medium line-clamp-1 mt-0.5">
                  {selectedLevel.description}
                </p>
                <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500 mt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    {Math.floor(selectedLevel.timeLimit / 60)}m {selectedLevel.timeLimit % 60}s
                  </span>
                  <span>•</span>
                  <span>Target: {selectedLevel.starThresholds[0]} / {selectedLevel.starThresholds[1]} / {selectedLevel.starThresholds[2]} pts</span>
                </div>
              </div>
            </div>

            {/* Right: Enter Kitchen Button */}
            <button
              id="btn-worldmap-start-level"
              onClick={handleStartSelected}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black font-['Fredoka'] text-base rounded-2xl shadow-lg border-b-4 border-emerald-700 active:translate-y-1 active:border-b-0 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>MASUK DAPUR</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recipe Book Modal */}
      <RecipeBookModal isOpen={isRecipeOpen} onClose={() => setIsRecipeOpen(false)} />
    </div>
  );
};
