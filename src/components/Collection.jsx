import { useState, useMemo } from 'react';
import { Search, Trash2, ChevronDown } from 'lucide-react';
import { remove } from '../storage';
import Card from './Card';

export default function Collection({ collection, setCollection }) {
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('recent');
  const [showSets, setShowSets] = useState(false);

  const allCards = Object.values(collection);
  const total = allCards.reduce((s, c) => s + c.qty, 0);

  const sets = useMemo(() => {
    const s = {};
    allCards.forEach((c) => {
      const key = c.set || 'Inconnu';
      s[key] = (s[key] || 0) + 1;
    });
    return Object.entries(s).sort((a, b) => b[1] - a[1]);
  }, [collection]);

  const cards = useMemo(() => {
    let list = [...allCards];
    if (q) {
      const lq = q.toLowerCase();
      list = list.filter(
        (c) => c.name.toLowerCase().includes(lq) || c.set.toLowerCase().includes(lq)
      );
    }
    if (sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === 'set') list.sort((a, b) => a.set.localeCompare(b.set));
    else list.sort((a, b) => b.addedAt - a.addedAt);
    return list;
  }, [collection, q, sort]);

  const handleRemove = (id) => setCollection((prev) => remove(prev, id));

  return (
    <div>
      {/* Header */}
      <div className="bg-blue-800 px-4 pt-12 pb-5 text-center">
        <h1 className="text-xl font-bold">Ma Collection</h1>
        <div className="flex justify-center gap-8 mt-3">
          <div>
            <div className="text-yellow-400 text-2xl font-bold">{allCards.length}</div>
            <div className="text-blue-200 text-xs">Uniques</div>
          </div>
          <div>
            <div className="text-yellow-400 text-2xl font-bold">{total}</div>
            <div className="text-blue-200 text-xs">Total</div>
          </div>
          <div>
            <div className="text-yellow-400 text-2xl font-bold">{sets.length}</div>
            <div className="text-blue-200 text-xs">Sets</div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3 max-w-lg mx-auto">
        {/* Sets accordion */}
        {sets.length > 0 && (
          <>
            <button
              onClick={() => setShowSets((v) => !v)}
              className="w-full flex justify-between items-center bg-gray-800 rounded-xl px-4 py-3 border border-gray-700"
            >
              <span className="text-sm font-medium text-gray-300">Répartition par set</span>
              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform ${showSets ? 'rotate-180' : ''}`}
              />
            </button>
            {showSets && (
              <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                {sets.map(([name, count]) => (
                  <div
                    key={name}
                    className="flex justify-between px-4 py-2 border-b border-gray-700 last:border-0"
                  >
                    <span className="text-sm text-gray-300 truncate">{name}</span>
                    <span className="text-yellow-400 font-bold text-sm ml-2">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Search + sort */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Chercher dans ma collection…"
              className="w-full bg-gray-800 rounded-xl pl-9 pr-3 py-3 border border-gray-700 focus:outline-none text-sm placeholder-gray-500"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-gray-800 rounded-xl px-3 border border-gray-700 text-sm text-white"
          >
            <option value="recent">Récent</option>
            <option value="name">Nom</option>
            <option value="set">Set</option>
          </select>
        </div>

        {/* Grid */}
        {cards.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            {q ? (
              <p>Aucun résultat pour &quot;{q}&quot;</p>
            ) : (
              <p>Ta collection est vide — scanner des cartes !</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {cards.map((card) => (
              <div key={card.id} className="relative">
                <Card card={card} owned qty={card.qty} />
                <button
                  onClick={() => handleRemove(card.id)}
                  className="absolute top-1.5 right-1.5 bg-red-600/80 hover:bg-red-500 rounded-full p-1.5 transition-colors active:scale-90"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
