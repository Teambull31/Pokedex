import { useState } from 'react';
import { Search, Plus, Check, Loader, Sparkles } from 'lucide-react';
import { searchByName } from '../api';
import { add } from '../storage';
import Card from './Card';

const POPULAR = [
  'Pikachu', 'Charizard', 'Mewtwo', 'Eevee', 'Gengar',
  'Blastoise', 'Lugia', 'Rayquaza', 'Greninja', 'Sylveon',
];

export default function Browse({ collection, setCollection }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState('');
  const [added, setAdded] = useState({});

  const doSearch = async (name, p = 1) => {
    if (!name.trim()) return;
    setLoading(true);
    setCurrent(name);
    try {
      const { data, totalCount } = await searchByName(name, p);
      if (p === 1) {
        setResults(data || []);
      } else {
        setResults((prev) => [...prev, ...(data || [])]);
      }
      setTotal(totalCount || 0);
      setPage(p);
    } catch {
      if (p === 1) setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = (card) => {
    setCollection((prev) => add(prev, card));
    setAdded((prev) => ({ ...prev, [card.id]: true }));
    setTimeout(() => setAdded((prev) => ({ ...prev, [card.id]: false })), 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setResults([]);
    doSearch(q, 1);
  };

  return (
    <div>
      {/* Header */}
      <div className="bg-purple-800 px-4 pt-12 pb-5 text-center">
        <h1 className="text-xl font-bold">Rechercher</h1>
        <p className="text-purple-200 text-sm mt-1">Toutes les cartes Pokémon</p>
      </div>

      <div className="p-4 space-y-4 max-w-lg mx-auto">
        {/* Search bar */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ex: Pikachu, Charizard…"
            className="flex-1 bg-gray-800 rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-purple-400 text-sm placeholder-gray-500"
          />
          <button
            type="submit"
            disabled={!q.trim() || loading}
            className="bg-purple-600 hover:bg-purple-500 disabled:opacity-40 rounded-xl px-4 py-3 transition-colors"
          >
            <Search size={20} />
          </button>
        </form>

        {/* Popular chips */}
        {!current && (
          <div>
            <p className="text-gray-500 text-xs flex items-center gap-1 mb-2">
              <Sparkles size={12} /> Populaires
            </p>
            <div className="flex flex-wrap gap-2">
              {POPULAR.map((name) => (
                <button
                  key={name}
                  onClick={() => {
                    setQ(name);
                    setResults([]);
                    doSearch(name, 1);
                  }}
                  className="bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full px-3 py-1.5 text-sm border border-gray-700 active:scale-95 transition-transform"
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && !results.length && (
          <div className="flex justify-center py-12">
            <Loader size={28} className="text-yellow-400 animate-spin" />
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div>
            <p className="text-gray-400 text-sm mb-3">{total} carte(s) trouvée(s)</p>
            <div className="grid grid-cols-2 gap-3">
              {results.map((card) => (
                <div key={card.id} className="relative">
                  <Card card={card} owned={!!collection[card.id]} qty={collection[card.id]?.qty} />
                  <button
                    onClick={() => handleAdd(card)}
                    className={`absolute bottom-10 right-1.5 rounded-full p-2 shadow-lg transition-all active:scale-90 ${
                      added[card.id]
                        ? 'bg-green-500'
                        : collection[card.id]
                        ? 'bg-blue-600'
                        : 'bg-purple-600'
                    }`}
                  >
                    {added[card.id] ? <Check size={16} /> : <Plus size={16} />}
                  </button>
                </div>
              ))}
            </div>

            {results.length < total && (
              <button
                onClick={() => doSearch(current, page + 1)}
                disabled={loading}
                className="w-full mt-4 bg-gray-800 hover:bg-gray-700 rounded-xl py-3 text-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader size={16} className="animate-spin" />
                ) : (
                  `Charger plus (${results.length} / ${total})`
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
