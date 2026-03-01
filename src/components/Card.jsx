export default function Card({ card, owned, qty }) {
  const imgSrc = card.img || card.images?.small;
  const setName = card.set?.name || card.set || '';

  return (
    <div
      className={`relative rounded-xl overflow-hidden border-2 bg-gray-800 ${
        owned ? 'border-yellow-400 shadow-lg shadow-yellow-400/20' : 'border-gray-700'
      }`}
    >
      {imgSrc ? (
        <img src={imgSrc} alt={card.name} className="w-full object-cover" loading="lazy" />
      ) : (
        <div className="aspect-[63/88] flex items-center justify-center p-3 bg-gray-700">
          <span className="text-sm font-bold text-center leading-tight">{card.name}</span>
        </div>
      )}

      <div className="px-2 py-1.5 bg-gray-900">
        <p className="text-xs font-semibold text-white truncate">{card.name}</p>
        <p className="text-xs text-gray-400 truncate">{setName}</p>
      </div>

      {owned && (
        <div className="absolute top-1.5 left-1.5 bg-yellow-400 text-gray-900 text-xs font-bold rounded-full px-1.5 py-0.5 leading-none">
          {qty > 1 ? `×${qty}` : '✓'}
        </div>
      )}
    </div>
  );
}
