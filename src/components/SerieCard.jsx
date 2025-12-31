import { Link } from "react-router-dom";

function SerieCard({ id, nome }) {
  return (
    <Link
      to={`/serie/${id}`}
      className="group relative bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col h-full overflow-hidden"
    >
      {/* Elemento decorativo astratto sullo sfondo */}
      <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 scale-0 group-hover:scale-150"></div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 shrink-0 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-inner">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-lg">
            Collection
          </span>
        </div>

        <h2 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
          {nome}
        </h2>
        
        <p className="text-gray-400 text-xs mt-auto flex items-center gap-1 group-hover:text-blue-500 transition-colors">
          Esplora volumi 
          <span className="transform group-hover:translate-x-1 transition-transform">→</span>
        </p>
      </div>
    </Link>
  );
}

export default SerieCard;