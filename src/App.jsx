import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { loadCollection } from './utils/collection';
import Navbar from './components/Navbar';
import ScannerPage from './pages/ScannerPage';
import CollectionPage from './pages/CollectionPage';
import BrowsePage from './pages/BrowsePage';

function AppRoutes({ collection, setCollection }) {
  const location = useLocation();
  const total = Object.values(collection).reduce((s, c) => s + c.quantity, 0);

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={<ScannerPage collection={collection} setCollection={setCollection} />}
        />
        <Route
          path="/collection"
          element={<CollectionPage collection={collection} setCollection={setCollection} />}
        />
        <Route
          path="/browse"
          element={<BrowsePage collection={collection} setCollection={setCollection} />}
        />
      </Routes>
      <Navbar collectionCount={total} />
    </>
  );
}

export default function App() {
  const [collection, setCollection] = useState(() => loadCollection());

  return (
    <Router>
      <div className="min-h-screen bg-gray-950 text-white pb-20">
        <AppRoutes collection={collection} setCollection={setCollection} />
      </div>
    </Router>
  );
}
