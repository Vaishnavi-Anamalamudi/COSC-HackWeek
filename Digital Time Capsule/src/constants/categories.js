import {
  FiArchive,
  FiBookOpen,
  FiBriefcase,
  FiCamera,
  FiHeart,
  FiMapPin,
  FiMusic,
  FiStar,
} from 'react-icons/fi';

export const categories = [
  { id: 'letter', label: 'Letter', icon: FiBookOpen, color: '#22C55E' },
  { id: 'photo', label: 'Photos', icon: FiCamera, color: '#38BDF8' },
  { id: 'audio', label: 'Voice', icon: FiMusic, color: '#FBBF24' },
  { id: 'family', label: 'Family', icon: FiHeart, color: '#FB7185' },
  { id: 'travel', label: 'Travel', icon: FiMapPin, color: '#A78BFA' },
  { id: 'career', label: 'Career', icon: FiBriefcase, color: '#F97316' },
  { id: 'milestone', label: 'Milestone', icon: FiStar, color: '#EC4899' },
  { id: 'archive', label: 'Archive', icon: FiArchive, color: '#94A3B8' },
];

export const privacyOptions = [
  { id: 'private', label: 'Private' },
  { id: 'public', label: 'Public' },
  { id: 'unlisted', label: 'Unlisted' },
  { id: 'password', label: 'Password Protected' },
];

export const moodOptions = ['Joyful', 'Hopeful', 'Reflective', 'Grateful', 'Brave', 'Tender'];
