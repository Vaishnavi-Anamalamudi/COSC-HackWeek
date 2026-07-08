import {
  FaBriefcase,
  FaBuilding,
  FaEnvelope,
  FaGithub,
  FaGlobe,
  FaLinkedin,
  FaLocationDot,
  FaPhone,
  FaUser,
  FaXTwitter,
} from 'react-icons/fa6';
import { HiSparkles } from 'react-icons/hi2';

export const formFields = [
  { name: 'fullName', label: 'Full name', icon: FaUser, required: true },
  { name: 'designation', label: 'Designation', icon: FaBriefcase, required: true },
  { name: 'company', label: 'Company', icon: FaBuilding },
  { name: 'phone', label: 'Phone', icon: FaPhone, type: 'tel' },
  { name: 'email', label: 'Email', icon: FaEnvelope, type: 'email', required: true },
  { name: 'website', label: 'Website', icon: FaGlobe, type: 'url' },
  { name: 'linkedIn', label: 'LinkedIn', icon: FaLinkedin, type: 'url' },
  { name: 'github', label: 'GitHub', icon: FaGithub, type: 'url' },
  { name: 'twitter', label: 'Twitter / X', icon: FaXTwitter, type: 'url' },
  { name: 'portfolio', label: 'Portfolio', icon: HiSparkles, type: 'url' },
  { name: 'address', label: 'Address', icon: FaLocationDot },
];

export const contactFields = [
  { key: 'phone', label: 'Phone', icon: FaPhone },
  { key: 'email', label: 'Email', icon: FaEnvelope, hrefPrefix: 'mailto:' },
  { key: 'website', label: 'Website', icon: FaGlobe },
  { key: 'address', label: 'Address', icon: FaLocationDot },
];

export const socialLinks = [
  { key: 'linkedIn', label: 'LinkedIn', icon: FaLinkedin },
  { key: 'github', label: 'GitHub', icon: FaGithub },
  { key: 'twitter', label: 'X', icon: FaXTwitter },
  { key: 'portfolio', label: 'Portfolio', icon: HiSparkles },
];
