import {
  FaAdjust,
  FaEye,
  FaLeaf,
  FaTint,
  FaUniversalAccess,
} from 'react-icons/fa';

export const simulationModes = [
  {
    id: 'normal',
    label: 'Normal Vision',
    shortLabel: 'Normal',
    icon: FaEye,
    description: 'Reference view with the original color response preserved.',
    accessibility:
      'Use this as the baseline when checking contrast, palette balance, and brand color integrity.',
  },
  {
    id: 'protanopia',
    label: 'Protanopia',
    shortLabel: 'Red',
    icon: FaTint,
    description: 'Simulates absent long-wavelength cone response, often called red blindness.',
    accessibility:
      'Red and green distinctions compress heavily. Avoid relying on red alone for errors or warnings.',
  },
  {
    id: 'deuteranopia',
    label: 'Deuteranopia',
    shortLabel: 'Green',
    icon: FaLeaf,
    description: 'Simulates absent medium-wavelength cone response, often called green blindness.',
    accessibility:
      'Green, amber, and red states can become difficult to separate without labels or contrast cues.',
  },
  {
    id: 'tritanopia',
    label: 'Tritanopia',
    shortLabel: 'Blue',
    icon: FaAdjust,
    description: 'Simulates absent short-wavelength cone response, affecting blue-yellow perception.',
    accessibility:
      'Blue and yellow relationships shift significantly. Pair hue differences with luminance and shape.',
  },
  {
    id: 'achromatopsia',
    label: 'Achromatopsia',
    shortLabel: 'Mono',
    icon: FaUniversalAccess,
    description: 'Simulates complete color blindness using luminance-only perception.',
    accessibility:
      'This exposes whether the design still works through contrast, hierarchy, icons, and text labels.',
  },
];
