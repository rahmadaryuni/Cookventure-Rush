import { ChefCharacter, ChefCharacterId } from '../types';

export const CHARACTERS: Record<ChefCharacterId, ChefCharacter> = {
  cat: {
    id: 'cat',
    name: 'Chef Meow',
    species: 'Kucing',
    avatar: '🐱',
    description: 'Lincah dan gemar memotong ikan serta mencicipi keju lezat!',
    bgGradient: 'from-amber-400 to-orange-500',
    borderColor: 'border-amber-400',
    hatColor: 'bg-white',
  },
  rabbit: {
    id: 'rabbit',
    name: 'Chef Hops',
    species: 'Kelinci',
    avatar: '🐰',
    description: 'Gerakan super gesit, ahli meracik selada segar dan wortel!',
    bgGradient: 'from-pink-400 to-rose-500',
    borderColor: 'border-pink-400',
    hatColor: 'bg-pink-100',
  },
  fox: {
    id: 'fox',
    name: 'Chef Foxy',
    species: 'Rubah',
    avatar: '🦊',
    description: 'Cerdas dan cekatan mengatur waktu oven serta wajan kompor!',
    bgGradient: 'from-orange-500 to-red-600',
    borderColor: 'border-orange-400',
    hatColor: 'bg-amber-100',
  },
  duck: {
    id: 'duck',
    name: 'Chef Quack',
    species: 'Bebek',
    avatar: '🦆',
    description: 'Selalu ceria merebus sup hangat dan mie lezat tiada tanding!',
    bgGradient: 'from-emerald-400 to-teal-500',
    borderColor: 'border-emerald-400',
    hatColor: 'bg-emerald-100',
  },
  bear: {
    id: 'bear',
    name: 'Chef Bear',
    species: 'Beruang',
    avatar: '🐻',
    description: 'Kuat dan teliti membuat kue manis serta pancake madu empuk!',
    bgGradient: 'from-amber-600 to-yellow-700',
    borderColor: 'border-amber-500',
    hatColor: 'bg-yellow-100',
  },
};

export const CHARACTER_LIST = Object.values(CHARACTERS);
