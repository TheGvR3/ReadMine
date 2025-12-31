import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

function Biblioteca() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar setUser={setUser} setError={setError} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* INTESTAZIONE (Stile simile alla Home) */}
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-md text-center mb-10 border-t-4 border-blue-600">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
            📚 La Mia Biblioteca
          </h1>
          <p className="text-base md:text-lg text-gray-600">
            Esplora i tuoi diari personali e gestisci le tue letture.
          </p>
        </div>

        {/* GUIDA RAPIDA ALL'USO DELLA BIBLIOTECA */}
        <div className="bg-white border-l-4 border-blue-600 rounded-r-xl shadow-sm p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            📖 Guida alla Tua Libreria (Beta)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Sezione Filtri */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-blue-600 border-b pb-2">
                🔍 Filtra i tuoi Diari
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Puoi consultare la tua cronologia completa o isolare specifiche
                categorie per tipo di opera:
              </p>
              <ul className="grid grid-cols-1 gap-2 text-sm text-gray-700 font-medium">
                <li className="flex items-center gap-2">
                  📗 <span className="text-blue-700">Libri:</span> Solo
                  narrativa e saggistica.
                </li>
                <li className="flex items-center gap-2">
                  🎨 <span className="text-blue-700">Manga & Fumetti:</span>{" "}
                  Tutte le tue graphic novel.
                </li>
                <li className="flex items-center gap-2">
                  📰 <span className="text-blue-700">Riviste:</span> Periodici e
                  pubblicazioni.
                </li>
              </ul>
            </div>

            {/* Sezione Aggiunta Lettura */}
            <div className="bg-blue-50/50 p-5 rounded-lg border border-blue-100">
              <h3 className="text-lg font-bold text-blue-900 mb-3">
                ✨ Aggiungere una Lettura
              </h3>
              <p className="text-gray-600 text-xs mb-4 leading-relaxed">
                Puoi farlo da qui cliccando su <strong>"Aggiungi"</strong>,
                oppure dalla "Lista Opere" tramite il tasto <strong>"+"</strong>{" "}
                o <strong>"+Diario"</strong> nel dettaglio.
              </p>
              <div className="grid grid-cols-2 gap-4 text-[11px]">
                <div>
                  <p className="font-bold text-blue-800 uppercase mb-1">
                    Obbligatori:
                  </p>
                  <ul className="list-disc list-inside text-blue-900">
                    <li>Nome Opera</li>
                    <li>Stato (In corso, etc.)</li>
                  </ul>
                </div>
                <div>
                  <p className="font-bold text-gray-700 uppercase mb-1">
                    Opzionali:
                  </p>
                  <ul className="list-disc list-inside text-gray-500">
                    <li>Volume / Capitolo / Pagina</li>
                    <li>Data e Valutazione</li>
                    <li>Note Personali</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SEZIONE: I MIEI DIARI */}
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <span className="bg-blue-600 w-2 h-6 rounded-full"></span>I MIEI
              DIARI
            </h2>
            <Link
              to="/createlettura"
              className="w-full sm:w-auto text-center bg-green-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-green-700 transition-all shadow-md active:scale-95"
            >
              Aggiungi Lettura
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/listletture"
              className="p-5 bg-linear-to-br from-blue-600 to-blue-700 rounded-xl shadow-md hover:shadow-lg transition-all text-white"
            >
              <h3 className="text-lg font-bold mb-1">📖 Tutte le Letture</h3>
              <p className="text-blue-100 text-xs">
                Cronologia completa delle attività
              </p>
            </Link>

            <Link
              to="/listletture/libri"
              className="p-5 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200 group"
            >
              <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                📗 Libri
              </h3>
              <p className="text-gray-500 text-xs italic">
                Narrativa e saggistica
              </p>
            </Link>

            <Link
              to="/listletture/manga"
              className="p-5 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200 group"
            >
              <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                🎨 Manga & Fumetti
              </h3>
              <p className="text-gray-500 text-xs italic">
                Graphic novel e tavole
              </p>
            </Link>

            <Link
              to="/listletture/riviste"
              className="p-5 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200 group"
            >
              <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                📰 Riviste
              </h3>
              <p className="text-gray-500 text-xs italic">
                Periodici e pubblicazioni
              </p>
            </Link>
          </div>
        </div>

        {/* SEZIONE: ALTRO (Sviluppo) */}
        <div className="pb-12">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="bg-blue-400 w-2 h-6 rounded-full"></span>ALTRO
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {["Statistiche", "Serie Preferite", "Autori Preferiti"].map(
              (item, idx) => (
                <div
                  key={idx}
                  className="p-6 bg-gray-50 rounded-xl border border-gray-200 opacity-60 relative overflow-hidden"
                >
                  <span className="absolute top-2 right-2 bg-gray-200 text-gray-500 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                    Soon
                  </span>
                  <h2 className="text-lg font-bold text-gray-400 mb-1">
                    {item}
                  </h2>
                  <p className="text-gray-400 italic text-xs">
                    In fase di sviluppo.
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Biblioteca;
