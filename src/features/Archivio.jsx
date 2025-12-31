import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

function Archivio() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar setUser={setUser} setError={setError} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* INTESTAZIONE (Coerente con Home e Biblioteca) */}
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-md text-center mb-10 border-t-4 border-blue-600">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
            🏛️ Archivio Generale
          </h1>
          <p className="text-base md:text-lg text-gray-600">
            Esplora il database completo o contribuisci alla gestione dei
            contenuti.
          </p>
        </div>

        {/* GUIDA PER GLI EDITOR */}
        <div className="bg-white border-l-4 border-blue-600 rounded-r-xl shadow-sm p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            🛠️ Guida per Editor (Beta)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Sezione Autori, Serie, Generi */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-blue-600 border-b pb-2">
                ✍️ Autori, Serie e Generi
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Per gestire queste categorie, entra nella sezione specifica e
                clicca su <strong>"Nuovo"</strong>.
              </p>
              <ul className="space-y-2 text-sm">
                <li>
                  <span className="text-green-600 font-bold">CREARE:</span>{" "}
                  Prima di inserire, controlla sempre che il nome non sia già
                  presente nel database.
                </li>
                <li>
                  <span className="text-blue-600 font-bold">
                    MODIFICARE/ELIMINARE:
                  </span>{" "}
                  Se trovi un errore o un duplicato, entra nel dettaglio
                  dell'elemento per correggere o rimuovere.
                </li>
              </ul>
            </div>

            {/* Sezione Opere */}
            <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
              <h3 className="text-lg font-bold text-blue-600 mb-3">
                📖 Gestione Opere
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                La creazione di un'opera richiede una struttura precisa. Una
                volta cliccato su
                <span className="text-green-600 font-bold"> Nuova Opera</span>:
              </p>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="font-bold text-gray-700 uppercase mb-1">
                    Obbligatori:
                  </p>
                  <ul className="list-disc list-inside text-gray-500">
                    <li>Titolo e Tipo</li>
                    <li>Anno pubblicazione</li>
                    <li>Stato opera</li>
                    <li>Almeno un autore</li>
                    <li>Almeno un genere</li>
                  </ul>
                </div>
                <div>
                  <p className="font-bold text-gray-700 uppercase mb-1">
                    Opzionali:
                  </p>
                  <ul className="list-disc list-inside text-gray-500">
                    <li>Serie</li>
                    <li>Editore</li>
                    <li>Lingua originale</li>
                  </ul>
                </div>
              </div>
              <p className="mt-4 text-[11px] text-gray-400 italic">
                * Errori? Puoi sempre{" "}
                <span className="text-blue-600 font-semibold">modificare</span>{" "}
                o <span className="text-red-600 font-semibold">eliminare</span>{" "}
                dal dettaglio opera.
              </p>
            </div>
          </div>
        </div>

        {/* GRID NAVIGAZIONE - Responsive 1 col (mob), 2 col (tablet), 3 col (desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            to="/ListOpere"
            className="p-6 bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-200 group active:scale-95"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">📚</span>
              <span className="text-blue-600 group-hover:translate-x-1 transition-transform">
                ➔
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Opere</h2>
            <p className="text-gray-500 text-sm">
              Il catalogo completo di libri, manga e riviste.
            </p>
          </Link>

          <Link
            to="/ListSerie"
            className="p-6 bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-200 group active:scale-95"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">🗂️</span>
              <span className="text-blue-600 group-hover:translate-x-1 transition-transform">
                ➔
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Serie</h2>
            <p className="text-gray-500 text-sm">
              Raccolte, saghe e testate periodiche.
            </p>
          </Link>

          <Link
            to="/ListAutori"
            className="p-6 bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-200 group active:scale-95"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">✍️</span>
              <span className="text-blue-600 group-hover:translate-x-1 transition-transform">
                ➔
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Autori</h2>
            <p className="text-gray-500 text-sm">
              Scrittori, mangaka e illustratori.
            </p>
          </Link>

          <Link
            to="/ListGeneri"
            className="p-6 bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-200 group active:scale-95"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">🎭</span>
              <span className="text-blue-600 group-hover:translate-x-1 transition-transform">
                ➔
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Generi</h2>
            <p className="text-gray-500 text-sm">
              Classificazione tematica delle opere.
            </p>
          </Link>

          {/* Elementi in sviluppo */}
          {["Editori", "Anni"].map((item, idx) => (
            <div
              key={idx}
              className="p-6 bg-gray-50 rounded-xl border border-gray-200 opacity-60 relative overflow-hidden"
            >
              <span className="absolute top-2 right-2 bg-gray-200 text-gray-500 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                Soon
              </span>
              <h2 className="text-xl font-bold text-gray-400 mb-2">
                {idx === 0 ? "🏢 Editori" : "📅 Anni"}
              </h2>
              <p className="text-gray-400 italic text-sm">
                Funzionalità in arrivo.
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Archivio;
