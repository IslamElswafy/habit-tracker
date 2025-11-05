import { Flame, Dumbbell, Book, Heart, Users, Coffee } from 'lucide-react';

export const HABIT_CATEGORIES = {
  religious: {
    id: 'religious',
    name: 'دينية',
    icon: Flame,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  sport: {
    id: 'sport',
    name: 'رياضية',
    icon: Dumbbell,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  educational: {
    id: 'educational',
    name: 'تعليمية',
    icon: Book,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  health: {
    id: 'health',
    name: 'صحية',
    icon: Heart,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
  social: {
    id: 'social',
    name: 'اجتماعية',
    icon: Users,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
  },
  entertainment: {
    id: 'entertainment',
    name: 'ترفيهية',
    icon: Coffee,
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
  },
};

export const getCategoryById = (categoryId) => {
  return HABIT_CATEGORIES[categoryId] || HABIT_CATEGORIES.religious;
};

