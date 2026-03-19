import { Link } from "react-router-dom";

function SerieCard({ id, nome }) {
  return (
    <Link
      to={`/serie/${id}`}
      // Aggiunto active:scale-[0.97], rounded-xl (invece di 2xl) e uniformato shadow/border
      className="group relative bg-white rounded-xl p-4 sm:p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-400 transition-all duration-200 flex flex-col h-full overflow-hidden active:scale-[0.97]"
    >
      {/* Elemento decorativo astratto: visibile di default ma delicato su mobile, si anima su desktop */}
      <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-50 rounded-full opacity-50 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-500 sm:scale-0 sm:group-hover:scale-150"></div>

      <div className="relative z-10 flex flex-col h-full">
        
        {/* Top: Icona + Badge */}
        <div className="flex items-center gap-2.5 mb-3 sm:mb-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 shrink-0 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center sm:group-hover:bg-blue-600 sm:group-hover:text-white transition-all duration-300">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <span className="text-[9px] sm:text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-md">
            Collection
          </span>
        </div>

        {/* Titolo */}
        <h2 className="text-[15px] sm:text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2 leading-snug">
          {nome}
        </h2>
        
        {/* Bottom: Link testuale */}
        <p className="text-gray-400 text-[11px] sm:text-xs mt-auto flex items-center gap-1 group-hover:text-blue-500 transition-colors font-medium">
          Esplora volumi 
          <span className="transform group-hover:translate-x-1 transition-transform">→</span>
        </p>

      </div>
    </Link>
  );
}

export default SerieCard;