/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GameScreen, LevelConfig, LevelProgress, GameResultData, ChefCharacterId } from './types';
import { LEVELS } from './data/levels';
import { MainMenu } from './components/MainMenu';
import { WorldMap } from './components/WorldMap';
import { KitchenGame } from './components/KitchenGame';
import { LevelResultModal } from './components/LevelResultModal';
import { CharacterSelectModal } from './components/CharacterSelectModal';
import { sound } from './utils/audio';

const STORAGE_KEY = 'cooking_adventure_progress_v1';
const CHARACTER_KEY = 'cooking_adventure_character_v1';

const INITIAL_PROGRESS: Record<number, LevelProgress> = {
  1: { levelId: 1, unlocked: true, stars: 0, highScore: 0, completedOrders: 0 },
  2: { levelId: 2, unlocked: false, stars: 0, highScore: 0, completedOrders: 0 },
  3: { levelId: 3, unlocked: false, stars: 0, highScore: 0, completedOrders: 0 },
  4: { levelId: 4, unlocked: false, stars: 0, highScore: 0, completedOrders: 0 },
  5: { levelId: 5, unlocked: false, stars: 0, highScore: 0, completedOrders: 0 },
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<GameScreen>('MENU');
  const [currentLevel, setCurrentLevel] = useState<LevelConfig>(LEVELS[0]);
  const [lastResult, setLastResult] = useState<GameResultData | null>(null);

  // Selected Chef Character (Kucing, Kelinci, Rubah, Bebek, Beruang)
  const [selectedCharacter, setSelectedCharacter] = useState<ChefCharacterId>(() => {
    try {
      const saved = localStorage.getItem(CHARACTER_KEY);
      if (saved && ['cat', 'rabbit', 'fox', 'duck', 'bear'].includes(saved)) {
        return saved as ChefCharacterId;
      }
    } catch {
      // ignore
    }
    return 'cat';
  });

  const [isCharacterModalOpen, setIsCharacterModalOpen] = useState<boolean>(false);
  const [sessionKey, setSessionKey] = useState<number>(1);

  const handleSelectCharacter = (id: ChefCharacterId) => {
    setSelectedCharacter(id);
    try {
      localStorage.setItem(CHARACTER_KEY, id);
    } catch {
      // ignore
    }
  };

  // Load progress from localStorage
  const [progressList, setProgressList] = useState<Record<number, LevelProgress>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return INITIAL_PROGRESS;
  });

  // Save progress changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progressList));
    } catch {
      // ignore
    }
  }, [progressList]);

  // Reset progress handler
  const handleResetProgress = () => {
    setProgressList(INITIAL_PROGRESS);
    setCurrentLevel(LEVELS[0]);
    localStorage.removeItem(STORAGE_KEY);
  };

  // When player completes a level
  const handleFinishLevel = (result: GameResultData) => {
    setLastResult(result);
    setCurrentScreen('RESULT');

    // Update level progress if score/stars improved
    setProgressList((prev) => {
      const current = prev[result.levelId] || {
        levelId: result.levelId,
        unlocked: true,
        stars: 0,
        highScore: 0,
        completedOrders: 0,
      };

      const updatedStars = Math.max(current.stars, result.stars);
      const updatedScore = Math.max(current.highScore, result.score);
      const updatedOrders = current.completedOrders + result.completedOrders;

      const nextList: Record<number, LevelProgress> = {
        ...prev,
        [result.levelId]: {
          ...current,
          stars: updatedStars,
          highScore: updatedScore,
          completedOrders: updatedOrders,
        },
      };

      // If finished with at least 1 star and not max level, unlock next level!
      if (result.stars > 0 && result.levelId < 5) {
        const nextId = result.levelId + 1;
        if (nextList[nextId]) {
          nextList[nextId] = {
            ...nextList[nextId],
            unlocked: true,
          };
        }
      }

      return nextList;
    });
  };

  // Next level navigation from Result Modal
  const handleNextLevel = () => {
    if (!lastResult) return;
    const nextLvl = LEVELS.find((l) => l.id === lastResult.levelId + 1);
    if (nextLvl && progressList[nextLvl.id]?.unlocked) {
      setSessionKey((k) => k + 1);
      setCurrentLevel(nextLvl);
      setLastResult(null);
      setCurrentScreen('KITCHEN');
    } else {
      setLastResult(null);
      setCurrentScreen('WORLD_MAP');
    }
  };

  // Restart current level
  const handleRestartLevel = () => {
    setSessionKey((k) => k + 1);
    setLastResult(null);
    setCurrentScreen('KITCHEN');
  };

  // Return to World Map
  const handleReturnToMap = () => {
    setLastResult(null);
    setCurrentScreen('WORLD_MAP');
  };

  return (
    <div className="w-screen h-screen max-w-full max-h-full overflow-hidden flex flex-col bg-slate-900 font-['Nunito',sans-serif]">
      {/* 1. MAIN MENU SCREEN */}
      {currentScreen === 'MENU' && (
        <MainMenu
          onStartGame={() => setCurrentScreen('WORLD_MAP')}
          progressList={progressList}
          characterId={selectedCharacter}
          onResetProgress={handleResetProgress}
          onOpenCharacterSelect={() => setIsCharacterModalOpen(true)}
        />
      )}

      {/* 2. WORLD MAP SCREEN */}
      {currentScreen === 'WORLD_MAP' && (
        <WorldMap
          progressList={progressList}
          currentLevelId={currentLevel.id}
          characterId={selectedCharacter}
          onSelectLevel={(level) => {
            setSessionKey((k) => k + 1);
            setCurrentLevel(level);
            setCurrentScreen('KITCHEN');
          }}
          onBackToMenu={() => setCurrentScreen('MENU')}
          onOpenCharacterSelect={() => setIsCharacterModalOpen(true)}
        />
      )}

      {/* 3. KITCHEN GAMEPLAY SCREEN */}
      {currentScreen === 'KITCHEN' && (
        <KitchenGame
          key={`kitchen-${currentLevel.id}-${sessionKey}`}
          level={currentLevel}
          characterId={selectedCharacter}
          onFinishLevel={handleFinishLevel}
          onExitToMap={() => setCurrentScreen('WORLD_MAP')}
          onOpenCharacterSelect={() => setIsCharacterModalOpen(true)}
          onSelectCharacter={handleSelectCharacter}
          onRestartLevel={handleRestartLevel}
        />
      )}

      {/* 4. LEVEL RESULT MODAL (OVERLAY) */}
      {currentScreen === 'RESULT' && lastResult && (
        <div className="relative w-full h-full">
          {/* Background Map View behind result modal */}
          <WorldMap
            progressList={progressList}
            currentLevelId={currentLevel.id}
            characterId={selectedCharacter}
            onSelectLevel={() => {}}
            onBackToMenu={() => setCurrentScreen('MENU')}
            onOpenCharacterSelect={() => setIsCharacterModalOpen(true)}
          />
          <LevelResultModal
            result={lastResult}
            onReturnToMap={handleReturnToMap}
            onNextLevel={handleNextLevel}
            onRestartLevel={handleRestartLevel}
            hasNextLevel={lastResult.levelId < 5 && !!progressList[lastResult.levelId + 1]?.unlocked}
          />
        </div>
      )}

      {/* 5. GLOBAL CHARACTER SELECT MODAL */}
      <CharacterSelectModal
        isOpen={isCharacterModalOpen}
        onClose={() => setIsCharacterModalOpen(false)}
        selectedId={selectedCharacter}
        onSelectCharacter={handleSelectCharacter}
      />
    </div>
  );
}
