import { Link } from "react-router-dom";

function GenereCard({ id, nome, isEditor, onEdit, onDelete }) {
  const displayNome = nome || "Senza Nome";

  return (
    <div className="relative group h-full">
      <Link
        to={`/genere/${id}`}
        className="flex flex-col items-center justify-center h-full p-4 sm:p-5 bg-white rounded-xl border border-gray-100 shadow-sm transition-all duration-200 hover:border-blue-500 hover:shadow-md active:scale-[0.97]"
      >
        {/* Titolo Genere */}
        <span className="text-[13px] sm:text-sm font-bold text-gray-700 group-hover:text-blue-600 text-center uppercase tracking-wide leading-snug wrap-break-words w-full px-1">
          {displayNome}
        </span>
      </Link>

      {/* AZIONI EDITOR */}
      {isEditor && (
        // Visibile di default su mobile (opacity-100), nascosto e su hover solo su desktop (md:opacity-0)
        <div className="absolute top-2 right-2 flex gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 z-20">
          
          {/* MODIFICA */}
          <button
            onClick={(e) => {
              e.preventDefault();
              onEdit(id);
            }}
            className="p-1.5 bg-white/90 backdrop-blur-sm text-blue-600 rounded-md border border-blue-100 hover:bg-blue-500 hover:text-white transition-all shadow-sm active:scale-90"
            title="Modifica"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>

          {/* ELIMINA */}
          <button
            onClick={(e) => {
              e.preventDefault();
              onDelete(id);
            }}
            className="p-1.5 bg-white/90 backdrop-blur-sm text-red-600 rounded-md border border-red-100 hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-90"
            title="Elimina"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

export default GenereCard;