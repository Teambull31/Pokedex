import { useState, useMemo } from 'react';
import { Search, Trash2, BarChart2, ChevronDown } from 'lucide-react';
import { removeFromCollection, getStats } from '../utils/collection';
import PokemonCard from '../components/PokemonCard';

export default function CollectionPage({ collection, setCollection }) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [showStats, setShowStats] = useState(false);

  const stats = useMemo(() => getStats(collection), [collection]);

  const cards = useMemo(() => {
    let list = Object.values(collection);

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.set.name.toLowerCase().includes(q) ||
          c.number?.includes(q)
      );
    }

    list.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'set') return a.set.name.localeCompare(b.set.name);
      if (sortBy === 'recent') return new Date(b.addedAt) - new Date(a.addedAt);
      return 0;
    });

    return list;
  }, [collection, search, sortBy]);

  const handleRemove = (cardId) => {
    const next = removeFromCollection(collection, cardId);
    setCollection(next);
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-700 px-4 pt-12 pb-5">
        <h1 className="text-2xl font-bold text-white text-center">Ma Collection</h1>
        <div className="flex justify-center gap-8 mt-3">
          <div className="text-center">
            <div className="text-yellow-400 font-bold text-2xl">{stats.unique}</div>
            <div className="text-blue-200 text-xs">Cartes uniques</div>
          </div>
          <div className="text-center">
            <div className="text-yellow-400 font-bold text-2xl">{stats.total}</div>
            <div className="text-blue-200 text-xs">Total exemplaires</div>
          </div>
          <div className="text-center">
            <div className="text-yellow-400 font-bold text-2xl">
              {Object.keys(stats.sets).length}
            </div>
            <div className="text-blue-200 text-xs">Sets différents</div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-lg mx-auto">
        {/* Stats accordion */}
        {stats.unique > 0 && (
          <button
            onClick={() => setShowStats((v) => !v)}
            className="w-full flex items-center justify-between bg-gray-800 rounded-xl px-4 py-3 border border-gray-700"
          >
            <div className="flex items-center gap-2 text-gray-300">
              <BarChart2 size={18} className="text-blue-400" />
              <span className="font-medium">Répartition par set</span>
            </div>
            <ChevronDown
              size={18}
              className={`text-gray-400 transition-transform ${showStats ? 'rotate-180' : ''}`}
            />
          </button>
        )}

        {showStats && (
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            {Object.entries(stats.sets)
              .sort((a, b) => b[1] - a[1])
              .map(([setName, count]) => (
                <div key={setName} className="flex justify-between px-4 py-2 border-b border-gray-700 last:border-0">
                  <span className="text-gray-300 text-sm truncate">{setName}</span>
                  <span className="text-yellow-400 font-bold text-sm ml-2">{count}</span>
                </div>
              ))}
          </div>
        )}

        {/* Search + Sort */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Chercher dans ma collection…"
              className="w-full bg-gray-800 text-white rounded-xl pl-9 pr-4 py-3 border border-gray-700 focus:outline-none focus:border-yellow-400 placeholder-gray-500 text-sm"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-gray-800 text-white rounded-xl px-3 border border-gray-700 focus:outline-none text-sm"
          >
            <option value="recent">Récent</option>
            <option value="name">Nom</option>
            <option value="set">Set</option>
          </select>
        </div>

        {/* Grid */}
        {cards.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            {search ? (
              <p>Aucune carte pour &quot;{search}&quot;</p>
            ) : (
              <>
                <p className="text-lg">Ta collection est vide</p>
                <p className="text-sm mt-2">Scanner des cartes pour commencer !</p>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {cards.map((card) => (
              <div key={card.id} className="relative">
                <PokemonCard
                  card={card}
                  inCollection={true}
                  quantity={card.quantity}
                />
                <button
                  onClick={() => handleRemove(card.id)}
                  className="absolute top-1.5 right-1.5 bg-red-600/80 hover:bg-red-500 rounded-full p-1.5 shadow transition-colors active:scale-90"
                  title="Retirer"
                >
                  <Trash2 size={12} className="text-white" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
