const TYPE_COLORS = {
  Fire: 'bg-gradient-to-b from-orange-500 to-red-700',
  Water: 'bg-gradient-to-b from-blue-400 to-cyan-700',
  Grass: 'bg-gradient-to-b from-green-400 to-emerald-700',
  Lightning: 'bg-gradient-to-b from-yellow-300 to-amber-600',
  Psychic: 'bg-gradient-to-b from-pink-400 to-purple-700',
  Fighting: 'bg-gradient-to-b from-orange-700 to-red-900',
  Darkness: 'bg-gradient-to-b from-gray-600 to-gray-900',
  Metal: 'bg-gradient-to-b from-gray-400 to-gray-600',
  Dragon: 'bg-gradient-to-b from-indigo-500 to-blue-900',
  Colorless: 'bg-gradient-to-b from-gray-400 to-gray-500',
  Fairy: 'bg-gradient-to-b from-pink-300 to-pink-600',
};

export default function PokemonCard({ card, inCollection, quantity, onClick }) {
  const type = card.types?.[0];
  const gradient = TYPE_COLORS[type] || 'bg-gradient-to-b from-gray-600 to-gray-800';

  return (
    <div
      onClick={onClick}
      className={`relative rounded-xl overflow-hidden border-2 transition-transform active:scale-95 ${
        inCollection ? 'border-yellow-400 shadow-yellow-400/30 shadow-lg' : 'border-gray-700'
      } bg-gray-900 ${onClick ? 'cursor-pointer' : ''}`}
    >
      {card.images?.small ? (
        <img
          src={card.images.small}
          alt={card.name}
          className="w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className={`${gradient} aspect-[63/88] flex items-center justify-center p-2`}>
          <span className="text-white font-bold text-center text-sm">{card.name}</span>
        </div>
      )}

      <div className="px-2 py-1.5 bg-gray-900">
        <p className="text-white text-xs font-semibold truncate">{card.name}</p>
        <p className="text-gray-400 text-xs truncate">{card.set?.name || ''}</p>
      </div>

      {inCollection && (
        <div className="absolute top-1.5 left-1.5 bg-yellow-400 text-gray-900 rounded-full text-xs font-bold px-1.5 py-0.5 leading-none">
          {quantity > 1 ? `×${quantity}` : '✓'}
        </div>
      )}
    </div>
  );
}
