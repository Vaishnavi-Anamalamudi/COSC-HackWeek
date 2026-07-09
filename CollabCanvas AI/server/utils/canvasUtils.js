export function createRoomState(roomId) {
  return {
    roomId,
    elements: new Map(),
    users: new Map(),
    messages: [],
    activity: [],
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
}

export function serializeRoom(room) {
  return {
    roomId: room.roomId,
    elements: [...room.elements.values()].sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0)),
    participants: [...room.users.values()],
    messages: room.messages.slice(-120),
    activity: room.activity.slice(0, 40)
  };
}

export function mergeElement(room, element) {
  const previous = room.elements.get(element.id);
  if (!previous || (element.version || 0) >= (previous.version || 0)) {
    room.elements.set(element.id, element);
    room.updatedAt = Date.now();
  }
  return room.elements.get(element.id);
}

export function mergeElements(room, elements = []) {
  return elements.map((element) => mergeElement(room, element)).filter(Boolean);
}

export function addActivity(room, name, action) {
  const entry = {
    id: crypto.randomUUID(),
    name,
    action,
    createdAt: new Date().toISOString()
  };
  room.activity.unshift(entry);
  room.activity = room.activity.slice(0, 40);
  return entry;
}
