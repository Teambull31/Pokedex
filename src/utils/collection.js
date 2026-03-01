const KEY = 'pokedex_collection_v1';

export function loadCollection() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
}

export function saveCollection(collection) {
  localStorage.setItem(KEY, JSON.stringify(collection));
}

export function addToCollection(collection, card, quantity = 1) {
  const next = { ...collection };
  if (next[card.id]) {
    next[card.id] = { ...next[card.id], quantity: next[card.id].quantity + quantity };
  } else {
    next[card.id] = {
      id: card.id,
      name: card.name,
      number: card.number,
      set: {
        id: card.set?.id || '',
        name: card.set?.name || '',
        series: card.set?.series || '',
      },
      images: card.images,
      types: card.types || [],
      rarity: card.rarity || '',
      quantity,
      addedAt: new Date().toISOString(),
    };
  }
  saveCollection(next);
  return next;
}

export function removeFromCollection(collection, cardId) {
  const next = { ...collection };
  if (next[cardId]) {
    if (next[cardId].quantity > 1) {
      next[cardId] = { ...next[cardId], quantity: next[cardId].quantity - 1 };
    } else {
      delete next[cardId];
    }
  }
  saveCollection(next);
  return next;
}

export function isInCollection(collection, cardId) {
  return !!collection[cardId];
}

export function getStats(collection) {
  const cards = Object.values(collection);
  const total = cards.reduce((sum, c) => sum + c.quantity, 0);
  const unique = cards.length;
  const sets = {};
  cards.forEach((c) => {
    const s = c.set?.name || 'Inconnu';
    sets[s] = (sets[s] || 0) + 1;
  });
  return { total, unique, sets };
}
