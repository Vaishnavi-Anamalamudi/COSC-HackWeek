import {
  FiBookOpen,
  FiBriefcase,
  FiDollarSign,
  FiFilm,
  FiGift,
  FiHeart,
  FiHome,
  FiMap,
  FiMoreHorizontal,
  FiShoppingBag,
  FiTruck,
} from 'react-icons/fi';

export const DEFAULT_CATEGORIES = [
  { name: 'Food', color: '#22C55E', icon: FiGift },
  { name: 'Shopping', color: '#38BDF8', icon: FiShoppingBag },
  { name: 'Transport', color: '#F97316', icon: FiTruck },
  { name: 'Bills', color: '#A78BFA', icon: FiHome },
  { name: 'Health', color: '#FB7185', icon: FiHeart },
  { name: 'Education', color: '#FACC15', icon: FiBookOpen },
  { name: 'Entertainment', color: '#EC4899', icon: FiFilm },
  { name: 'Travel', color: '#14B8A6', icon: FiMap },
  { name: 'Investment', color: '#84CC16', icon: FiBriefcase },
  { name: 'Income', color: '#10B981', icon: FiDollarSign },
  { name: 'Others', color: '#94A3B8', icon: FiMoreHorizontal },
];

export const CURRENCIES = [
  { code: 'INR', symbol: 'Rs.', locale: 'en-IN' },
  { code: 'USD', symbol: '$', locale: 'en-US' },
  { code: 'EUR', symbol: '€', locale: 'de-DE' },
  { code: 'GBP', symbol: '£', locale: 'en-GB' },
];
