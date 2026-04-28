import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";

const GUIDE_SEEN_KEY = "biblioteca-guide-seen";

// ─── Modale Guida ────────────────────────────────────────────────────────────
function GuideModal({ open, onClose }) {
  // Chiudi con ESC + blocca scroll body quando la modale è aperta
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
      aria-labelledby="guide-title"
      className="fixed inset-0 z-60 flex items-end sm:items-center justify-center"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in"
        onClick={onClose}
      />

      {/* Pannello: bottom-sheet su mobile, dialog centrato su desktop */}
      <div className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Drag handle (mobile) */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header sticky */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-100 px-5 py-4 flex items-center justify-between z-10">
          <h2 id="guide-title" className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
            📖 Guida alla Libreria
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

        {/* Contenuto */}
        <div className="p-5 space-y-6">
          {/* Filtri */}
          <section>
            <h3 className="text-sm font-black text-blue-600 border-b border-blue-100 pb-2 uppercase tracking-widest mb-3">
              🔍 Filtra i tuoi Diari
            </h3>
            <p className="text-gray-500 text-xs sm:text-sm leading-relaxed mb-3">
              Puoi consultare la tua cronologia completa o isolare specifiche categorie per tipo di opera:
            </p>
            <ul className="grid grid-cols-1 gap-2 text-xs sm:text-sm text-gray-700 font-medium">
              <li className="flex items-center gap-2 bg-gray-50 p-2.5 rounded-lg">
                📗 <span className="font-bold text-blue-700">Libri:</span> Narrativa e saggistica.
              </li>
              <li className="flex items-center gap-2 bg-gray-50 p-2.5 rounded-lg">
                🎨 <span className="font-bold text-blue-700">Manga & Fumetti:</span> Graphic novel.
              </li>
              <li className="flex items-center gap-2 bg-gray-50 p-2.5 rounded-lg">
                📰 <span className="font-bold text-blue-700">Riviste:</span> Periodici e riviste.
              </li>
            </ul>
          </section>

          {/* Aggiungi lettura */}
          <section className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
            <h3 className="text-sm font-black text-blue-900 mb-2 uppercase tracking-widest">
              ✨ Aggiungere una Lettura
            </h3>
            <p className="text-gray-600 text-xs mb-4 leading-relaxed">
              Puoi farlo da qui cliccando su <strong className="text-blue-700">Aggiungi Lettura</strong>,
              oppure dalla Lista Opere tramite il tasto <strong className="text-blue-700">+ Diario</strong>.
            </p>
            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <div className="bg-white p-3 rounded-lg border border-blue-50 shadow-sm">
                <p className="font-black text-blue-800 uppercase mb-1.5 tracking-wider">Obbligatori:</p>
                <ul className="list-disc list-inside text-blue-900/80 space-y-0.5 font-medium">
                  <li>Nome Opera</li>
                  <li>Stato Lettura</li>
                </ul>
              </div>
              <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                <p className="font-black text-gray-500 uppercase mb-1.5 tracking-wider">Opzionali:</p>
                <ul className="list-disc list-inside text-gray-500 space-y-0.5">
                  <li>Vol/Cap/Pag</li>
                  <li>Data e Voto</li>
                  <li>Note personali</li>
                </ul>
              </div>
            </div>
          </section>
        </div>

        {/* Footer sticky */}
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

// ─── Biblioteca ──────────────────────────────────────────────────────────────
function Biblioteca() {
  const { user } = useAuth();
  const [guideOpen, setGuideOpen] = useState(false);

  // Apertura automatica al primo accesso
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
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 pt-6 pb-24 md:py-10">

        {/* --- INTESTAZIONE --- */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm mb-8 border-t-4 border-blue-600 relative">
          <button
            onClick={() => setGuideOpen(true)}
            aria-label="Apri guida"
            title="Apri guida"
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-100 flex items-center justify-center text-lg font-black active:scale-90 transition-all shadow-sm"
          >
            ?
          </button>
          <div className="text-center pr-12 sm:pr-0">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2 tracking-tight">
              📚 La Mia Biblioteca
            </h1>
            <p className="text-sm sm:text-base text-gray-500 font-medium">
              Esplora i tuoi diari personali e gestisci le tue letture.
            </p>
          </div>
        </div>

        {/* --- SEZIONE: I MIEI DIARI --- */}
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
            <h2 className="text-lg font-black text-gray-800 flex items-center gap-2 tracking-widest">
              <span className="bg-blue-600 w-1.5 h-5 rounded-full"></span>I MIEI DIARI
            </h2>
            <Button variant="success" to="/createlettura" className="w-full sm:w-auto">
              + Aggiungi Lettura
            </Button>
          </div>

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

        {/* --- SEZIONE: ALTRO --- */}
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

      <GuideModal open={guideOpen} onClose={closeGuide} />
    </div>
  );
}

export default Biblioteca;
