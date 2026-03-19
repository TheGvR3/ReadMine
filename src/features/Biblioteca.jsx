import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Button from "../components/ui/Button"; // <-- Importiamo il nostro nuovo componente!
import { useAuth } from "../context/AuthContext";

function Biblioteca() {
  const { user } = useAuth(); // Recuperiamo l'utente globalmente
  const [error, setError] = useState("");

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar /> {/* Via le props! */}

      {/* pb-24 per proteggere i contenuti dalla Bottom Nav mobile */}
      <div className="max-w-5xl mx-auto px-4 pt-6 pb-24 md:py-10">
        
        {/* --- INTESTAZIONE --- */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm text-center mb-8 border-t-4 border-blue-600">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2 tracking-tight">
            📚 La Mia Biblioteca
          </h1>
          <p className="text-sm sm:text-base text-gray-500 font-medium">
            Esplora i tuoi diari personali e gestisci le tue letture.
          </p>
        </div>

        {/* --- GUIDA RAPIDA --- */}
        <div className="bg-white border-l-4 border-blue-600 rounded-r-2xl shadow-sm p-5 sm:p-8 mb-10">
          <h2 className="text-lg sm:text-xl font-black text-gray-800 mb-5 flex items-center gap-2">
            📖 Guida alla Libreria <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full uppercase tracking-widest ml-1">Beta</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Sezione Filtri */}
            <div className="space-y-3">
              <h3 className="text-sm font-black text-blue-600 border-b border-blue-100 pb-2 uppercase tracking-widest">
                🔍 Filtra i tuoi Diari
              </h3>
              <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
                Puoi consultare la tua cronologia completa o isolare specifiche
                categorie per tipo di opera:
              </p>
              <ul className="grid grid-cols-1 gap-2.5 text-xs sm:text-sm text-gray-700 font-medium mt-2">
                <li className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
                  📗 <span className="font-bold text-blue-700">Libri:</span> Narrativa e saggistica.
                </li>
                <li className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
                  🎨 <span className="font-bold text-blue-700">Manga & Fumetti:</span> Graphic novel.
                </li>
                <li className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
                  📰 <span className="font-bold text-blue-700">Riviste:</span> Periodici e riviste.
                </li>
              </ul>
            </div>

            {/* Sezione Aggiunta Lettura */}
            <div className="bg-blue-50/50 p-4 sm:p-5 rounded-xl border border-blue-100">
              <h3 className="text-sm font-black text-blue-900 mb-2 uppercase tracking-widest">
                ✨ Aggiungere una Lettura
              </h3>
              <p className="text-gray-600 text-xs mb-4 leading-relaxed">
                Puoi farlo da qui cliccando su <strong className="text-blue-700">Aggiungi</strong>,
                oppure dalla Lista Opere tramite il tasto <strong className="text-blue-700">+ Diario</strong>.
              </p>
              <div className="grid grid-cols-2 gap-3 text-[10px] sm:text-[11px]">
                <div className="bg-white p-2.5 rounded-lg border border-blue-50 shadow-sm">
                  <p className="font-black text-blue-800 uppercase mb-1.5 tracking-wider">
                    Obbligatori:
                  </p>
                  <ul className="list-disc list-inside text-blue-900/80 space-y-0.5 font-medium">
                    <li>Nome Opera</li>
                    <li>Stato Lettura</li>
                  </ul>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-gray-100 shadow-sm">
                  <p className="font-black text-gray-500 uppercase mb-1.5 tracking-wider">
                    Opzionali:
                  </p>
                  <ul className="list-disc list-inside text-gray-500 space-y-0.5">
                    <li>Vol/Cap/Pag</li>
                    <li>Data e Voto</li>
                    <li>Note personali</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- SEZIONE: I MIEI DIARI --- */}
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
            <h2 className="text-lg font-black text-gray-800 flex items-center gap-2 tracking-widest">
              <span className="bg-blue-600 w-1.5 h-5 rounded-full"></span>I MIEI DIARI
            </h2>
            {/* Ecco il nostro nuovo Componente Button! */}
            <Button variant="success" to="/createlettura" className="w-full sm:w-auto">
              + Aggiungi Lettura
            </Button>
          </div>

          {/* Griglia a 2 colonne su mobile, 4 su desktop */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            
            <Link
              to="/listletture"
              className="p-4 sm:p-5 bg-linear-to-br from-blue-600 to-blue-700 rounded-xl shadow-md hover:shadow-lg transition-all text-white active:scale-[0.97]"
            >
              <h3 className="text-sm sm:text-base font-black mb-1 line-clamp-1">📖 Tutte le Letture</h3>
              <p className="text-blue-100 text-[10px] sm:text-xs leading-snug opacity-90">
                Cronologia completa
              </p>
            </Link>

            <Link
              to="/listletture/libri"
              className="p-4 sm:p-5 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 group active:scale-[0.97]"
            >
              <h3 className="text-sm sm:text-base font-black text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                📗 Libri
              </h3>
              <p className="text-gray-400 text-[10px] sm:text-xs font-medium mt-1">
                Narrativa e saggistica
              </p>
            </Link>

            <Link
              to="/listletture/manga"
              className="p-4 sm:p-5 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 group active:scale-[0.97]"
            >
              <h3 className="text-sm sm:text-base font-black text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                🎨 Manga
              </h3>
              <p className="text-gray-400 text-[10px] sm:text-xs font-medium mt-1">
                Graphic novel e tavole
              </p>
            </Link>

            <Link
              to="/listletture/riviste"
              className="p-4 sm:p-5 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 group active:scale-[0.97]"
            >
              <h3 className="text-sm sm:text-base font-black text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                📰 Riviste
              </h3>
              <p className="text-gray-400 text-[10px] sm:text-xs font-medium mt-1">
                Periodici
              </p>
            </Link>
            
          </div>
        </div>

        {/* --- SEZIONE: ALTRO (Sviluppo) --- */}
        <div>
          <h2 className="text-lg font-black text-gray-800 mb-4 flex items-center gap-2 tracking-widest">
            <span className="bg-blue-400 w-1.5 h-5 rounded-full"></span>ALTRO
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {["Statistiche", "Serie Preferite", "Autori Preferiti"].map((item, idx) => (
              <div
                key={idx}
                className="p-4 bg-white/50 rounded-xl border border-gray-200 opacity-60 relative overflow-hidden"
              >
                <span className="absolute top-2 right-2 bg-gray-200 text-gray-500 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                  Soon
                </span>
                <h2 className="text-xs sm:text-sm font-black text-gray-400 mb-0.5 pr-6 line-clamp-1 uppercase">
                  {item}
                </h2>
                <p className="text-gray-400 italic text-[9px] sm:text-[10px] font-medium">
                  In sviluppo
                </p>
              </div>
            ))}
          </div>
        </div>
        
      </div>
    </div>
  );
}

export default Biblioteca;