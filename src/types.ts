export type GameScreen = 'MENU' | 'WORLD_MAP' | 'KITCHEN' | 'RESULT';

export type IngredientType = 
  // Roti & Tepung
  | 'bun' 
  | 'dough'
  | 'flour'
  // Daging & Protein
  | 'meat' 
  | 'meat_chopped' 
  | 'meat_cooked'
  | 'egg'
  | 'egg_boiled'
  // Sayur & Buah
  | 'lettuce' 
  | 'lettuce_chopped' 
  | 'tomato' 
  | 'tomato_chopped'
  | 'fruit'
  | 'fruit_chopped'
  // Topping & Lainnya
  | 'cheese' 
  | 'cheese_chopped'
  | 'noodles' 
  | 'noodles_boiled'
  | 'soup_base';

export interface IngredientInfo {
  id: IngredientType;
  name: string;
  icon: string;
  category: 'raw' | 'processed';
  color: string;
}

export type CookingStationType = 
  | 'CHOPPING' 
  | 'STOVE_PAN' 
  | 'OVEN' 
  | 'BOILING_POT';

export interface RecipeStep {
  station: CookingStationType;
  input: IngredientType[];
  output: IngredientType;
  duration: number; // in seconds
}

export interface DishRecipe {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'burger' | 'pizza' | 'mie' | 'soup' | 'cake';
  requiredIngredients: IngredientType[];
  score: number;
  preparationSteps: string[];
}

export interface ActiveOrder {
  orderId: string;
  recipeId: string;
  recipe: DishRecipe;
  totalTime: number; // in seconds
  remainingTime: number;
  createdAt: number;
}

export interface LevelConfig {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  timeLimit: number; // seconds
  starThresholds: [number, number, number]; // [1 star, 2 star, 3 star]
  availableRecipes: DishRecipe[];
  rawIngredients: IngredientType[];
  mapPosition: { x: number; y: number }; // percentage 0-100 on world map
  theme: {
    name: string;
    bgGradient: string;
    roadColor: string;
    icon: string;
    badgeColor: string;
  };
}

export interface LevelProgress {
  levelId: number;
  unlocked: boolean;
  stars: number; // 0 to 3
  highScore: number;
  completedOrders: number;
}

export interface PlayerInventoryItem {
  type: 'ingredient' | 'plate';
  ingredient?: IngredientType;
  ingredientsOnPlate?: IngredientType[];
  completedDish?: DishRecipe;
}

export interface StationState {
  id: string;
  type: 'ingredient_crate' | 'chopping' | 'stove' | 'oven' | 'pot' | 'plate_dispenser' | 'counter' | 'delivery' | 'trash';
  ingredientType?: IngredientType; // For ingredient crate
  currentIngredient?: IngredientType;
  ingredientsOnStation?: IngredientType[];
  completedDish?: DishRecipe;
  isProcessing?: boolean;
  processProgress?: number; // 0 to 100
  isCooked?: boolean;
  isBurnt?: boolean;
  burnProgress?: number; // 0 to 100
  plate?: {
    ingredients: IngredientType[];
    completedDish?: DishRecipe;
  };
}

export interface GameResultData {
  levelId: number;
  levelTitle: string;
  score: number;
  completedOrders: number;
  failedOrders: number;
  stars: number;
  isNewUnlock: boolean;
  unlockedLevelId?: number;
}

export type ChefCharacterId = 'cat' | 'rabbit' | 'fox' | 'duck' | 'bear';

export interface ChefCharacter {
  id: ChefCharacterId;
  name: string;
  species: string;
  avatar: string;
  description: string;
  bgGradient: string;
  borderColor: string;
  hatColor: string;
}

