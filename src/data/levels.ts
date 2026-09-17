import { LevelConfig } from '../types';
import { ALL_RECIPES } from './recipes';

export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    title: 'Level 1 — Rumah Makan',
    subtitle: 'Green Hills Diner',
    description: 'Pelajari dasar memasak! Siapkan burger lezat dan sup hangat untuk para pelanggan pedesaan.',
    timeLimit: 300, // 5 menit (300 detik)
    starThresholds: [200, 400, 600],
    availableRecipes: [
      ALL_RECIPES.burger_classic,
      ALL_RECIPES.burger_cheese,
      ALL_RECIPES.soup_meat,
    ],
    rawIngredients: ['bun', 'meat', 'lettuce', 'cheese'],
    mapPosition: { x: 14, y: 68 },
    theme: {
      name: 'Rumah Makan',
      bgGradient: 'from-emerald-500 via-teal-600 to-emerald-800',
      roadColor: '#d97706',
      icon: '🏡',
      badgeColor: 'bg-emerald-600',
    },
  },
  {
    id: 2,
    title: 'Level 2 — Kedai Pizza',
    subtitle: 'Piazza Bella Italia',
    description: 'Aroma oven membakar selera! Potong keju & tomat segar, lalu panggang pizza renyah di oven.',
    timeLimit: 300, // 5 menit (300 detik)
    starThresholds: [250, 480, 700],
    availableRecipes: [
      ALL_RECIPES.pizza_margherita,
      ALL_RECIPES.pizza_meat,
    ],
    rawIngredients: ['dough', 'tomato', 'cheese', 'meat'],
    mapPosition: { x: 34, y: 38 },
    theme: {
      name: 'Kedai Pizza',
      bgGradient: 'from-amber-500 via-orange-600 to-red-700',
      roadColor: '#b45309',
      icon: '🍕',
      badgeColor: 'bg-orange-600',
    },
  },
  {
    id: 3,
    title: 'Level 3 — Warung Mie',
    subtitle: 'Noodle Valley Lanterns',
    description: 'Rebus mie kenyal di air mendidih, masak kaldu kuah hangat dan tumisan daging gurih.',
    timeLimit: 300, // 5 menit (300 detik)
    starThresholds: [280, 520, 780],
    availableRecipes: [
      ALL_RECIPES.noodles_soup,
      ALL_RECIPES.noodles_fried,
    ],
    rawIngredients: ['noodles', 'egg', 'lettuce', 'meat'],
    mapPosition: { x: 54, y: 72 },
    theme: {
      name: 'Warung Mie',
      bgGradient: 'from-rose-500 via-red-600 to-amber-800',
      roadColor: '#c2410c',
      icon: '🏮',
      badgeColor: 'bg-red-600',
    },
  },
  {
    id: 4,
    title: 'Level 4 — Toko Kue',
    subtitle: 'Sweet Berry Bakery',
    description: 'Kecepatan dan ketelitian membuat pastry! Panggang kue bolu harum dan pancake buah strawberry.',
    timeLimit: 300, // 5 menit (300 detik)
    starThresholds: [300, 580, 850],
    availableRecipes: [
      ALL_RECIPES.pancake_fruit,
      ALL_RECIPES.tart_strawberry,
    ],
    rawIngredients: ['flour', 'fruit', 'cheese', 'egg'],
    mapPosition: { x: 74, y: 36 },
    theme: {
      name: 'Toko Kue',
      bgGradient: 'from-pink-400 via-rose-500 to-purple-700',
      roadColor: '#be185d',
      icon: '🧁',
      badgeColor: 'bg-pink-600',
    },
  },
  {
    id: 5,
    title: 'Level 5 — Restoran Besar',
    subtitle: 'Grand Gourmet Palace',
    description: 'Tantangan puncak Chef Bintang Lima! Sajikan berbagai hidangan komplit untuk tamu kehormatan.',
    timeLimit: 300, // 5 menit (300 detik)
    starThresholds: [350, 680, 1000],
    availableRecipes: [
      ALL_RECIPES.burger_cheese,
      ALL_RECIPES.pizza_meat,
      ALL_RECIPES.noodles_fried,
      ALL_RECIPES.tart_strawberry,
    ],
    rawIngredients: ['bun', 'meat', 'dough', 'noodles', 'lettuce', 'tomato', 'cheese', 'fruit', 'flour'],
    mapPosition: { x: 89, y: 64 },
    theme: {
      name: 'Restoran Besar',
      bgGradient: 'from-indigo-600 via-purple-700 to-amber-600',
      roadColor: '#4f46e5',
      icon: '👑',
      badgeColor: 'bg-indigo-600',
    },
  },
];
