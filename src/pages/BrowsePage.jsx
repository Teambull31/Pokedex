import { useState } from 'react';
import { Search, Plus, Check, Loader, Sparkles } from 'lucide-react';
import { addToCollection, isInCollection } from '../utils/collection';
import PokemonCard from '../components/PokemonCard';

const POPULAR = [
  'Pikachu', 'Charizard', 'Mewtwo', 'Eevee', 'Gengar',
  'Blastoise', 'Lugia', 'Rayquaza', 'Garchomp', 'Greninja',
];

export default function BrowsePage({ collection, setCollection }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [addedCards, setAddedCards] = useState({});
  const [hasSearched, setHasSearched] = useState(false);
  const [currentQuery, setCurrentQuery] = useState('');

  const doSearch = async (q, p = 1) => {
    if (!q.trim()) return;
    setLoading(true);
    setHasSearched(true);
    setCurrentQuery(q);
    try {
      const encoded = encodeURIComponent(`name:"${q}"`);
      const res = await fetch(
        `https://api.pokemontcg.io/v2/cards?q=${encoded}&page=${p}&pageSize=20&orderBy=name`
      );
      const data = await res.json();
      if (p === 1) {
        setResults(data.data || []);
      } else {
        setResults((prev) => [...prev, ...(data.data || [])]);
      }
      setTotalCount(data.totalCount || 0);
      setPage(p);
    } catch {
      if (p === 1) setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setResults([]);
    doSearch(query, 1);
  };

  const handleQuickSearch = (name) => {
    setQuery(name);
    setPage(1);
    setResults([]);
    doSearch(name, 1);
  };

  const handleLoadMore = () => doSearch(currentQuery, page + 1);

  const handleAdd = (card) => {
    const next = addToCollection(collection, card);
    setCollection(next);
    setAddedCards((prev) => ({ ...prev, [card.id]: true }));
    setTimeout(() => setAddedCards((prev) => ({ ...prev, [card.id]: false })), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-800 to-purple-700 px-4 pt-12 pb-5">
        <h1 className="text-2xl font-bold text-white text-center">Rechercher</h1>
        <p className="text-purple-200 text-center text-sm mt-1">
          Trouve n'importe quelle carte Pokémon
        </p>
      </div>

      <div className="p-4 space-y-4 max-w-lg mx-auto">
        {/* Search form */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ex: Pikachu, Charizard, Mewtwo…"
            className="flex-1 bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-purple-400 placeholder-gray-500"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white rounded-xl px-4 py-3 transition-colors"
          >
            <Search size={20} />
          </button>
        </form>

        {/* Popular chips */}
        {!hasSearched && (
          <div>
            <p className="text-gray-500 text-xs mb-2 flex items-center gap-1">
              <Sparkles size={12} /> Pokémon populaires
            </p>
            <div className="flex flex-wrap gap-2">
              {POPULAR.map((name) => (
                <button
                  key={name}
                  onClick={() => handleQuickSearch(name)}
                  className="bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full px-3 py-1.5 text-sm border border-gray-700 transition-colors active:scale-95"
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && page === 1 && (
          <div className="flex justify-center py-12">
            <Loader size={32} className="text-yellow-400 animate-spin" />
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div>
            <p className="text-gray-400 text-sm mb-3">
              {totalCount} carte{totalCount > 1 ? 's' : ''} trouvée{totalCount > 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {results.map((card) => (
                <div key={card.id} className="relative">
                  <PokemonCard
                    card={card}
                    inCollection={isInCollection(collection, card.id)}
                    quantity={collection[card.id]?.quantity}
                  />
                  <button
                    onClick={() => handleAdd(card)}
                    className={`absolute bottom-10 right-1.5 rounded-full p-2 shadow-lg transition-all active:scale-90 ${
                      addedCards[card.id]
                        ? 'bg-green-500'
                        : isInCollection(collection, card.id)
                        ? 'bg-blue-600 hover:bg-blue-500'
                        : 'bg-purple-600 hover:bg-purple-500'
                    }`}
                  >
                    {addedCards[card.id] ? (
                      <Check size={16} className="text-white" />
                    ) : (
                      <Plus size={16} className="text-white" />
                    )}
                  </button>
                </div>
              ))}
            </div>

            {results.length < totalCount && (
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="w-full mt-4 bg-gray-800 hover:bg-gray-700 text-white rounded-xl py-3 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader size={18} className="animate-spin" />
                ) : (
                  <>Charger plus ({results.length}/{totalCount})</>
                )}
              </button>
            )}
          </div>
        )}

        {/* No results */}
        {!loading && hasSearched && results.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>Aucune carte trouvée pour &quot;{currentQuery}&quot;</p>
          </div>
        )}
      </div>
    </div>
  );
}
