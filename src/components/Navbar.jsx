import { Link, useLocation } from 'react-router-dom';
import { ScanLine, BookOpen, Search } from 'lucide-react';

export default function Navbar({ collectionCount }) {
  const location = useLocation();

  const links = [
    { to: '/', icon: ScanLine, label: 'Scanner' },
    { to: '/collection', icon: BookOpen, label: `Collection${collectionCount > 0 ? ` (${collectionCount})` : ''}` },
    { to: '/browse', icon: Search, label: 'Rechercher' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 z-50 safe-area-inset-bottom">
      <div className="flex justify-around max-w-lg mx-auto">
        {links.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center py-3 px-2 flex-1 transition-colors ${
                active ? 'text-yellow-400' : 'text-gray-500 hover:text-gray-200'
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-xs mt-0.5 font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
