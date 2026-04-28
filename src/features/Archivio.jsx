import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const GUIDE_SEEN_KEY = "archivio-guide-seen";

// ─── Modale Guida Editor ─────────────────────────────────────────────────────
function GuideModal({ open, onClose }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="archivio-guide-title"
      className="fixed inset-0 z-60 flex items-end sm:items-center justify-center"
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-100 px-5 py-4 flex items-center justify-between z-10">
          <h2 id="archivio-guide-title" className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
            🛠️ Guida per Editor
            <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full uppercase tracking-widest">Beta</span>
          </h2>
          <button
            onClick={onClose}
            aria-label="Chiudi guida"
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center text-lg font-black active:scale-90 transition-all"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Autori, Serie, Generi */}
          <section>
            <h3 className="text-sm font-black text-blue-600 border-b border-blue-100 pb-2 uppercase tracking-widest mb-3">
              ✍️ Autori, Serie e Generi
            </h3>
            <p className="text-gray-500 text-xs sm:text-sm leading-relaxed mb-3">
              Per gestire queste categorie, entra nella sezione specifica e clicca su <strong>"Nuovo"</strong>.
            </p>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li className="bg-gray-50 p-2.5 rounded-lg">
                <span className="text-emerald-600 font-black uppercase tracking-wider">Creare:</span>{" "}
                <span className="text-gray-700">Prima di inserire, controlla sempre che il nome non sia già presente nel database.</span>
              </li>
              <li className="bg-gray-50 p-2.5 rounded-lg">
                <span className="text-blue-600 font-black uppercase tracking-wider">Modificare/Eliminare:</span>{" "}
                <span className="text-gray-700">Se trovi un errore o un duplicato, entra nel dettaglio dell'elemento per correggere o rimuovere.</span>
              </li>
            </ul>
          </section>

          {/* Opere */}
          <section className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
            <h3 className="text-sm font-black text-blue-900 mb-2 uppercase tracking-widest">
              📖 Gestione Opere
            </h3>
            <p className="text-gray-600 text-xs mb-4 leading-relaxed">
              La creazione di un'opera richiede una struttura precisa. Una volta cliccato su{" "}
              <strong className="text-emerald-700">Nuova Opera</strong>:
            </p>
            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <div className="bg-white p-3 rounded-lg border border-blue-50 shadow-sm">
                <p className="font-black text-blue-800 uppercase mb-1.5 tracking-wider">Obbligatori:</p>
                <ul className="list-disc list-inside text-blue-900/80 space-y-0.5 font-medium">
                  <li>Titolo e Tipo</li>
                  <li>Anno pubblicazione</li>
                  <li>Stato opera</li>
                  <li>Almeno un autore</li>
                  <li>Almeno un genere</li>
                </ul>
              </div>
              <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                <p className="font-black text-gray-500 uppercase mb-1.5 tracking-wider">Opzionali:</p>
                <ul className="list-disc list-inside text-gray-500 space-y-0.5">
                  <li>Serie</li>
                  <li>Editore</li>
                  <li>Lingua originale</li>
                </ul>
              </div>
            </div>
            <p className="mt-4 text-[11px] text-gray-400 italic">
              * Errori? Puoi sempre{" "}
              <span className="text-blue-600 font-bold">modificare</span> o{" "}
              <span className="text-red-600 font-bold">eliminare</span> dal dettaglio opera.
            </p>
          </section>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded-xl shadow-md active:scale-[0.98] transition-all uppercase tracking-widest text-sm"
          >
            Ho capito
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Archivio ────────────────────────────────────────────────────────────────
function Archivio() {
  const [guideOpen, setGuideOpen] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(GUIDE_SEEN_KEY)) {
      setGuideOpen(true);
    }
  }, []);

  const closeGuide = () => {
    localStorage.setItem(GUIDE_SEEN_KEY, "1");
    setGuideOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 md:py-12">

        {/* INTESTAZIONE */}
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-md mb-10 border-t-4 border-blue-600 relative">
          <button
            onClick={() => setGuideOpen(true)}
            aria-label="Apri guida editor"
            title="Apri guida editor"
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-100 flex items-center justify-center text-lg font-black active:scale-90 transition-all shadow-sm"
          >
            ?
          </button>
          <div className="text-center pr-12 sm:pr-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-2 tracking-tight">
              🏛️ Archivio Generale
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-gray-600">
              Esplora il database completo o contribuisci alla gestione dei contenuti.
            </p>
          </div>
        </div>

        {/* GRID NAVIGAZIONE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            to="/ListOpere"
            className="p-6 bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-200 group active:scale-95"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">📚</span>
              <span className="text-blue-600 group-hover:translate-x-1 transition-transform">➔</span>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Opere</h2>
            <p className="text-gray-500 text-sm">Il catalogo completo di libri, manga e riviste.</p>
          </Link>

          <Link
            to="/ListSerie"
            className="p-6 bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-200 group active:scale-95"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">🗂️</span>
              <span className="text-blue-600 group-hover:translate-x-1 transition-transform">➔</span>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Serie</h2>
            <p className="text-gray-500 text-sm">Raccolte, saghe e testate periodiche.</p>
          </Link>

          <Link
            to="/ListAutori"
            className="p-6 bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-200 group active:scale-95"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">✍️</span>
              <span className="text-blue-600 group-hover:translate-x-1 transition-transform">➔</span>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Autori</h2>
            <p className="text-gray-500 text-sm">Scrittori, mangaka e illustratori.</p>
          </Link>

          <Link
            to="/ListGeneri"
            className="p-6 bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-200 group active:scale-95"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">🎭</span>
              <span className="text-blue-600 group-hover:translate-x-1 transition-transform">➔</span>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Generi</h2>
            <p className="text-gray-500 text-sm">Classificazione tematica delle opere.</p>
          </Link>

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
              <p className="text-gray-400 italic text-sm">Funzionalità in arrivo.</p>
            </div>
          ))}
        </div>
      </div>

      <GuideModal open={guideOpen} onClose={closeGuide} />
    </div>
  );
}

export default Archivio;
