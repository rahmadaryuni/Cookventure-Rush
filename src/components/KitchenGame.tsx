import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Clock, Award, Star, Flame, Utensils, AlertTriangle, 
  Trash2, BookOpen, Pause, Play, CheckCircle2, ChevronRight,
  Sparkles, Volume2, VolumeX, ArrowLeft, HelpCircle, User, RotateCcw
} from 'lucide-react';
import { 
  LevelConfig, ActiveOrder, DishRecipe, IngredientType, 
  PlayerInventoryItem, GameResultData, ChefCharacterId 
} from '../types';
import { INGREDIENT_DETAILS, ALL_RECIPES } from '../data/recipes';
import { CHARACTERS, CHARACTER_LIST } from '../data/characters';
import { sound } from '../utils/audio';
import { RecipeBookModal } from './RecipeBookModal';
import { ChefCharacterSprite } from './ChefCharacterSprite';

interface KitchenGameProps {
  level: LevelConfig;
  characterId: ChefCharacterId;
  onFinishLevel: (result: GameResultData) => void;
  onExitToMap: () => void;
  onOpenCharacterSelect: () => void;
  onSelectCharacter?: (id: ChefCharacterId) => void;
  onRestartLevel?: () => void;
}

interface KitchenStation {
  id: string;
  name: string;
  type: 'ingredient' | 'chopping' | 'pan' | 'pot' | 'oven' | 'plate_dispenser' | 'counter' | 'delivery' | 'trash';
  ingredientType?: IngredientType;
  x: number; // grid col (0 to 9)
  y: number; // grid row (0 to 6)
  holdingItem?: PlayerInventoryItem;
  // Cooking state
  progress?: number; // 0 to 100
  isCooking?: boolean;
  isReady?: boolean;
  isBurnt?: boolean;
  burnTimer?: number;
}

export const KitchenGame: React.FC<KitchenGameProps> = ({
  level,
  characterId,
  onFinishLevel,
  onExitToMap,
  onOpenCharacterSelect,
  onSelectCharacter,
  onRestartLevel,
}) => {
  const currentCharacter = CHARACTERS[characterId] || CHARACTERS.cat;

  // Game state
  const [timeLeft, setTimeLeft] = useState<number>(level.timeLimit);
  const [score, setScore] = useState<number>(0);
  const [completedOrders, setCompletedOrders] = useState<number>(0);
  const [failedOrders, setFailedOrders] = useState<number>(0);
  const [combo, setCombo] = useState<number>(1);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(sound.getMuted());
  const [isRecipeOpen, setIsRecipeOpen] = useState<boolean>(false);
  const [floatingPoints, setFloatingPoints] = useState<Array<{ id: number; text: string; x: number; y: number; color: string }>>([]);

  // Active Customer Orders
  const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>([]);

  // Player / Chef state
  const [chefPos, setChefPos] = useState<{ x: number; y: number }>({ x: 4, y: 3 });
  const [chefFacing, setChefFacing] = useState<'left' | 'right'>('right');
  const [chefHolding, setChefHolding] = useState<PlayerInventoryItem | null>(null);
  const [isChopping, setIsChopping] = useState<boolean>(false);

  // Dynamic Kitchen Stations initialized according to level requirements
  const [stations, setStations] = useState<KitchenStation[]>(() => {
    const rawList = level.rawIngredients;
    const initialStations: KitchenStation[] = [];

    // Row 0: Top Counters (Chopping, Pans, Oven/Pot)
    initialStations.push({ id: 'chop-1', name: 'Meja Potong 1', type: 'chopping', x: 2, y: 0, progress: 0 });
    initialStations.push({ id: 'chop-2', name: 'Meja Potong 2', type: 'chopping', x: 3, y: 0, progress: 0 });
    initialStations.push({ id: 'pan-1', name: 'Wajan Kompor 1', type: 'pan', x: 4, y: 0, progress: 0 });
    initialStations.push({ id: 'pan-2', name: 'Wajan Kompor 2', type: 'pan', x: 5, y: 0, progress: 0 });
    initialStations.push({ id: 'pot-1', name: 'Panci Rebus', type: 'pot', x: 6, y: 0, progress: 0 });
    initialStations.push({ id: 'oven-1', name: 'Oven Panggang', type: 'oven', x: 7, y: 0, progress: 0 });

    // Left Column: Ingredient Crates
    rawList.slice(0, 4).forEach((ing, idx) => {
      initialStations.push({
        id: `crate-${ing}`,
        name: INGREDIENT_DETAILS[ing]?.name || ing,
        type: 'ingredient',
        ingredientType: ing,
        x: 0,
        y: idx + 1,
      });
    });

    // Right Column: Delivery Hatch & Assembly Counters & Extra Ingredients
    initialStations.push({ id: 'delivery-1', name: 'Meja Pelanggan', type: 'delivery', x: 9, y: 1 });
    initialStations.push({ id: 'delivery-2', name: 'Meja Pelanggan', type: 'delivery', x: 9, y: 2 });
    initialStations.push({ id: 'plates-1', name: 'Rak Piring Bersih', type: 'plate_dispenser', x: 9, y: 3 });

    if (rawList.length > 4) {
      rawList.slice(4).forEach((ing, idx) => {
        initialStations.push({
          id: `crate-extra-${ing}`,
          name: INGREDIENT_DETAILS[ing]?.name || ing,
          type: 'ingredient',
          ingredientType: ing,
          x: 9,
          y: idx + 4,
        });
      });
    }

    // Bottom Row: Prep Counters & Trash Can
    initialStations.push({ id: 'trash-1', name: 'Tong Sampah', type: 'trash', x: 1, y: 5 });
    initialStations.push({ id: 'counter-1', name: 'Meja Rakit 1', type: 'counter', x: 3, y: 5 });
    initialStations.push({ id: 'counter-2', name: 'Meja Rakit 2', type: 'counter', x: 4, y: 5 });
    initialStations.push({ id: 'counter-3', name: 'Meja Rakit 3', type: 'counter', x: 5, y: 5 });
    initialStations.push({ id: 'counter-4', name: 'Meja Rakit 4', type: 'counter', x: 6, y: 5 });

    return initialStations;
  });

  // Spawn initial orders
  useEffect(() => {
    const recipes = level.availableRecipes;
    const initial: ActiveOrder[] = [];
    const maxOrders = Math.min(3, recipes.length);

    for (let i = 0; i < maxOrders; i++) {
      const r = recipes[i % recipes.length];
      initial.push({
        orderId: `order-${Date.now()}-${i}`,
        recipeId: r.id,
        recipe: r,
        totalTime: 50,
        remainingTime: 50,
        createdAt: Date.now(),
      });
    }
    setActiveOrders(initial);
  }, [level]);

  // Handle Game Finish / Time Up
  const handleTimeUp = useCallback(() => {
    let stars = 0;
    if (score >= level.starThresholds[2]) stars = 3;
    else if (score >= level.starThresholds[1]) stars = 2;
    else if (score >= level.starThresholds[0]) stars = 1;

    const isNewUnlock = stars > 0 && level.id < 5;
    const unlockedLevelId = isNewUnlock ? level.id + 1 : undefined;

    const result: GameResultData = {
      levelId: level.id,
      levelTitle: level.title,
      score,
      completedOrders,
      failedOrders,
      stars,
      isNewUnlock,
      unlockedLevelId,
    };

    onFinishLevel(result);
  }, [score, completedOrders, failedOrders, level, onFinishLevel]);

  // Keep latest handleTimeUp in ref to avoid stale closures in setInterval
  const handleTimeUpRef = useRef(handleTimeUp);
  useEffect(() => {
    handleTimeUpRef.current = handleTimeUp;
  });

  // Main Game Clock Loop (1 second tick)
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeUpRef.current();
          return 0;
        }
        return prev - 1;
      });

      // Update Order patience timers
      setActiveOrders((prevOrders) => {
        const updated: ActiveOrder[] = [];
        let newlyFailed = 0;

        for (const ord of prevOrders) {
          const nextRemain = ord.remainingTime - 1;
          if (nextRemain <= 0) {
            newlyFailed += 1;
            sound.playFail();
          } else {
            updated.push({ ...ord, remainingTime: nextRemain });
          }
        }

        if (newlyFailed > 0) {
          setFailedOrders((f) => f + newlyFailed);
          setCombo(1);
          setScore((s) => Math.max(0, s - newlyFailed * 30));
        }

        // Replenish order if fewer than 3
        if (updated.length < 3) {
          const recipes = level.availableRecipes;
          const randomRecipe = recipes[Math.floor(Math.random() * recipes.length)];
          updated.push({
            orderId: `order-${Date.now()}-${Math.random()}`,
            recipeId: randomRecipe.id,
            recipe: randomRecipe,
            totalTime: 45 + Math.floor(Math.random() * 15),
            remainingTime: 45 + Math.floor(Math.random() * 15),
            createdAt: Date.now(),
          });
        }

        return updated;
      });

      // Update Cooking Stations progress & burning
      setStations((prevStations) => {
        return prevStations.map((st) => {
          // Pan cooking (Meat / Pancake)
          if (st.type === 'pan' && st.holdingItem) {
            if (!st.isReady && !st.isBurnt) {
              const nextProg = (st.progress || 0) + 15;
              if (nextProg >= 100) {
                sound.playDing();
                const currentIng = st.holdingItem.ingredient;
                let cookedIng: IngredientType = 'meat_cooked';
                if (currentIng === 'flour') {
                  cookedIng = 'flour'; // cooked pancake
                }
                return {
                  ...st,
                  progress: 100,
                  isReady: true,
                  burnTimer: 12, // 12 seconds until burning!
                  holdingItem: {
                    type: 'ingredient',
                    ingredient: cookedIng,
                  },
                };
              }
              sound.playSizzle();
              return { ...st, progress: nextProg };
            } else if (st.isReady && !st.isBurnt && (st.burnTimer || 0) > 0) {
              const nextBurn = (st.burnTimer || 1) - 1;
              if (nextBurn <= 0) {
                sound.playFail();
                return { ...st, isBurnt: true, burnTimer: 0 };
              }
              return { ...st, burnTimer: nextBurn };
            }
          }

          // Pot boiling (Noodles / Egg / Soup)
          if (st.type === 'pot' && st.holdingItem) {
            if (!st.isReady) {
              const nextProg = (st.progress || 0) + 18;
              if (nextProg >= 100) {
                sound.playDing();
                const cur = st.holdingItem.ingredient;
                let boiled: IngredientType = 'noodles_boiled';
                if (cur === 'egg') boiled = 'egg_boiled';
                if (cur === 'meat_chopped' || cur === 'lettuce_chopped') boiled = 'soup_base';
                return {
                  ...st,
                  progress: 100,
                  isReady: true,
                  holdingItem: {
                    type: 'ingredient',
                    ingredient: boiled,
                  },
                };
              }
              return { ...st, progress: nextProg };
            }
          }

          // Oven baking (Pizza / Cake)
          if (st.type === 'oven' && st.holdingItem) {
            if (!st.isReady) {
              const nextProg = (st.progress || 0) + 14;
              if (nextProg >= 100) {
                sound.playDing();
                return {
                  ...st,
                  progress: 100,
                  isReady: true,
                };
              }
              return { ...st, progress: nextProg };
            }
          }

          return st;
        });
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, level.availableRecipes]);

  // Reset clock and basic state when level changes
  useEffect(() => {
    setTimeLeft(level.timeLimit);
    setScore(0);
    setCompletedOrders(0);
    setFailedOrders(0);
    setCombo(1);
    setChefHolding(null);
    setChefPos({ x: 4, y: 3 });
  }, [level.id, level.timeLimit]);

  // Check if plate matches any dish recipe
  const checkDishFormation = (ingredients: IngredientType[]): DishRecipe | undefined => {
    for (const recipe of Object.values(ALL_RECIPES)) {
      if (recipe.requiredIngredients.length !== ingredients.length) continue;
      
      const reqSorted = [...recipe.requiredIngredients].sort();
      const ingSorted = [...ingredients].sort();

      const match = reqSorted.every((val, index) => val === ingSorted[index]);
      if (match) return recipe;
    }
    return undefined;
  };

  // Add floating points visual feedback
  const triggerPointsFeedback = (text: string, x: number, y: number, color: string = 'text-emerald-500') => {
    const id = Date.now() + Math.random();
    setFloatingPoints((prev) => [...prev, { id, text, x, y, color }]);
    setTimeout(() => {
      setFloatingPoints((prev) => prev.filter((item) => item.id !== id));
    }, 1200);
  };

  // Interact with a station
  const interactWithStation = (station: KitchenStation) => {
    // 1. INGREDIENT CRATE
    if (station.type === 'ingredient' && station.ingredientType) {
      if (!chefHolding) {
        setChefHolding({
          type: 'ingredient',
          ingredient: station.ingredientType,
        });
        sound.playPick();
      }
      return;
    }

    // 2. PLATE DISPENSER
    if (station.type === 'plate_dispenser') {
      if (!chefHolding) {
        setChefHolding({
          type: 'plate',
          ingredientsOnPlate: [],
        });
        sound.playPick();
      }
      return;
    }

    // 3. TRASH CAN
    if (station.type === 'trash') {
      if (chefHolding) {
        setChefHolding(null);
        sound.playDrop();
        triggerPointsFeedback('Dibuang 🗑️', chefPos.x, chefPos.y, 'text-slate-400');
      }
      return;
    }

    // 4. CHOPPING BOARD
    if (station.type === 'chopping') {
      // If holding chopable item and board is empty
      if (chefHolding?.type === 'ingredient' && !station.holdingItem) {
        const raw = chefHolding.ingredient;
        const chopable = ['meat', 'lettuce', 'tomato', 'cheese', 'fruit'];
        if (raw && chopable.includes(raw)) {
          setStations((prev) =>
            prev.map((s) =>
              s.id === station.id
                ? { ...s, holdingItem: chefHolding, progress: 0 }
                : s
            )
          );
          setChefHolding(null);
          sound.playPlace();
          return;
        }
      }

      // If board has item and player interacts with empty hands
      if (station.holdingItem && !chefHolding) {
        // If chopped completely (progress >= 100), pick it up
        if ((station.progress || 0) >= 100) {
          setChefHolding(station.holdingItem);
          setStations((prev) =>
            prev.map((s) =>
              s.id === station.id
                ? { ...s, holdingItem: undefined, progress: 0 }
                : s
            )
          );
          sound.playPick();
          return;
        }

        // Perform chop action!
        setIsChopping(true);
        sound.playChop();
        setTimeout(() => setIsChopping(false), 200);

        const newProg = (station.progress || 0) + 34;
        if (newProg >= 100) {
          const raw = station.holdingItem.ingredient;
          let chopped: IngredientType = 'meat_chopped';
          if (raw === 'lettuce') chopped = 'lettuce_chopped';
          if (raw === 'tomato') chopped = 'tomato_chopped';
          if (raw === 'cheese') chopped = 'cheese_chopped';
          if (raw === 'fruit') chopped = 'fruit_chopped';

          setStations((prev) =>
            prev.map((s) =>
              s.id === station.id
                ? {
                    ...s,
                    progress: 100,
                    holdingItem: { type: 'ingredient', ingredient: chopped },
                  }
                : s
            )
          );
          sound.playDing();
        } else {
          setStations((prev) =>
            prev.map((s) =>
              s.id === station.id ? { ...s, progress: newProg } : s
            )
          );
        }
        return;
      }
    }

    // 5. STOVE PAN (Fry Patty / Meat / Pancake)
    if (station.type === 'pan') {
      if (chefHolding?.type === 'ingredient' && !station.holdingItem) {
        const ing = chefHolding.ingredient;
        if (ing === 'meat_chopped' || ing === 'flour') {
          setStations((prev) =>
            prev.map((s) =>
              s.id === station.id
                ? {
                    ...s,
                    holdingItem: chefHolding,
                    progress: 0,
                    isReady: false,
                    isBurnt: false,
                    burnTimer: undefined,
                  }
                : s
            )
          );
          setChefHolding(null);
          sound.playPlace();
          sound.playSizzle();
          return;
        }
      }

      if (station.holdingItem && !chefHolding) {
        setChefHolding(station.holdingItem);
        setStations((prev) =>
          prev.map((s) =>
            s.id === station.id
              ? {
                  ...s,
                  holdingItem: undefined,
                  progress: 0,
                  isReady: false,
                  isBurnt: false,
                  burnTimer: undefined,
                }
              : s
          )
        );
        sound.playPick();
        return;
      }
    }

    // 6. BOILING POT (Mie / Telur / Sup)
    if (station.type === 'pot') {
      if (chefHolding?.type === 'ingredient' && !station.holdingItem) {
        const ing = chefHolding.ingredient;
        if (ing === 'noodles' || ing === 'egg' || ing === 'meat_chopped' || ing === 'lettuce_chopped') {
          setStations((prev) =>
            prev.map((s) =>
              s.id === station.id
                ? {
                    ...s,
                    holdingItem: chefHolding,
                    progress: 0,
                    isReady: false,
                  }
                : s
            )
          );
          setChefHolding(null);
          sound.playPlace();
          return;
        }
      }

      if (station.holdingItem && !chefHolding) {
        setChefHolding(station.holdingItem);
        setStations((prev) =>
          prev.map((s) =>
            s.id === station.id
              ? { ...s, holdingItem: undefined, progress: 0, isReady: false }
              : s
          )
        );
        sound.playPick();
        return;
      }
    }

    // 7. OVEN (Pizza / Cake)
    if (station.type === 'oven') {
      if (chefHolding?.type === 'plate' && !station.holdingItem) {
        const ingredients = chefHolding.ingredientsOnPlate || [];
        if (ingredients.includes('dough') || ingredients.includes('flour')) {
          setStations((prev) =>
            prev.map((s) =>
              s.id === station.id
                ? {
                    ...s,
                    holdingItem: chefHolding,
                    progress: 0,
                    isReady: false,
                  }
                : s
            )
          );
          setChefHolding(null);
          sound.playPlace();
          return;
        }
      }

      if (station.holdingItem && !chefHolding) {
        const plate = station.holdingItem;
        const ingredients = plate.ingredientsOnPlate || [];
        const finishedDish = checkDishFormation(ingredients);

        setChefHolding({
          ...plate,
          completedDish: finishedDish,
        });
        setStations((prev) =>
          prev.map((s) =>
            s.id === station.id
              ? { ...s, holdingItem: undefined, progress: 0, isReady: false }
              : s
          )
        );
        sound.playPick();
        return;
      }
    }

    // 8. ASSEMBLY COUNTER
    if (station.type === 'counter') {
      if (station.holdingItem?.type === 'plate' && chefHolding?.type === 'ingredient' && chefHolding.ingredient) {
        const currentIngs = station.holdingItem.ingredientsOnPlate || [];
        const newIngs = [...currentIngs, chefHolding.ingredient];
        const formedDish = checkDishFormation(newIngs);

        setStations((prev) =>
          prev.map((s) =>
            s.id === station.id
              ? {
                  ...s,
                  holdingItem: {
                    type: 'plate',
                    ingredientsOnPlate: newIngs,
                    completedDish: formedDish,
                  },
                }
              : s
          )
        );
        setChefHolding(null);
        sound.playPlace();
        if (formedDish) {
          sound.playDing();
          triggerPointsFeedback(`Selesai: ${formedDish.name}!`, station.x, station.y, 'text-amber-500');
        }
        return;
      }

      if (!station.holdingItem && chefHolding) {
        setStations((prev) =>
          prev.map((s) => (s.id === station.id ? { ...s, holdingItem: chefHolding } : s))
        );
        setChefHolding(null);
        sound.playPlace();
        return;
      }

      if (station.holdingItem && !chefHolding) {
        setChefHolding(station.holdingItem);
        setStations((prev) =>
          prev.map((s) => (s.id === station.id ? { ...s, holdingItem: undefined } : s))
        );
        sound.playPick();
        return;
      }

      if (chefHolding?.type === 'plate' && station.holdingItem?.type === 'ingredient' && station.holdingItem.ingredient) {
        const currentIngs = chefHolding.ingredientsOnPlate || [];
        const newIngs = [...currentIngs, station.holdingItem.ingredient];
        const formedDish = checkDishFormation(newIngs);

        setChefHolding({
          type: 'plate',
          ingredientsOnPlate: newIngs,
          completedDish: formedDish,
        });
        setStations((prev) =>
          prev.map((s) => (s.id === station.id ? { ...s, holdingItem: undefined } : s))
        );
        sound.playPlace();
        if (formedDish) {
          sound.playDing();
          triggerPointsFeedback(`Selesai: ${formedDish.name}!`, chefPos.x, chefPos.y, 'text-amber-500');
        }
        return;
      }
    }

    // 9. DELIVERY COUNTER
    if (station.type === 'delivery') {
      if (chefHolding?.type === 'plate') {
        const dish = chefHolding.completedDish;
        if (!dish) {
          sound.playFail();
          triggerPointsFeedback('Makanan Belum Lengkap!', station.x, station.y, 'text-rose-500');
          return;
        }

        const matchingOrderIndex = activeOrders.findIndex(
          (o) => o.recipeId === dish.id
        );

        if (matchingOrderIndex !== -1) {
          const matchedOrder = activeOrders[matchingOrderIndex];
          const speedBonus = matchedOrder.remainingTime > 20 ? 40 : 10;
          const comboBonus = combo * 15;
          const earned = dish.score + speedBonus + comboBonus;

          sound.playServe();
          setScore((s) => s + earned);
          setCompletedOrders((c) => c + 1);
          setCombo((c) => Math.min(c + 1, 4));

          triggerPointsFeedback(
            `+${earned} Poin! (${combo}x Combo)`,
            station.x,
            station.y,
            'text-emerald-600'
          );

          setChefHolding(null);

          setActiveOrders((prev) => {
            const copy = [...prev];
            copy.splice(matchingOrderIndex, 1);
            return copy;
          });
        } else {
          sound.playFail();
          triggerPointsFeedback('Pesanan Tidak Sesuai!', station.x, station.y, 'text-rose-500');
        }
      }
    }
  };

  // Find nearest station adjacent to chef
  const findAdjacentStation = useCallback((pos: { x: number; y: number }): KitchenStation | undefined => {
    return stations.find((st) => {
      const dx = Math.abs(st.x - pos.x);
      const dy = Math.abs(st.y - pos.y);
      return (dx <= 1 && dy === 0) || (dy <= 1 && dx === 0);
    });
  }, [stations]);

  // Keyboard navigation & controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle pause with Escape or P key
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        sound.playClick();
        setIsPaused((prev) => !prev);
        return;
      }

      if (isPaused) return;

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        setChefPos((p) => ({ ...p, y: Math.max(1, p.y - 1) }));
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        setChefPos((p) => ({ ...p, y: Math.min(4, p.y + 1) }));
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        setChefPos((p) => ({ ...p, x: Math.max(1, p.x - 1) }));
        setChefFacing('left');
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        setChefPos((p) => ({ ...p, x: Math.min(8, p.x + 1) }));
        setChefFacing('right');
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        const nearbyStation = findAdjacentStation(chefPos);
        if (nearbyStation) {
          interactWithStation(nearbyStation);
        }
      } else if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        const nearbyStation = findAdjacentStation(chefPos);
        if (nearbyStation) {
          interactWithStation(nearbyStation);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [chefPos, chefHolding, stations, activeOrders, isPaused, findAdjacentStation]);

  // Click directly on a station: Chef walks there and interacts
  const handleStationClick = (st: KitchenStation) => {
    if (isPaused) return;

    let targetX = st.x;
    let targetY = st.y;

    if (st.y === 0) targetY = 1;
    else if (st.y >= 5) targetY = 4;
    else if (st.x === 0) targetX = 1;
    else if (st.x >= 9) targetX = 8;

    targetX = Math.max(1, Math.min(8, targetX));
    targetY = Math.max(1, Math.min(4, targetY));

    if (targetX < chefPos.x) setChefFacing('left');
    if (targetX > chefPos.x) setChefFacing('right');

    setChefPos({ x: targetX, y: targetY });

    setTimeout(() => {
      interactWithStation(st);
    }, 150);
  };

  // Dynamic context action hint based on adjacent station
  const adjacentStation = findAdjacentStation(chefPos);

  const getDynamicContextHint = () => {
    if (!adjacentStation) {
      return {
        icon: '🚶',
        title: 'Gerak',
        actionText: 'Gunakan [W][A][S][D] atau [Panah] untuk berjalan mendekati stasiun!',
        badgeColor: 'bg-amber-800 text-amber-200 border-amber-600',
      };
    }

    if (adjacentStation.type === 'chopping') {
      if (adjacentStation.holdingItem) {
        if ((adjacentStation.progress || 0) >= 100) {
          return {
            icon: '✨',
            title: 'Ambil Hasil Potong',
            actionText: 'Bahan sudah dipotong! Tekan [SPASI] atau klik stasiun untuk mengambilnya.',
            badgeColor: 'bg-emerald-700 text-emerald-100 border-emerald-500 animate-pulse',
          };
        }
        return {
          icon: '🔪',
          title: 'POTONG BAHAN',
          actionText: 'Tekan [E] berkali-kali untuk memotong bahan di meja potong!',
          badgeColor: 'bg-orange-600 text-white border-orange-400 animate-bounce',
        };
      }
      return {
        icon: '🔪',
        title: 'Meja Potong',
        actionText: 'Bawa daging mentah / sayur ke sini lalu tekan [SPASI] untuk meletakkan.',
        badgeColor: 'bg-amber-700 text-amber-100 border-amber-500',
      };
    }

    if (adjacentStation.type === 'pan') {
      if (adjacentStation.isReady) {
        return {
          icon: '🔥',
          title: 'ANGKAT MASAKAN!',
          actionText: 'Masakan matang! Tekan [SPASI] sebelum gosong!',
          badgeColor: 'bg-rose-600 text-white border-rose-400 animate-pulse',
        };
      }
      if (adjacentStation.holdingItem) {
        return {
          icon: '🍳',
          title: 'Sedang Menggoreng...',
          actionText: 'Tunggu progress bar penuh hingga matang!',
          badgeColor: 'bg-amber-700 text-amber-100 border-amber-500',
        };
      }
      return {
        icon: '🍳',
        title: 'Wajan Kompor',
        actionText: 'Bawa daging cincang / adonan lalu tekan [SPASI] untuk memasak!',
        badgeColor: 'bg-amber-700 text-amber-100 border-amber-500',
      };
    }

    if (adjacentStation.type === 'pot') {
      if (adjacentStation.isReady) {
        return {
          icon: '🍲',
          title: 'ANGKAT REBUSAN!',
          actionText: 'Mie/Telur/Sup matang! Tekan [SPASI] untuk mengambil.',
          badgeColor: 'bg-cyan-700 text-white border-cyan-500 animate-pulse',
        };
      }
      return {
        icon: '🍲',
        title: 'Panci Rebus',
        actionText: 'Bawa mie / telur / sayur potong lalu tekan [SPASI] untuk merebus!',
        badgeColor: 'bg-cyan-800 text-cyan-100 border-cyan-600',
      };
    }

    if (adjacentStation.type === 'oven') {
      if (adjacentStation.isReady) {
        return {
          icon: '🍕',
          title: 'ANGKAT PANGGANGAN!',
          actionText: 'Pizza/Kue matang! Tekan [SPASI] untuk mengambil dari oven.',
          badgeColor: 'bg-orange-600 text-white border-orange-400 animate-pulse',
        };
      }
      return {
        icon: '🚪',
        title: 'Oven Panggang',
        actionText: 'Bawa piring dengan adonan pizza/kue lalu tekan [SPASI] untuk memanggang!',
        badgeColor: 'bg-stone-700 text-stone-100 border-stone-500',
      };
    }

    if (adjacentStation.type === 'delivery') {
      return {
        icon: '🛎️',
        title: 'MEJA PELANGGAN',
        actionText: 'Bawa makanan lengkap di atas piring, tekan [SPASI] untuk mengantar!',
        badgeColor: 'bg-emerald-600 text-white border-emerald-400',
      };
    }

    if (adjacentStation.type === 'plate_dispenser') {
      return {
        icon: '🍽️',
        title: 'Rak Piring Bersih',
        actionText: 'Tekan [SPASI] untuk mengambil piring saji kosong.',
        badgeColor: 'bg-blue-700 text-blue-100 border-blue-500',
      };
    }

    if (adjacentStation.type === 'counter') {
      return {
        icon: '🪵',
        title: 'Meja Rakit / Persiapan',
        actionText: 'Tekan [SPASI] untuk menaruh atau merakit bahan ke atas piring!',
        badgeColor: 'bg-amber-700 text-amber-100 border-amber-500',
      };
    }

    if (adjacentStation.type === 'ingredient') {
      return {
        icon: '📦',
        title: `Peti ${adjacentStation.name}`,
        actionText: `Tekan [SPASI] untuk mengambil ${adjacentStation.name}.`,
        badgeColor: 'bg-amber-700 text-amber-100 border-amber-500',
      };
    }

    if (adjacentStation.type === 'trash') {
      return {
        icon: '🗑️',
        title: 'Tong Sampah',
        actionText: 'Tekan [SPASI] untuk membuang barang yang salah di tangan koki.',
        badgeColor: 'bg-rose-700 text-rose-100 border-rose-500',
      };
    }

    return {
      icon: '💡',
      title: 'Aksi',
      actionText: 'Tekan [SPASI] untuk berinteraksi.',
      badgeColor: 'bg-amber-800 text-amber-200 border-amber-600',
    };
  };

  const contextHint = getDynamicContextHint();

  // Time format MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative w-full h-full min-h-[620px] flex flex-col bg-amber-950 text-slate-800 select-none overflow-hidden font-['Nunito',sans-serif]">
      {/* 1. TOP STATUS BAR (Orders, Timer, Score, Character, Combo) */}
      <div className="z-20 bg-amber-900/95 border-b-2 border-amber-700 px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2 shadow-md">
        {/* Left: Exit to Map & Level Info & Character Badge */}
        <div className="flex items-center gap-2">
          <button
            id="btn-kitchen-exit"
            onClick={() => {
              sound.playClick();
              onExitToMap();
            }}
            className="p-2 bg-amber-800 hover:bg-amber-700 text-amber-100 rounded-xl transition-all font-bold text-xs flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Peta</span>
          </button>

          {/* Quick Animal Character Switcher Bar */}
          <div className="flex items-center gap-1 bg-amber-950/80 p-1 rounded-2xl border border-amber-600/70 shadow-inner">
            {CHARACTER_LIST.map((char) => {
              const isSelected = char.id === characterId;
              return (
                <button
                  key={char.id}
                  id={`quick-char-${char.id}`}
                  onClick={() => {
                    sound.playPick();
                    if (onSelectCharacter) onSelectCharacter(char.id);
                  }}
                  className={`relative p-1 sm:p-1.5 rounded-xl text-lg sm:text-xl transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-400 scale-110 shadow-md ring-2 ring-white z-10'
                      : 'hover:bg-white/20 opacity-65 hover:opacity-100'
                  }`}
                  title={`Ganti ke ${char.name} (${char.species})`}
                >
                  <span>{char.avatar}</span>
                  {isSelected && (
                    <span className="absolute -top-1 -right-1 text-[8px] bg-emerald-600 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center font-black border border-white leading-none shadow-xs">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Character Name Badge & Modal Trigger */}
          <button
            id="btn-kitchen-character-select"
            onClick={() => {
              sound.playClick();
              onOpenCharacterSelect();
            }}
            className="hidden xl:flex items-center gap-1.5 bg-amber-800/90 hover:bg-amber-700/90 border border-amber-600/80 px-2.5 py-1 rounded-xl shadow-xs transition-transform active:scale-95 text-white cursor-pointer"
            title="Buka Menu Karakter"
          >
            <span className="text-xs font-black font-['Fredoka']">
              {currentCharacter.name} ({currentCharacter.species})
            </span>
          </button>

          <div className="bg-amber-800/80 px-2.5 py-1 rounded-xl border border-amber-600/50 hidden lg:block">
            <span className="text-xs font-black text-amber-200">{level.title}</span>
          </div>
        </div>

        {/* Center: Active Orders Tickets Rail */}
        <div className="flex items-center gap-2 overflow-x-auto py-1 max-w-xl">
          {activeOrders.map((ord) => {
            const pct = Math.max(0, (ord.remainingTime / ord.totalTime) * 100);
            const isUrgent = ord.remainingTime <= 15;

            return (
              <div
                key={ord.orderId}
                className={`relative bg-amber-50 rounded-xl border-2 p-1.5 sm:p-2 min-w-[125px] sm:min-w-[145px] shadow-md transition-all ${
                  isUrgent
                    ? 'border-rose-500 bg-rose-50 animate-pulse'
                    : 'border-amber-300'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-1">
                    <span className="text-xl">{ord.recipe.icon}</span>
                    <span className="text-[11px] font-black text-slate-800 truncate max-w-[80px]">
                      {ord.recipe.name}
                    </span>
                  </div>
                  <span className="text-[10px] font-black text-amber-700 bg-amber-100 px-1 py-0.5 rounded-md">
                    +{ord.recipe.score}
                  </span>
                </div>

                {/* Ingredients checklist pills */}
                <div className="flex flex-wrap gap-1 mb-1">
                  {ord.recipe.requiredIngredients.map((ingKey, i) => (
                    <span
                      key={i}
                      className="text-[9px] bg-white border border-amber-200 px-1 rounded-md text-slate-600 font-bold"
                    >
                      {INGREDIENT_DETAILS[ingKey]?.icon || '🍴'}
                    </span>
                  ))}
                </div>

                {/* Patience Bar */}
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ${
                      pct > 50
                        ? 'bg-emerald-500'
                        : pct > 25
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Timer & Score & Help */}
        <div className="flex items-center gap-2">
          {combo > 1 && (
            <div className="bg-amber-500 text-white font-black text-xs px-2 py-1 rounded-xl animate-bounce shadow-xs">
              {combo}x COMBO!
            </div>
          )}

          {/* Score */}
          <div className="bg-amber-950/80 border border-amber-600 px-2.5 py-1 rounded-xl text-center">
            <span className="text-[10px] uppercase tracking-wider text-amber-300 font-bold block">Skor</span>
            <span className="text-base sm:text-lg font-black font-['Fredoka'] text-amber-400 leading-tight">
              {score}
            </span>
          </div>

          {/* Timer */}
          <div
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl border font-black font-['Fredoka'] text-sm sm:text-base ${
              timeLeft <= 30
                ? 'bg-rose-900 border-rose-500 text-rose-300 animate-pulse'
                : 'bg-amber-800 border-amber-600 text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{formatTime(timeLeft)}</span>
          </div>

          {/* Pause Button */}
          <button
            id="btn-kitchen-pause"
            onClick={() => {
              sound.playClick();
              setIsPaused((p) => !p);
            }}
            className={`px-2.5 py-1.5 rounded-xl shadow-xs border transition-all active:scale-95 flex items-center gap-1.5 font-black font-['Fredoka'] text-xs cursor-pointer ${
              isPaused
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 ring-2 ring-emerald-300'
                : 'bg-amber-800 hover:bg-amber-700 text-white border-amber-600'
            }`}
            title="Jeda Permainan (Tekan P atau ESC)"
          >
            {isPaused ? <Play className="w-4 h-4 fill-white" /> : <Pause className="w-4 h-4 fill-amber-300 text-amber-300" />}
            <span className="hidden sm:inline">{isPaused ? 'Lanjut' : 'Jeda'}</span>
          </button>

          {/* Recipe Help */}
          <button
            id="btn-kitchen-recipe-guide"
            onClick={() => {
              sound.playClick();
              setIsRecipeOpen(true);
            }}
            className="p-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl shadow-xs border border-amber-400/50 cursor-pointer active:scale-95 transition-transform"
            title="Buku Resep"
          >
            <BookOpen className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. PERSISTENT KEYBOARD CONTROL & INTERACTION GUIDE BAR */}
      <div className="z-10 bg-amber-900/80 border-b border-amber-700/60 px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs text-amber-100">
        {/* Static Keyboard Cheat-sheet */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-3 text-[11px] font-bold">
          <span className="text-amber-300 font-black flex items-center gap-1 uppercase tracking-wider text-[10px]">
            🎮 KONTROL:
          </span>
          <div className="flex items-center gap-1 bg-black/25 px-2 py-0.5 rounded-lg border border-amber-600/40">
            <span>🚶 Gerak:</span>
            <kbd className="bg-amber-700 px-1.5 py-0.5 rounded text-[10px] text-white border border-amber-500 font-mono font-bold">W A S D</kbd>
            <span className="text-amber-300">/</span>
            <kbd className="bg-amber-700 px-1 py-0.5 rounded text-[10px] text-white border border-amber-500 font-mono font-bold">Panah</kbd>
          </div>
          <div className="flex items-center gap-1 bg-black/25 px-2 py-0.5 rounded-lg border border-amber-600/40">
            <span>🖐️ Ambil / Taruh:</span>
            <kbd className="bg-emerald-700 px-2 py-0.5 rounded text-[10px] text-white border border-emerald-500 font-mono font-bold">SPASI</kbd>
          </div>
          <div className="flex items-center gap-1 bg-black/25 px-2 py-0.5 rounded-lg border border-amber-600/40">
            <span>🔪 Potong:</span>
            <kbd className="bg-orange-700 px-2 py-0.5 rounded text-[10px] text-white border border-orange-500 font-mono font-bold">E</kbd>
            <span className="text-amber-300/80">(3x)</span>
          </div>
          <div className="flex items-center gap-1 bg-black/25 px-2 py-0.5 rounded-lg border border-amber-600/40">
            <span>⏸️ Jeda:</span>
            <kbd className="bg-amber-700 px-1.5 py-0.5 rounded text-[10px] text-white border border-amber-500 font-mono font-bold">P</kbd>
            <span className="text-amber-300">/</span>
            <kbd className="bg-amber-700 px-1 py-0.5 rounded text-[10px] text-white border border-amber-500 font-mono font-bold">ESC</kbd>
          </div>
        </div>

        {/* Dynamic Context Action Prompt Banner */}
        <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg border text-[11px] font-bold shadow-xs transition-all ${contextHint.badgeColor}`}>
          <span>{contextHint.icon}</span>
          <span className="font-extrabold">{contextHint.title}:</span>
          <span className="hidden sm:inline">{contextHint.actionText}</span>
        </div>
      </div>

      {/* 3. KITCHEN ARENA (Grid 10 cols x 6 rows) */}
      <div className="relative flex-1 w-full max-w-5xl mx-auto p-2 sm:p-3 flex flex-col justify-center items-center">
        {/* Floor Tiles Board */}
        <div className="relative w-full aspect-[16/10] max-h-[470px] bg-gradient-to-br from-amber-100 to-orange-100 rounded-3xl border-4 border-amber-700 shadow-2xl p-2 grid grid-cols-10 grid-rows-6 gap-1.5 overflow-hidden">
          {/* Tile Grid Lines Checkerboard */}
          <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#b45309_1.5px,transparent_1.5px)] [background-size:20px_20px]" />

          {/* Render All Stations */}
          {stations.map((station) => {
            const hasItem = !!station.holdingItem;
            const item = station.holdingItem;
            const isAdj =
              Math.abs(station.x - chefPos.x) <= 1 &&
              Math.abs(station.y - chefPos.y) <= 1;

            return (
              <div
                key={station.id}
                id={`station-${station.id}`}
                onClick={() => handleStationClick(station)}
                style={{
                  gridColumn: station.x + 1,
                  gridRow: station.y + 1,
                }}
                className={`relative rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all border-2 shadow-xs select-none ${
                  isAdj
                    ? 'ring-2 ring-amber-400 ring-offset-1 scale-[1.02]'
                    : 'hover:border-amber-400'
                } ${
                  station.type === 'ingredient'
                    ? 'bg-amber-200/90 border-amber-400 text-amber-950'
                    : station.type === 'chopping'
                    ? 'bg-orange-200 border-orange-400'
                    : station.type === 'pan'
                    ? 'bg-slate-300 border-slate-500'
                    : station.type === 'pot'
                    ? 'bg-cyan-100 border-cyan-400'
                    : station.type === 'oven'
                    ? 'bg-stone-300 border-stone-600'
                    : station.type === 'delivery'
                    ? 'bg-emerald-200 border-emerald-500'
                    : station.type === 'trash'
                    ? 'bg-rose-200 border-rose-400'
                    : station.type === 'plate_dispenser'
                    ? 'bg-blue-100 border-blue-400'
                    : 'bg-amber-50 border-amber-300'
                }`}
              >
                {/* Station Visuals & Icons */}
                {station.type === 'ingredient' && station.ingredientType && (
                  <div className="flex flex-col items-center">
                    <span className="text-2xl sm:text-3xl">
                      {INGREDIENT_DETAILS[station.ingredientType]?.icon}
                    </span>
                    <span className="text-[9px] font-black text-amber-900 truncate max-w-[65px]">
                      {INGREDIENT_DETAILS[station.ingredientType]?.name}
                    </span>
                  </div>
                )}

                {station.type === 'chopping' && (
                  <div className="flex flex-col items-center">
                    <span className="text-xl sm:text-2xl">🪵🔪</span>
                    <span className="text-[8px] font-black text-orange-950">Potong [E]</span>
                  </div>
                )}

                {station.type === 'pan' && (
                  <div className="flex flex-col items-center">
                    <span className="text-xl sm:text-2xl">🍳</span>
                    <span className="text-[8px] font-black text-slate-700">Wajan</span>
                  </div>
                )}

                {station.type === 'pot' && (
                  <div className="flex flex-col items-center">
                    <span className="text-xl sm:text-2xl">🍲</span>
                    <span className="text-[8px] font-black text-cyan-900">Panci</span>
                  </div>
                )}

                {station.type === 'oven' && (
                  <div className="flex flex-col items-center">
                    <span className="text-xl sm:text-2xl">🔥🚪</span>
                    <span className="text-[8px] font-black text-stone-800">Oven</span>
                  </div>
                )}

                {station.type === 'delivery' && (
                  <div className="flex flex-col items-center">
                    <span className="text-2xl">🛎️</span>
                    <span className="text-[8px] font-black text-emerald-900">Antar</span>
                  </div>
                )}

                {station.type === 'plate_dispenser' && (
                  <div className="flex flex-col items-center">
                    <span className="text-2xl">🍽️</span>
                    <span className="text-[8px] font-black text-blue-900">Piring</span>
                  </div>
                )}

                {station.type === 'trash' && (
                  <div className="flex flex-col items-center">
                    <span className="text-2xl">🗑️</span>
                    <span className="text-[8px] font-black text-rose-900">Sampah</span>
                  </div>
                )}

                {station.type === 'counter' && !hasItem && (
                  <span className="text-[9px] font-bold text-amber-700/60">Meja</span>
                )}

                {/* ITEM PRESENT ON STATION */}
                {hasItem && item && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 rounded-xl p-1 animate-scale-in">
                    {item.type === 'ingredient' && item.ingredient && (
                      <span className="text-2xl">
                        {INGREDIENT_DETAILS[item.ingredient]?.icon}
                      </span>
                    )}

                    {item.type === 'plate' && (
                      <div className="flex flex-col items-center">
                        {item.completedDish ? (
                          <span className="text-2xl animate-bounce">
                            {item.completedDish.icon}
                          </span>
                        ) : (
                          <div className="flex items-center gap-0.5">
                            <span className="text-sm">🍽️</span>
                            {(item.ingredientsOnPlate || []).slice(0, 2).map((ing, idx) => (
                              <span key={idx} className="text-xs">
                                {INGREDIENT_DETAILS[ing]?.icon}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Progress Bar for Chopping / Cooking */}
                    {(station.progress || 0) > 0 && (
                      <div className="w-10 bg-slate-200 h-1.5 rounded-full overflow-hidden mt-0.5 border border-slate-300">
                        <div
                          className={`h-full ${
                            station.isReady
                              ? 'bg-emerald-500'
                              : station.isBurnt
                              ? 'bg-rose-600'
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${station.progress}%` }}
                        />
                      </div>
                    )}

                    {/* Burnt Warning */}
                    {station.isBurnt && (
                      <span className="absolute -top-1 -right-1 text-xs">🔥</span>
                    )}
                    {station.isReady && !station.isBurnt && (
                      <span className="absolute -top-1 -right-1 text-xs">✨</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* CHEF CHARACTER (2D Animated Animal Sprite with Custom Ears, Hat, Apron) */}
          <div
            id="chef-player"
            style={{
              gridColumn: chefPos.x + 1,
              gridRow: chefPos.y + 1,
              transition: 'all 0.14s ease-out',
            }}
            className={`relative z-30 flex flex-col items-center justify-center pointer-events-none transform ${
              chefFacing === 'left' ? 'scale-x-[-1]' : ''
            }`}
          >
            <ChefCharacterSprite
              characterId={characterId}
              facing={chefFacing}
              isChopping={isChopping}
              holdingItem={chefHolding}
            />
          </div>

          {/* Floating Points Popups */}
          {floatingPoints.map((pt) => (
            <div
              key={pt.id}
              style={{
                gridColumn: pt.x + 1,
                gridRow: pt.y + 1,
              }}
              className={`absolute z-40 -translate-y-8 font-black font-['Fredoka'] text-sm sm:text-base pointer-events-none drop-shadow-md animate-bounce ${pt.color}`}
            >
              {pt.text}
            </div>
          ))}
        </div>

        {/* 4. MOBILE & MOUSE TOUCH ON-SCREEN CONTROLS */}
        <div className="w-full flex items-center justify-between gap-2 mt-2 px-2">
          {/* Directional Pad */}
          <div className="grid grid-cols-3 gap-1.5 w-32 sm:w-36">
            <div />
            <button
              id="btn-move-up"
              onClick={() => setChefPos((p) => ({ ...p, y: Math.max(1, p.y - 1) }))}
              className="py-2.5 bg-amber-800 hover:bg-amber-700 active:bg-amber-900 text-amber-100 font-black rounded-xl border border-amber-600 text-center shadow-xs"
              title="Gerak Atas (W / Panah Atas)"
            >
              ▲
            </button>
            <div />
            <button
              id="btn-move-left"
              onClick={() => {
                setChefPos((p) => ({ ...p, x: Math.max(1, p.x - 1) }));
                setChefFacing('left');
              }}
              className="py-2.5 bg-amber-800 hover:bg-amber-700 active:bg-amber-900 text-amber-100 font-black rounded-xl border border-amber-600 text-center shadow-xs"
              title="Gerak Kiri (A / Panah Kiri)"
            >
              ◀
            </button>
            <button
              id="btn-move-down"
              onClick={() => setChefPos((p) => ({ ...p, y: Math.min(4, p.y + 1) }))}
              className="py-2.5 bg-amber-800 hover:bg-amber-700 active:bg-amber-900 text-amber-100 font-black rounded-xl border border-amber-600 text-center shadow-xs"
              title="Gerak Bawah (S / Panah Bawah)"
            >
              ▼
            </button>
            <button
              id="btn-move-right"
              onClick={() => {
                setChefPos((p) => ({ ...p, x: Math.min(8, p.x + 1) }));
                setChefFacing('right');
              }}
              className="py-2.5 bg-amber-800 hover:bg-amber-700 active:bg-amber-900 text-amber-100 font-black rounded-xl border border-amber-600 text-center shadow-xs"
              title="Gerak Kanan (D / Panah Kanan)"
            >
              ▶
            </button>
          </div>

          {/* Quick instructions reminder */}
          <div className="hidden md:flex flex-col items-center text-center text-xs text-amber-200/90 font-semibold max-w-xs bg-amber-900/60 p-2 rounded-xl border border-amber-700/50">
            <span className="font-bold text-amber-300">💡 Sentuh/Klik Stasiun Langsung</span>
            <span className="text-[10px] text-amber-100">Koki akan otomatis berjalan & berinteraksi di stasiun yang diklik!</span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              id="btn-action-interact"
              onClick={() => {
                const adj = findAdjacentStation(chefPos);
                if (adj) interactWithStation(adj);
              }}
              className="px-4 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 text-white font-black font-['Fredoka'] text-xs sm:text-sm rounded-2xl shadow-lg border-b-4 border-emerald-700 active:translate-y-1 active:border-b-0 transition-all flex flex-col items-center cursor-pointer"
            >
              <span>🖐️ AMBIL / TARUH</span>
              <span className="text-[9px] font-bold text-emerald-200">[ TEKAN SPASI ]</span>
            </button>

            <button
              id="btn-action-chop"
              onClick={() => {
                const adj = findAdjacentStation(chefPos);
                if (adj) interactWithStation(adj);
              }}
              className="px-4 py-2.5 sm:py-3 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 text-white font-black font-['Fredoka'] text-xs sm:text-sm rounded-2xl shadow-lg border-b-4 border-orange-700 active:translate-y-1 active:border-b-0 transition-all flex flex-col items-center cursor-pointer"
            >
              <span>🔪 POTONG / OLAH</span>
              <span className="text-[9px] font-bold text-amber-200">[ TEKAN E ]</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recipe Book Modal */}
      <RecipeBookModal isOpen={isRecipeOpen} onClose={() => setIsRecipeOpen(false)} />

      {/* PAUSE MODAL OVERLAY */}
      {isPaused && (
        <div 
          id="modal-kitchen-pause"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-fade-in select-none"
        >
          <div className="bg-gradient-to-b from-amber-50 via-orange-50 to-amber-100 border-4 border-amber-500 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden text-center relative p-5 sm:p-6">
            {/* Header Ribbon */}
            <div className="bg-amber-500 text-white mx-auto px-6 py-1.5 rounded-full font-black font-['Fredoka'] text-sm tracking-wider uppercase shadow-md inline-flex items-center gap-2 mb-3">
              <Pause className="w-4 h-4 fill-white" />
              <span>PERMAINAN DIJEDA</span>
            </div>

            {/* Level Info & Mascot */}
            <div className="mb-4">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-200/80 border-2 border-amber-300 text-3xl shadow-inner mb-1.5">
                {level.theme.icon}
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-['Fredoka'] text-slate-800 leading-tight">
                {level.title}
              </h2>
              <p className="text-xs font-bold text-amber-800">{level.subtitle}</p>
            </div>

            {/* Current Stats Snapshot */}
            <div className="grid grid-cols-3 gap-2 bg-white/90 border-2 border-amber-200 rounded-2xl p-2.5 sm:p-3 mb-4 shadow-xs">
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-slate-500 font-extrabold uppercase">Sisa Waktu</span>
                <span className="text-base sm:text-lg font-black font-['Fredoka'] text-amber-600 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {formatTime(timeLeft)}
                </span>
              </div>
              <div className="flex flex-col items-center border-x border-amber-200">
                <span className="text-[10px] text-slate-500 font-extrabold uppercase">Skor Saat Ini</span>
                <span className="text-base sm:text-lg font-black font-['Fredoka'] text-amber-500">{score}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-slate-500 font-extrabold uppercase">Tersaji</span>
                <span className="text-base sm:text-lg font-black font-['Fredoka'] text-emerald-600">{completedOrders}</span>
              </div>
            </div>

            {/* Star Requirements Indicator */}
            <div className="bg-amber-100/70 rounded-xl p-2.5 mb-4 border border-amber-300/70 text-xs">
              <div className="text-[11px] font-black text-slate-700 mb-1.5 flex items-center justify-center gap-1">
                <span>Target Bintang:</span>
              </div>
              <div className="flex justify-around items-center">
                <div className="flex items-center gap-1 font-bold text-slate-700">
                  <Star className={`w-3.5 h-3.5 ${score >= level.starThresholds[0] ? 'fill-amber-400 text-amber-500' : 'text-slate-300'}`} />
                  <span className="text-[11px]">{level.starThresholds[0]} pts</span>
                </div>
                <div className="flex items-center gap-1 font-bold text-slate-700">
                  <Star className={`w-3.5 h-3.5 ${score >= level.starThresholds[1] ? 'fill-amber-400 text-amber-500' : 'text-slate-300'}`} />
                  <span className="text-[11px]">{level.starThresholds[1]} pts</span>
                </div>
                <div className="flex items-center gap-1 font-bold text-slate-700">
                  <Star className={`w-3.5 h-3.5 ${score >= level.starThresholds[2] ? 'fill-amber-400 text-amber-500' : 'text-slate-300'}`} />
                  <span className="text-[11px]">{level.starThresholds[2]} pts</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              {/* Resume Button */}
              <button
                id="btn-pause-resume"
                onClick={() => {
                  sound.playClick();
                  setIsPaused(false);
                }}
                className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 text-white font-black font-['Fredoka'] text-base sm:text-lg rounded-2xl shadow-lg border-b-4 border-emerald-700 active:translate-y-1 active:border-b-0 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-5 h-5 fill-white" />
                <span>LANJUTKAN MEMASAK</span>
              </button>

              {/* Restart Level */}
              <button
                id="btn-pause-restart"
                onClick={() => {
                  sound.playClick();
                  if (onRestartLevel) {
                    onRestartLevel();
                  } else {
                    setTimeLeft(level.timeLimit);
                    setScore(0);
                    setCompletedOrders(0);
                    setFailedOrders(0);
                    setCombo(1);
                    setChefHolding(null);
                    setChefPos({ x: 4, y: 3 });
                    setIsPaused(false);
                  }
                }}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-amber-950 font-black font-['Fredoka'] text-sm rounded-2xl border-2 border-amber-300 shadow-xs active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-amber-600" />
                <span>Mulai Ulang Level (Restart)</span>
              </button>

              {/* Recipe Book Button */}
              <button
                id="btn-pause-recipes"
                onClick={() => {
                  sound.playClick();
                  setIsRecipeOpen(true);
                }}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 font-black font-['Fredoka'] text-sm rounded-2xl border-2 border-amber-300 shadow-xs active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-amber-600" />
                <span>Lihat Buku Resep & Bahan</span>
              </button>

              {/* Audio toggle & Exit to Map in a bottom row */}
              <div className="flex gap-2 pt-1">
                <button
                  id="btn-pause-audio-toggle"
                  onClick={() => {
                    const muted = sound.toggleMute();
                    setIsMuted(muted);
                    if (!muted) sound.playClick();
                  }}
                  className="flex-1 py-2.5 px-3 bg-amber-100 hover:bg-amber-200 text-slate-700 font-black text-xs rounded-xl border border-amber-300 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
                  <span>{isMuted ? 'Suara Mati' : 'Suara Nyala'}</span>
                </button>

                <button
                  id="btn-pause-exit-map"
                  onClick={() => {
                    sound.playClick();
                    onExitToMap();
                  }}
                  className="flex-1 py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-black text-xs rounded-xl border border-rose-300 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
                >
                  <ArrowLeft className="w-4 h-4 text-rose-600" />
                  <span>Keluar ke Peta</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
