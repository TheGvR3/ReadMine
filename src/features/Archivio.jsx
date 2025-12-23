import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

function Archivio() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-10 text-center">
          Archivio
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* OPERE */}
          <Link
            to="/ListOpere"
            className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition border border-gray-200"
          >
            <h2 className="text-xl font-bold text-indigo-600 mb-2">📚 Opere</h2>
            <p className="text-gray-600">
              Visualizza tutte le opere presenti nel database.
            </p>
          </Link>

          {/* SERIE */}
          <Link
            to="/ListSerie"
            className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition border border-gray-200"
          >
            <h2 className="text-xl font-bold text-indigo-600 mb-2">🗂️ Serie</h2>
            <p className="text-gray-600">
              Gestisci e consulta tutte le serie registrate.
            </p>
          </Link>

          {/* AUTORI */}
          <Link
            to="/ListAutori"
            className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition border border-gray-200"
          >
            <h2 className="text-xl font-bold text-indigo-600 mb-2">
              ✍️ Autori
            </h2>
            <p className="text-gray-600">
              Elenco completo degli autori presenti.
            </p>
          </Link>

          {/* GENERI (se li hai) */}
          <Link
            to="/ListGeneri"
            className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition border border-gray-200"
          >
            <h2 className="text-xl font-bold text-indigo-600 mb-2">
              🎭 Generi
            </h2>
            <p className="text-gray-600">
              Consulta tutti i generi disponibili.
            </p>
          </Link>

          {/* Editori - Esempio Inattivo */}
          <div className="p-6 bg-gray-50 rounded-xl border border-gray-200 opacity-60 cursor-not-allowed relative overflow-hidden">
            {/* Badge "Prossimamente" */}
            <span className="absolute top-2 right-2 bg-indigo-100 text-indigo-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Soon
            </span>

            <h2 className="text-xl font-bold text-gray-500 mb-2">🏢 Editori</h2>
            <p className="text-gray-400 italic text-sm text-balance">
              Stiamo lavorando alla gestione dei cataloghi.
            </p>
          </div>

          {/* Anni - Esempio Inattivo */}
          <div className="p-6 bg-gray-50 rounded-xl border border-gray-200 opacity-60 cursor-not-allowed relative overflow-hidden">
            <span className="absolute top-2 right-2 bg-indigo-100 text-indigo-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Soon
            </span>

            <h2 className="text-xl font-bold text-gray-500 mb-2">📅 Anni</h2>
            <p className="text-gray-400 italic text-sm">
              Ricerca cronologica in arrivo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Archivio;
