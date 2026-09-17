import { DishRecipe, IngredientInfo, IngredientType } from '../types';

export const INGREDIENT_DETAILS: Record<IngredientType, IngredientInfo> = {
  bun: { id: 'bun', name: 'Roti Burger', icon: '🍞', category: 'raw', color: 'bg-amber-100 text-amber-900 border-amber-300' },
  dough: { id: 'dough', name: 'Adonan Pizza', icon: '🫓', category: 'raw', color: 'bg-yellow-100 text-yellow-900 border-yellow-300' },
  flour: { id: 'flour', name: 'Adonan Kue', icon: '🥣', category: 'raw', color: 'bg-orange-100 text-orange-900 border-orange-300' },
  
  meat: { id: 'meat', name: 'Daging Mentah', icon: '🥩', category: 'raw', color: 'bg-rose-100 text-rose-900 border-rose-300' },
  meat_chopped: { id: 'meat_chopped', name: 'Daging Cincang', icon: '🔪🥩', category: 'processed', color: 'bg-rose-200 text-rose-950 border-rose-400' },
  meat_cooked: { id: 'meat_cooked', name: 'Daging Masak', icon: '🥓', category: 'processed', color: 'bg-amber-700 text-white border-amber-900' },
  
  egg: { id: 'egg', name: 'Telur', icon: '🥚', category: 'raw', color: 'bg-amber-50 text-amber-900 border-amber-200' },
  egg_boiled: { id: 'egg_boiled', name: 'Telur Masak', icon: '🍳', category: 'processed', color: 'bg-yellow-200 text-yellow-900 border-yellow-400' },
  
  lettuce: { id: 'lettuce', name: 'Sayur Selada', icon: '🥬', category: 'raw', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
  lettuce_chopped: { id: 'lettuce_chopped', name: 'Sayur Potong', icon: '🥗', category: 'processed', color: 'bg-emerald-200 text-emerald-950 border-emerald-400' },
  
  tomato: { id: 'tomato', name: 'Tomat Segar', icon: '🍅', category: 'raw', color: 'bg-red-100 text-red-900 border-red-300' },
  tomato_chopped: { id: 'tomato_chopped', name: 'Tomat Iris', icon: '🥫', category: 'processed', color: 'bg-red-200 text-red-950 border-red-400' },
  
  fruit: { id: 'fruit', name: 'Strawberry', icon: '🍓', category: 'raw', color: 'bg-pink-100 text-pink-900 border-pink-300' },
  fruit_chopped: { id: 'fruit_chopped', name: 'Buah Iris', icon: '🫐', category: 'processed', color: 'bg-pink-200 text-pink-950 border-pink-400' },
  
  cheese: { id: 'cheese', name: 'Keju Balok', icon: '🧀', category: 'raw', color: 'bg-yellow-100 text-yellow-900 border-yellow-300' },
  cheese_chopped: { id: 'cheese_chopped', name: 'Irisan Keju', icon: '🧈', category: 'processed', color: 'bg-yellow-300 text-yellow-950 border-yellow-500' },
  
  noodles: { id: 'noodles', name: 'Mie Mentah', icon: '🍜', category: 'raw', color: 'bg-amber-100 text-amber-900 border-amber-300' },
  noodles_boiled: { id: 'noodles_boiled', name: 'Mie Rebus Matang', icon: '🍲', category: 'processed', color: 'bg-amber-300 text-amber-950 border-amber-500' },
  
  soup_base: { id: 'soup_base', name: 'Kaldu Sup Masak', icon: '🥣', category: 'processed', color: 'bg-orange-300 text-orange-950 border-orange-500' },
};

export const ALL_RECIPES: Record<string, DishRecipe> = {
  burger_classic: {
    id: 'burger_classic',
    name: 'Burger Klasik',
    description: 'Roti + Daging Masak + Sayur Potong',
    icon: '🍔',
    category: 'burger',
    requiredIngredients: ['bun', 'meat_cooked', 'lettuce_chopped'],
    score: 100,
    preparationSteps: [
      'Potong Daging di Meja Potong',
      'Masak Daging di Wajan Kompor',
      'Potong Sayur di Meja Potong',
      'Ambil Piring, susun Roti + Daging Masak + Sayur Potong',
      'Antarkan ke Meja Pelanggan'
    ],
  },
  burger_cheese: {
    id: 'burger_cheese',
    name: 'Burger Keju Spesial',
    description: 'Roti + Daging Masak + Keju Potong + Sayur Potong',
    icon: '🍔🧀',
    category: 'burger',
    requiredIngredients: ['bun', 'meat_cooked', 'cheese_chopped', 'lettuce_chopped'],
    score: 140,
    preparationSteps: [
      'Potong Daging lalu Masak di Wajan Kompor',
      'Potong Keju di Meja Potong',
      'Potong Sayur di Meja Potong',
      'Gabungkan ke Piring bersama Roti Burger',
      'Antarkan ke Pelanggan'
    ],
  },
  soup_meat: {
    id: 'soup_meat',
    name: 'Sup Daging Sayur',
    description: 'Daging Potong + Sayur Potong + Rebus di Panci',
    icon: '🍲',
    category: 'soup',
    requiredIngredients: ['meat_chopped', 'lettuce_chopped', 'soup_base'],
    score: 130,
    preparationSteps: [
      'Potong Daging & Sayur di Meja Potong',
      'Masukkan ke Panci Rebus hingga jadi Kaldu Sup Matang',
      'Sajikan ke Mangkuk / Piring dan kirim ke Pelanggan'
    ],
  },
  pizza_margherita: {
    id: 'pizza_margherita',
    name: 'Pizza Margherita',
    description: 'Adonan + Tomat Iris + Keju Potong (Panggang Oven)',
    icon: '🍕',
    category: 'pizza',
    requiredIngredients: ['dough', 'tomato_chopped', 'cheese_chopped'],
    score: 150,
    preparationSteps: [
      'Potong Tomat & Keju di Meja Potong',
      'Letakkan Adonan Pizza + Tomat Iris + Keju Potong ke Oven',
      'Tunggu hingga matang lalu bawa ke Meja Antaran'
    ],
  },
  pizza_meat: {
    id: 'pizza_meat',
    name: 'Pizza Daging Super',
    description: 'Adonan + Daging Masak + Tomat Iris + Keju (Panggang Oven)',
    icon: '🍕🥩',
    category: 'pizza',
    requiredIngredients: ['dough', 'meat_cooked', 'tomato_chopped', 'cheese_chopped'],
    score: 180,
    preparationSteps: [
      'Potong Daging lalu Masak di Wajan Kompor',
      'Potong Tomat & Keju di Meja Potong',
      'Panggang bersama Adonan Pizza di Oven sampai Matang',
      'Sajikan ke Meja Pengantaran'
    ],
  },
  noodles_soup: {
    id: 'noodles_soup',
    name: 'Mie Kuah Telur',
    description: 'Mie Rebus + Sayur Potong + Telur Rebus',
    icon: '🍜',
    category: 'mie',
    requiredIngredients: ['noodles_boiled', 'lettuce_chopped', 'egg_boiled'],
    score: 140,
    preparationSteps: [
      'Rebus Mie mentah di Panci Air mendidih',
      'Rebus Telur mentah di Panci Air',
      'Potong Sayur di Meja Potong',
      'Satukan semua di Piring / Mangkuk lalu sajikan'
    ],
  },
  noodles_fried: {
    id: 'noodles_fried',
    name: 'Mie Goreng Daging',
    description: 'Mie Rebus + Daging Masak + Sayur Potong',
    icon: '🍝',
    category: 'mie',
    requiredIngredients: ['noodles_boiled', 'meat_cooked', 'lettuce_chopped'],
    score: 160,
    preparationSteps: [
      'Rebus Mie di Panci hingga Matang',
      'Potong Daging dan masak di Wajan Kompor',
      'Potong Sayur di Meja Potong',
      'Gabungkan di Piring dan antarkan'
    ],
  },
  pancake_fruit: {
    id: 'pancake_fruit',
    name: 'Pancake Buah Manis',
    description: 'Pancake Wajan (Adonan Kue) + Buah Iris',
    icon: '🥞',
    category: 'cake',
    requiredIngredients: ['flour', 'fruit_chopped'],
    score: 130,
    preparationSteps: [
      'Masak Adonan Kue di Wajan Kompor hingga kecokelatan',
      'Potong Strawberry segar di Meja Potong',
      'Letakkan di Piring bersama Pancake dan antarkan'
    ],
  },
  tart_strawberry: {
    id: 'tart_strawberry',
    name: 'Kue Tart Strawberry',
    description: 'Adonan Panggang (Oven) + Buah Iris + Keju Manis',
    icon: '🎂',
    category: 'cake',
    requiredIngredients: ['flour', 'fruit_chopped', 'cheese_chopped'],
    score: 180,
    preparationSteps: [
      'Panggang Adonan Kue di Oven hingga mengembang empuk',
      'Potong Buah Strawberry & Keju di Meja Potong',
      'Hias kue di Piring dan antarkan ke Pelanggan'
    ],
  },
};
