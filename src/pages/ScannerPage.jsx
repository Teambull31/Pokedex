import { useState, useRef, useCallback } from 'react';
import { Camera, Upload, Search, Plus, Check, Loader, X, Zap } from 'lucide-react';
import { runOCR } from '../utils/ocr';
import { searchCardsByName } from '../utils/api';
import { addToCollection, isInCollection } from '../utils/collection';
import PokemonCard from '../components/PokemonCard';

export default function ScannerPage({ collection, setCollection }) {
  const [image, setImage] = useState(null);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addedCards, setAddedCards] = useState({});
  const [hasSearched, setHasSearched] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);

  const cameraRef = useRef(null);
  const galleryRef = useRef(null);

  const doSearch = useCallback(async (query) => {
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setHasSearched(true);
    try {
      const data = await searchCardsByName(q);
      setResults(data.data || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleImageCapture = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset state
    setResults([]);
    setHasSearched(false);
    setOcrResult(null);
    setSearchQuery('');

    const url = URL.createObjectURL(file);
    setImage(url);
    setOcrLoading(true);
    setOcrProgress(0);

    try {
      const result = await runOCR(file, setOcrProgress);
      setOcrResult(result);
      const query = result.cardName || result.cardNumber || '';
      setSearchQuery(query);
      if (query) await doSearch(query);
    } catch (err) {
      console.error('OCR failed:', err);
    } finally {
      setOcrLoading(false);
      setOcrProgress(0);
    }

    // Reset file input so same file can be scanned again
    e.target.value = '';
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    doSearch(searchQuery);
  };

  const handleAddCard = (card) => {
    const next = addToCollection(collection, card);
    setCollection(next);
    setAddedCards((prev) => ({ ...prev, [card.id]: true }));
    setTimeout(() => setAddedCards((prev) => ({ ...prev, [card.id]: false })), 2000);
  };

  const clearImage = () => {
    setImage(null);
    setResults([]);
    setHasSearched(false);
    setSearchQuery('');
    setOcrResult(null);
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-700 to-red-600 px-4 pt-12 pb-6">
        <h1 className="text-2xl font-bold text-white text-center tracking-wide">
          Scanner une carte
        </h1>
        <p className="text-red-200 text-center text-sm mt-1">
          Photo ou galerie → détection automatique
        </p>
      </div>

      <div className="p-4 space-y-4 max-w-lg mx-auto">
        {/* Capture buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => cameraRef.current?.click()}
            className="flex flex-col items-center gap-2 bg-gray-800 hover:bg-gray-700 active:bg-gray-600 rounded-2xl p-5 transition-colors border border-gray-700"
          >
            <Camera size={32} className="text-yellow-400" />
            <span className="text-white font-semibold text-sm">Appareil photo</span>
          </button>
          <button
            onClick={() => galleryRef.current?.click()}
            className="flex flex-col items-center gap-2 bg-gray-800 hover:bg-gray-700 active:bg-gray-600 rounded-2xl p-5 transition-colors border border-gray-700"
          >
            <Upload size={32} className="text-blue-400" />
            <span className="text-white font-semibold text-sm">Galerie</span>
          </button>
        </div>

        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleImageCapture}
          className="hidden"
        />
        <input
          ref={galleryRef}
          type="file"
          accept="image/*"
          onChange={handleImageCapture}
          className="hidden"
        />

        {/* Image preview + OCR status */}
        {image && (
          <div className="relative rounded-2xl overflow-hidden border border-gray-700 bg-gray-900">
            <img
              src={image}
              alt="Carte scannée"
              className="w-full max-h-52 object-contain"
            />
            <button
              onClick={clearImage}
              className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 rounded-full p-1.5"
            >
              <X size={16} className="text-white" />
            </button>
            {ocrLoading && (
              <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center gap-3">
                <Zap size={28} className="text-yellow-400 animate-pulse" />
                <p className="text-white font-semibold">Analyse OCR…</p>
                <div className="w-48 bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all"
                    style={{ width: `${ocrProgress}%` }}
                  />
                </div>
                <p className="text-gray-300 text-sm">{ocrProgress}%</p>
              </div>
            )}
          </div>
        )}

        {/* OCR detected text */}
        {ocrResult?.cardName && !ocrLoading && (
          <div className="bg-gray-800 rounded-xl px-3 py-2 border border-gray-700">
            <p className="text-gray-400 text-xs mb-0.5">Texte détecté</p>
            <p className="text-yellow-400 font-semibold">{ocrResult.cardName}</p>
          </div>
        )}

        {/* Search bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Nom de la carte (ex: Pikachu)…"
            className="flex-1 bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-yellow-400 placeholder-gray-500"
          />
          <button
            type="submit"
            disabled={loading || !searchQuery.trim()}
            className="bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white rounded-xl px-4 py-3 transition-colors"
          >
            <Search size={20} />
          </button>
        </form>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-10">
            <Loader size={32} className="text-yellow-400 animate-spin" />
          </div>
        )}

        {/* Results */}
        {!loading && results.length > 0 && (
          <div>
            <p className="text-gray-400 text-sm mb-3 font-medium">
              {results.length} résultat{results.length > 1 ? 's' : ''} — appuie sur{' '}
              <span className="text-yellow-400">+</span> pour ajouter
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
                    onClick={() => handleAddCard(card)}
                    className={`absolute bottom-10 right-1.5 rounded-full p-2 shadow-lg transition-all active:scale-90 ${
                      addedCards[card.id]
                        ? 'bg-green-500'
                        : isInCollection(collection, card.id)
                        ? 'bg-blue-600 hover:bg-blue-500'
                        : 'bg-red-600 hover:bg-red-500'
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
          </div>
        )}

        {/* No results */}
        {!loading && hasSearched && results.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            <Search size={40} className="mx-auto mb-3 opacity-30" />
            <p>Aucune carte trouvée pour &quot;{searchQuery}&quot;</p>
            <p className="text-sm mt-1">Essaie un autre nom</p>
          </div>
        )}

        {/* Initial hint */}
        {!image && !hasSearched && (
          <div className="text-center py-10 text-gray-600">
            <Camera size={48} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm">Prends une photo de ta carte ou cherche son nom</p>
          </div>
        )}
      </div>
    </div>
  );
}
