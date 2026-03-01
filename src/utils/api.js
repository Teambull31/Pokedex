const BASE = 'https://api.pokemontcg.io/v2';

export async function searchCardsByName(name, page = 1, pageSize = 20) {
  const q = `name:"${name}"`;
  const url = `${BASE}/cards?q=${encodeURIComponent(q)}&page=${page}&pageSize=${pageSize}&orderBy=name`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Erreur API');
  return res.json();
}

export async function searchCards(query, page = 1, pageSize = 20) {
  const url = `${BASE}/cards?q=${encodeURIComponent(query)}&page=${page}&pageSize=${pageSize}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Erreur API');
  return res.json();
}

export async function getSets() {
  const url = `${BASE}/sets?orderBy=-releaseDate&pageSize=250`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Erreur API');
  return res.json();
}
