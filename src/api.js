const BASE = 'https://api.pokemontcg.io/v2';

export async function searchByName(name, page = 1, pageSize = 20) {
  const q = encodeURIComponent(`name:"${name}"`);
  const r = await fetch(`${BASE}/cards?q=${q}&page=${page}&pageSize=${pageSize}&orderBy=name`);
  if (!r.ok) throw new Error('API error');
  return r.json();
}
