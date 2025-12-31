import { Link } from "react-router-dom";

function GenereCard({ id, nome, isEditor, onEdit, onDelete }) {
  const displayNome = nome || "Senza Nome";

  return (
    <div className="relative group">
      <Link
        to={`/genere/${id}`}
        className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-gray-200 shadow-sm transition-all duration-200 hover:border-blue-500 hover:shadow-md min-h-[100px]"
      >
        {/* Titolo Genere */}
        <span className="text-sm font-bold text-gray-800 group-hover:text-blue-600 text-center uppercase tracking-tight">
          {displayNome}
        </span>
      </Link>

      {/* AZIONI EDITOR */}
      {isEditor && (
        <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
          {/* MODIFICA - BLU */}
          <button
            onClick={(e) => {
              e.preventDefault();
              onEdit(id);
            }}
            className="p-1.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-100 hover:bg-blue-500 hover:text-white transition-all shadow-sm"
            title="Modifica"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>

          {/* ELIMINA - ROSSO */}
          <button
            onClick={(e) => {
              e.preventDefault();
              onDelete(id);
            }}
            className="p-1.5 bg-red-50 text-red-600 rounded-lg border border-red-100 hover:bg-red-500 hover:text-white transition-all shadow-sm"
            title="Elimina"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

export default GenereCard;