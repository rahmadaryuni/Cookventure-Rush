import React from 'react';
import { ChefCharacterId, PlayerInventoryItem } from '../types';
import { INGREDIENT_DETAILS } from '../data/recipes';
import { CHARACTERS } from '../data/characters';

interface ChefCharacterSpriteProps {
  characterId: ChefCharacterId;
  facing: 'left' | 'right';
  isMoving?: boolean;
  isChopping?: boolean;
  holdingItem?: PlayerInventoryItem | null;
}

export const ChefCharacterSprite: React.FC<ChefCharacterSpriteProps> = ({
  characterId,
  facing,
  isMoving = false,
  isChopping = false,
  holdingItem,
}) => {
  const char = CHARACTERS[characterId] || CHARACTERS.cat;

  // Custom vector colors & accents per species
  const getTheme = () => {
    switch (characterId) {
      case 'cat':
        return {
          bodyColor: '#f59e0b', // warm ginger cat
          innerEar: '#f472b6',
          bellyColor: '#fef3c7',
          apronColor: '#dc2626', // bright red apron
          hatStripe: '#ef4444',
          earType: 'cat',
        };
      case 'rabbit':
        return {
          bodyColor: '#fbcfe8', // soft pink/white bunny
          innerEar: '#f43f5e',
          bellyColor: '#ffffff',
          apronColor: '#ec4899', // pink apron
          hatStripe: '#f472b6',
          earType: 'rabbit',
        };
      case 'fox':
        return {
          bodyColor: '#ea580c', // vibrant orange fox
          innerEar: '#475569',
          bellyColor: '#ffedd5',
          apronColor: '#16a34a', // forest green apron
          hatStripe: '#ea580c',
          earType: 'fox',
        };
      case 'duck':
        return {
          bodyColor: '#facc15', // yellow duck
          innerEar: '#f97316',
          bellyColor: '#fef08a',
          apronColor: '#0284c7', // ocean blue apron
          hatStripe: '#0ea5e9',
          earType: 'duck',
        };
      case 'bear':
        return {
          bodyColor: '#92400e', // cozy brown bear
          innerEar: '#d97706',
          bellyColor: '#fde68a',
          apronColor: '#b45309', // warm golden-brown apron
          hatStripe: '#78350f',
          earType: 'bear',
        };
      default:
        return {
          bodyColor: '#f59e0b',
          innerEar: '#f472b6',
          bellyColor: '#fef3c7',
          apronColor: '#dc2626',
          hatStripe: '#ef4444',
          earType: 'cat',
        };
    }
  };

  const theme = getTheme();

  return (
    <div className="relative flex flex-col items-center select-none pointer-events-none">
      {/* 1. THOUGHT / HOLDING BUBBLE */}
      {holdingItem && (
        <div
          className={`absolute -top-12 z-50 bg-white border-2 border-amber-500 rounded-2xl px-2 py-1 shadow-lg flex items-center gap-1.5 animate-bounce ${
            facing === 'left' ? 'scale-x-[-1]' : ''
          }`}
        >
          {holdingItem.type === 'ingredient' && holdingItem.ingredient && (
            <div className="flex items-center gap-1">
              <span className="text-xl">
                {INGREDIENT_DETAILS[holdingItem.ingredient]?.icon}
              </span>
              <span className="text-[9px] font-black text-slate-800 whitespace-nowrap">
                {INGREDIENT_DETAILS[holdingItem.ingredient]?.name}
              </span>
            </div>
          )}

          {holdingItem.type === 'plate' && (
            <div className="flex items-center gap-1">
              {holdingItem.completedDish ? (
                <div className="flex items-center gap-1">
                  <span className="text-2xl">{holdingItem.completedDish.icon}</span>
                  <span className="text-[9px] font-black text-emerald-800 whitespace-nowrap">
                    {holdingItem.completedDish.name}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-0.5">
                  <span className="text-base">🍽️</span>
                  {(holdingItem.ingredientsOnPlate || []).map((ing, idx) => (
                    <span key={idx} className="text-xs">
                      {INGREDIENT_DETAILS[ing]?.icon}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 2. MAIN 2D CHEF SPRITE (Vector Art SVG + Animated Parts) */}
      <div
        className={`relative flex flex-col items-center transition-transform ${
          isChopping ? 'animate-bounce' : ''
        }`}
      >
        {/* Real White Chef Toque (Hat) with Puff pleats */}
        <div className="relative z-30 flex flex-col items-center -mb-2">
          {/* Chef Hat Puff Top */}
          <div className="relative flex items-center justify-center">
            <div className="w-10 h-7 bg-white rounded-t-full shadow-md border-2 border-slate-300 relative overflow-hidden">
              {/* Hat vertical pleats */}
              <div className="absolute inset-x-0 bottom-0 h-4 flex justify-around opacity-25">
                <div className="w-0.5 h-full bg-slate-400" />
                <div className="w-0.5 h-full bg-slate-400" />
                <div className="w-0.5 h-full bg-slate-400" />
              </div>
            </div>
            {/* Top crown curve */}
            <div className="absolute -top-1 w-6 h-3 bg-white rounded-t-full border-t border-slate-200" />
          </div>

          {/* Hat Brim Band with decorative colored ribbon */}
          <div className="w-9 h-2 bg-white border border-slate-300 rounded-sm -mt-0.5 shadow-xs flex items-center justify-center">
            <div
              className="w-full h-1 rounded-xs"
              style={{ backgroundColor: theme.hatStripe }}
            />
          </div>
        </div>

        {/* ANIMAL HEAD CONTAINER */}
        <div className="relative z-20 flex flex-col items-center">
          {/* EARS SPECIFIC TO SPECIES */}
          {characterId === 'cat' && (
            <div className="absolute -top-2 w-12 flex justify-between px-0.5 z-10 pointer-events-none">
              {/* Left Ear */}
              <div
                className="w-3.5 h-4 rounded-tl-full border border-amber-600 relative overflow-hidden"
                style={{ backgroundColor: theme.bodyColor }}
              >
                <div className="absolute inset-1 bg-pink-300 rounded-tl-full" />
              </div>
              {/* Right Ear */}
              <div
                className="w-3.5 h-4 rounded-tr-full border border-amber-600 relative overflow-hidden"
                style={{ backgroundColor: theme.bodyColor }}
              >
                <div className="absolute inset-1 bg-pink-300 rounded-tr-full" />
              </div>
            </div>
          )}

          {characterId === 'rabbit' && (
            <div className="absolute -top-6 w-10 flex justify-between px-0.5 z-10 pointer-events-none">
              {/* Left Bunny Ear */}
              <div
                className="w-3 h-7 rounded-t-full border border-pink-400 relative overflow-hidden transform -rotate-6"
                style={{ backgroundColor: theme.bodyColor }}
              >
                <div className="absolute inset-x-0.5 top-1 bottom-0 bg-pink-400/60 rounded-t-full" />
              </div>
              {/* Right Bunny Ear */}
              <div
                className="w-3 h-7 rounded-t-full border border-pink-400 relative overflow-hidden transform rotate-6"
                style={{ backgroundColor: theme.bodyColor }}
              >
                <div className="absolute inset-x-0.5 top-1 bottom-0 bg-pink-400/60 rounded-t-full" />
              </div>
            </div>
          )}

          {characterId === 'fox' && (
            <div className="absolute -top-3 w-12 flex justify-between px-0.5 z-10 pointer-events-none">
              {/* Left Fox Ear */}
              <div
                className="w-4 h-4 rounded-tl-full border border-orange-700 relative overflow-hidden transform -rotate-12"
                style={{ backgroundColor: theme.bodyColor }}
              >
                <div className="absolute top-0 right-0 w-2 h-2 bg-slate-800" />
                <div className="absolute inset-1 bg-white rounded-tl-full" />
              </div>
              {/* Right Fox Ear */}
              <div
                className="w-4 h-4 rounded-tr-full border border-orange-700 relative overflow-hidden transform rotate-12"
                style={{ backgroundColor: theme.bodyColor }}
              >
                <div className="absolute top-0 left-0 w-2 h-2 bg-slate-800" />
                <div className="absolute inset-1 bg-white rounded-tr-full" />
              </div>
            </div>
          )}

          {characterId === 'bear' && (
            <div className="absolute -top-2 w-12 flex justify-between px-0.5 z-10 pointer-events-none">
              {/* Left Round Bear Ear */}
              <div
                className="w-3.5 h-3.5 rounded-full border border-amber-900 relative overflow-hidden"
                style={{ backgroundColor: theme.bodyColor }}
              >
                <div className="absolute inset-0.5 bg-amber-600 rounded-full" />
              </div>
              {/* Right Round Bear Ear */}
              <div
                className="w-3.5 h-3.5 rounded-full border border-amber-900 relative overflow-hidden"
                style={{ backgroundColor: theme.bodyColor }}
              >
                <div className="absolute inset-0.5 bg-amber-600 rounded-full" />
              </div>
            </div>
          )}

          {/* HEAD BASE */}
          <div
            className={`w-13 h-11 rounded-2xl shadow-md border-2 border-white flex items-center justify-center relative overflow-hidden bg-gradient-to-tr ${char.bgGradient}`}
          >
            {/* Big Expressive Animal Face */}
            <span className="text-3xl leading-none transform translate-y-0.5 drop-shadow-xs">
              {char.avatar}
            </span>
          </div>
        </div>

        {/* CHEF BODY & APRON */}
        <div className="relative z-10 -mt-1 flex flex-col items-center">
          {/* Torso with Apron */}
          <div
            className="w-10 h-7 rounded-xl shadow-md border border-white/60 relative flex flex-col items-center justify-between overflow-hidden"
            style={{ backgroundColor: theme.apronColor }}
          >
            {/* Apron Pocket */}
            <div className="w-5 h-2.5 bg-white/25 rounded-b-md border-t border-white/30 -mt-0.5 flex items-center justify-center">
              <span className="text-[7px] text-white font-bold">🍴</span>
            </div>

            {/* Apron Straps */}
            <div className="w-full flex justify-between px-1">
              <div className="w-1 h-3 bg-white/30" />
              <div className="w-1 h-3 bg-white/30" />
            </div>
          </div>

          {/* HANDS & TOOL */}
          <div className="absolute top-1 inset-x-0 -mx-1.5 flex justify-between items-center z-20">
            {/* Left Hand */}
            <div
              className="w-3 h-3 rounded-full border border-slate-400 shadow-xs flex items-center justify-center text-[8px]"
              style={{ backgroundColor: theme.bodyColor }}
            >
              {isChopping ? '🔪' : '🧤'}
            </div>

            {/* Right Hand */}
            <div
              className="w-3 h-3 rounded-full border border-slate-400 shadow-xs flex items-center justify-center text-[8px]"
              style={{ backgroundColor: theme.bodyColor }}
            >
              {isChopping ? '🥕' : '🥄'}
            </div>
          </div>

          {/* FEET / SHOES */}
          <div className="flex gap-2 -mt-0.5 z-0">
            <div className="w-2.5 h-1.5 bg-slate-800 rounded-full border border-slate-600" />
            <div className="w-2.5 h-1.5 bg-slate-800 rounded-full border border-slate-600" />
          </div>
        </div>

        {/* NAME TAG PILL UNDERNEATH */}
        <div className="mt-1 bg-black/60 backdrop-blur-xs text-white px-2 py-0.5 rounded-full border border-amber-400/70 shadow-sm flex items-center gap-1">
          <span className="text-[9px] font-black font-['Fredoka'] tracking-wide">
            {char.name}
          </span>
        </div>
      </div>
    </div>
  );
};
