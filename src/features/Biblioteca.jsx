import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

function Biblioteca() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2 text-center">
          📚 La Mia Biblioteca
        </h1>
        <p className="text-gray-500 text-center mb-10">
          Esplora i tuoi diari personali e il database delle opere
        </p>

        {/* SEZIONE: I MIEI DIARI (Filtri attivi) */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="bg-blue-600 w-2 h-6 rounded-full"></span>I MIEI
            DIARI
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* TUTTE LE LETTURE */}
            <Link
              to="/listletture"
              className="p-5 bg-linear-to-br from-blue-600 to-blue-700 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1 text-white"
            >
              <h3 className="text-lg font-bold mb-1">📖 Tutte le Letture</h3>
              <p className="text-blue-100 text-xs">
                L'elenco completo delle tue attività
              </p>
            </Link>

            {/* LIBRI (Tipo 1) */}
            <Link
              to="/listletture/libri"
              className="p-5 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200 group"
            >
              <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600">
                📗 Libri
              </h3>
              <p className="text-gray-500 text-xs italic">
                Solo narrativa e saggistica
              </p>
            </Link>

            {/* MANGA / FUMETTI (Tipo 2) */}
            <Link
              to="/listletture/manga"
              className="p-5 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200 group"
            >
              <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600">
                🎨 Manga & Fumetti
              </h3>
              <p className="text-gray-500 text-xs italic">
                Graphic novel e tavole
              </p>
            </Link>

            {/* RIVISTE (Tipo 3) */}
            <Link
              to="/listletture/riviste"
              className="p-5 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200 group"
            >
              <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600">
                📰 Riviste
              </h3>
              <p className="text-gray-500 text-xs italic">
                Periodici e pubblicazioni
              </p>
            </Link>
          </div>
        </div>

        {/* SEZIONE: ARCHIVIO GENERALE */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="bg-blue-500 w-2 h-6 rounded-full"></span>
            ALTRO
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* SEZIONE IN SVILUPPO (NON UTILIZZABILE) */}

            <div className="p-6 bg-gray-50 rounded-xl border border-gray-200 opacity-60 cursor-not-allowed relative overflow-hidden">
              <span className="absolute top-2 right-2 bg-gray-200 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                Developing
              </span>
              <h2 className="text-xl font-bold text-gray-400 mb-2">
                📅 Statistiche
              </h2>
              <p className="text-gray-400 italic text-sm">
                Analisi delle tue abitudini di lettura.
              </p>
            </div>

            <div className="p-6 bg-gray-50 rounded-xl border border-gray-200 opacity-60 cursor-not-allowed relative overflow-hidden">
              <span className="absolute top-2 right-2 bg-gray-200 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                Developing
              </span>
              <h2 className="text-xl font-bold text-gray-400 mb-2">
                ⭐ Serie Preferite
              </h2>
              <p className="text-gray-400 italic text-sm">
                Le tue serie più lette e apprezzate.
              </p>
            </div>

            <div className="p-6 bg-gray-50 rounded-xl border border-gray-200 opacity-60 cursor-not-allowed relative overflow-hidden">
              <span className="absolute top-2 right-2 bg-gray-200 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                Developing
              </span>
              <h2 className="text-xl font-bold text-gray-400 mb-2">
                ⭐ Autori Preferiti
              </h2>
              <p className="text-gray-400 italic text-sm">
                Gli autori che hai più letto e apprezzato.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Biblioteca;
