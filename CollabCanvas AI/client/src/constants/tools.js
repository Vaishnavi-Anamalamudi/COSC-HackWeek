import {
  FiBold,
  FiCircle,
  FiCrosshair,
  FiEdit3,
  FiImage,
  FiMinus,
  FiMousePointer,
  FiMove,
  FiNavigation,
  FiPenTool,
  FiSquare,
  FiTrash2,
  FiType
} from 'react-icons/fi';

export const TOOLS = [
  { id: 'select', label: 'Select', icon: FiMousePointer },
  { id: 'pencil', label: 'Pencil', icon: FiEdit3 },
  { id: 'brush', label: 'Brush', icon: FiPenTool },
  { id: 'highlighter', label: 'Highlighter', icon: FiBold },
  { id: 'eraser', label: 'Eraser', icon: FiTrash2 },
  { id: 'rectangle', label: 'Rectangle', icon: FiSquare },
  { id: 'circle', label: 'Circle', icon: FiCircle },
  { id: 'ellipse', label: 'Ellipse', icon: FiCircle },
  { id: 'line', label: 'Line', icon: FiMinus },
  { id: 'arrow', label: 'Arrow', icon: FiNavigation },
  { id: 'text', label: 'Text', icon: FiType },
  { id: 'sticky', label: 'Sticky Note', icon: FiEdit3 },
  { id: 'image', label: 'Image', icon: FiImage },
  { id: 'lasso', label: 'Lasso', icon: FiMousePointer },
  { id: 'laser', label: 'Laser Pointer', icon: FiCrosshair },
  { id: 'pan', label: 'Pan', icon: FiMove },
  { id: 'clear', label: 'Clear', icon: FiTrash2 }
];

export const DRAW_TOOLS = new Set(['pencil', 'brush', 'highlighter', 'eraser', 'laser']);
export const SHAPE_TOOLS = new Set(['rectangle', 'circle', 'ellipse', 'line', 'arrow']);
export const ROOM_HISTORY_KEY = 'collabcanvas:room-history';
export const USER_KEY = 'collabcanvas:user';
