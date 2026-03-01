import { useState } from 'react';
import { ScanLine, BookOpen, Search } from 'lucide-react';
import { load } from './storage';
import Scanner from './components/Scanner';
import Collection from './components/Collection';
import Browse from './components/Browse';

const TABS = [
  { id: 'scanner', label: 'Scanner', Icon: ScanLine },
  { id: 'collection', label: 'Collection', Icon: BookOpen },
  { id: 'browse', label: 'Rechercher', Icon: Search },
];

export default function App() {
  const [tab, setTab] = useState('scanner');
  const [collection, setCollection] = useState(load);

  const total = Object.values(collection).reduce((s, c) => s + c.qty, 0);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="pb-16">
        {tab === 'scanner' && (
          <Scanner collection={collection} setCollection={setCollection} />
        )}
        {tab === 'collection' && (
          <Collection collection={collection} setCollection={setCollection} />
        )}
        {tab === 'browse' && (
          <Browse collection={collection} setCollection={setCollection} />
        )}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 flex z-50">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 flex flex-col items-center py-3 gap-1 text-xs font-medium transition-colors ${
              tab === id ? 'text-yellow-400' : 'text-gray-400 active:text-white'
            }`}
          >
            <Icon size={22} strokeWidth={tab === id ? 2.5 : 1.8} />
            {id === 'collection' && total > 0 ? `Collection (${total})` : label}
          </button>
        ))}
      </nav>
    </div>
  );
}
