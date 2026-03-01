import { useState, useRef } from 'react';
import { Camera, Upload, Search, Plus, Check, Loader, X, Zap } from 'lucide-react';
import { searchByName } from '../api';
import { add } from '../storage';
import Card from './Card';

function extractCardName(text) {
  const skip = /^(HP|\d|GX|EX|VMAX|VSTAR|V\b|Basic|Stage|Trainer|Energy|Item|Supporter|Tool|©|Illus|Pokémon|—)/i;
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length >= 3 && l.length <= 30 && /^[a-zA-Zéèê]/.test(l) && !skip.test(l) && !l.includes('/'));
  return lines[0] || '';
}

export default function Scanner({ collection, setCollection }) {
  const [image, setImage] = useState(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ocrState, setOcrState] = useState('idle'); // idle | running | done | error
  const [ocrPct, setOcrPct] = useState(0);
  const [added, setAdded] = useState({});
  const [searched, setSearched] = useState(false);

  const camRef = useRef();
  const galRef = useRef();

  const doSearch = async (q) => {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const { data } = await searchByName(q.trim());
      setResults(data || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFile = async (file) => {
    if (!file) return;
    setImage(URL.createObjectURL(file));
    setResults([]);
    setQuery('');
    setSearched(false);
    setOcrState('running');
    setOcrPct(0);

    try {
      // Dynamic import — only loaded when needed, won't crash the app if it fails
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker('eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setOcrPct(Math.round(m.progress * 100));
          }
        },
      });
      const {
        data: { text },
      } = await worker.recognize(file);
      await worker.terminate();

      const name = extractCardName(text);
      setOcrState('done');
      setQuery(name);
      if (name) doSearch(name);
    } catch {
      setOcrState('error');
    }
  };

  const handleAdd = (card) => {
    setCollection((prev) => add(prev, card));
    setAdded((prev) => ({ ...prev, [card.id]: true }));
    setTimeout(() => setAdded((prev) => ({ ...prev, [card.id]: false })), 2000);
  };

  const clear = () => {
    setImage(null);
    setResults([]);
    setQuery('');
    setSearched(false);
    setOcrState('idle');
  };

  return (
    <div>
      {/* Header */}
      <div className="bg-red-700 px-4 pt-12 pb-5 text-center">
        <h1 className="text-xl font-bold">Scanner une carte</h1>
        <p className="text-red-200 text-sm mt-1">Photo → détection automatique du nom</p>
      </div>

      <div className="p-4 space-y-4 max-w-lg mx-auto">
        {/* Capture buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => camRef.current?.click()}
            className="flex flex-col items-center gap-2 bg-gray-800 rounded-2xl p-5 border border-gray-700 active:bg-gray-700"
          >
            <Camera size={32} className="text-yellow-400" />
            <span className="text-sm font-semibold">Appareil photo</span>
          </button>
          <button
            onClick={() => galRef.current?.click()}
            className="flex flex-col items-center gap-2 bg-gray-800 rounded-2xl p-5 border border-gray-700 active:bg-gray-700"
          >
            <Upload size={32} className="text-blue-400" />
            <span className="text-sm font-semibold">Galerie</span>
          </button>
        </div>

        <input
          ref={camRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            handleFile(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
        <input
          ref={galRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            handleFile(e.target.files?.[0]);
            e.target.value = '';
          }}
        />

        {/* Image preview */}
        {image && (
          <div className="relative rounded-2xl overflow-hidden border border-gray-700 bg-gray-800">
            <img src={image} alt="carte" className="w-full max-h-52 object-contain" />
            <button
              onClick={clear}
              className="absolute top-2 right-2 bg-black/60 rounded-full p-1.5"
            >
              <X size={16} />
            </button>
            {ocrState === 'running' && (
              <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center gap-2">
                <Zap size={28} className="text-yellow-400 animate-pulse" />
                <p className="text-sm font-semibold">Analyse OCR… {ocrPct}%</p>
                <div className="w-40 bg-gray-600 rounded-full h-1.5">
                  <div
                    className="bg-yellow-400 h-1.5 rounded-full transition-all"
                    style={{ width: `${ocrPct}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* OCR result hint */}
        {ocrState === 'done' && query && (
          <p className="text-xs text-gray-400">
            Texte détecté :{' '}
            <span className="text-yellow-400 font-semibold">{query}</span>
          </p>
        )}
        {ocrState === 'error' && (
          <p className="text-xs text-red-400">OCR échoué — tape le nom manuellement.</p>
        )}

        {/* Search bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            doSearch(query);
          }}
          className="flex gap-2"
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nom de la carte (ex: Pikachu)…"
            className="flex-1 bg-gray-800 rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-yellow-400 text-sm placeholder-gray-500"
          />
          <button
            type="submit"
            disabled={!query.trim() || loading}
            className="bg-red-600 hover:bg-red-500 disabled:opacity-40 rounded-xl px-4 py-3 transition-colors"
          >
            <Search size={20} />
          </button>
        </form>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-8">
            <Loader size={28} className="text-yellow-400 animate-spin" />
          </div>
        )}

        {/* Results */}
        {!loading && results.length > 0 && (
          <div>
            <p className="text-gray-400 text-sm mb-3">
              {results.length} résultat(s) — appuie sur{' '}
              <span className="text-yellow-400">+</span> pour ajouter
            </p>
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
                        : 'bg-red-600'
                    }`}
                  >
                    {added[card.id] ? <Check size={16} /> : <Plus size={16} />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No results */}
        {!loading && searched && results.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>Aucune carte pour &quot;{query}&quot;</p>
            <p className="text-xs mt-1">Essaie un autre nom</p>
          </div>
        )}

        {/* Initial hint */}
        {!image && !searched && (
          <div className="text-center py-12 text-gray-600">
            <Camera size={48} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm">Prends une photo ou tape un nom de carte</p>
          </div>
        )}
      </div>
    </div>
  );
}
