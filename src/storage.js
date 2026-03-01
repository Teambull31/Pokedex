const KEY = 'poke_collection_v2';

export function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
}

function save(col) {
  localStorage.setItem(KEY, JSON.stringify(col));
}

export function add(col, card) {
  const next = { ...col };
  if (next[card.id]) {
    next[card.id] = { ...next[card.id], qty: next[card.id].qty + 1 };
  } else {
    next[card.id] = {
      id: card.id,
      name: card.name,
      number: card.number || '',
      set: card.set?.name || '',
      img: card.images?.small || '',
      types: card.types || [],
      rarity: card.rarity || '',
      qty: 1,
      addedAt: Date.now(),
    };
  }
  save(next);
  return next;
}

export function remove(col, id) {
  const next = { ...col };
  if (!next[id]) return next;
  if (next[id].qty > 1) {
    next[id] = { ...next[id], qty: next[id].qty - 1 };
  } else {
    delete next[id];
  }
  save(next);
  return next;
}
