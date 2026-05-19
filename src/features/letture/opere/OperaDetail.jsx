import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import Navbar from "../../../components/Navbar";
import Button from "../../../components/ui/Button";
import { secureFetch } from "../../../utils/secureFetch";
import { useAuth } from "../../../context/AuthContext";

// Carosello swipeable di copertine (scroll-snap, niente librerie esterne)
function CoverCarousel({ edizioni, fallback, title }) {
  const slides = useMemo(() => {
    const withCover = (edizioni || []).filter((e) => e.copertina_url);
    if (withCover.length > 0) return withCover;
    if (fallback) return [{ id_edizione: "__fallback__", copertina_url: fallback }];
    return [];
  }, [edizioni, fallback]);

  const [activeIdx, setActiveIdx] = useState(0);
  const scrollRef = useRef(null);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    if (idx !== activeIdx) setActiveIdx(idx);
  };

  const goTo = (i) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };

  const sizeClasses = "w-56 h-80 md:w-64 md:h-96";

  if (slides.length === 0) {
    return (
      <div className={`${sizeClasses} shrink-0 rounded-lg bg-linear-to-br from-gray-100 to-gray-200 border border-gray-200 flex items-center justify-center text-gray-300`}>
        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 2v8l-3-2-3 2V4h6z" />
        </svg>
      </div>
    );
  }

  const multi = slides.length > 1;

  return (
    <div className="relative shrink-0">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className={`${sizeClasses} overflow-x-auto snap-x snap-mandatory scroll-smooth rounded-lg shadow-md border border-gray-200 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}
      >
        <div className="flex h-full">
          {slides.map((s, i) => (
            <img
              key={s.id_edizione}
              src={s.copertina_url}
              alt={`${title || "Copertina"} — edizione ${i + 1}`}
              loading={i === 0 ? "eager" : "lazy"}
              className={`${sizeClasses} shrink-0 object-cover snap-center bg-gray-50`}
            />
          ))}
        </div>
      </div>
      {multi && (
        <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-black px-2 py-1 rounded-full backdrop-blur-sm tabular-nums shadow-sm">
          {activeIdx + 1} / {slides.length}
        </span>
      )}
    </div>
  );
}

// Sinossi compatta con "Leggi tutto" se troppo lunga
function Sinossi({ text }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text && text.length > 220;

  return (
    <div className="w-full text-left">
      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">
        Sinossi
      </p>
      <p className={`text-gray-700 leading-relaxed text-[13px] italic font-serif ${
        isLong && !expanded ? "line-clamp-3" : ""
      }`}>
        "{text}"
      </p>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((x) => !x)}
          className="mt-1 text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest"
        >
          {expanded ? "Mostra meno" : "Leggi tutto"}
        </button>
      )}
    </div>
  );
}

// Chip meta inline (label piccola + valore)
function MetaChip({ label, value, valueClass = "text-gray-800" }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 rounded-md text-[10px] font-black uppercase tracking-wider">
      <span className="text-gray-400">{label}:</span>
      <span className={valueClass}>{value}</span>
    </span>
  );
}

// Lista edizioni con limit iniziale + bottone "mostra altre"
function EdizioniList({ edizioni, operaTitolo, canImport }) {
  const INITIAL = 6;
  const [showAll, setShowAll] = useState(false);
  const total = edizioni?.length || 0;
  const visibili = showAll ? edizioni : (edizioni || []).slice(0, INITIAL);
  const restanti = total - INITIAL;

  return (
    <div className="p-5 sm:p-6 bg-white">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
          Edizioni ({total})
        </p>
        {canImport && (
          <Link
            to="/import-google"
            className="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest"
          >
            + Importa edizione
          </Link>
        )}
      </div>
      {total > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {visibili.map((e) => (
              <EditionCard
                key={e.id_edizione}
                edizione={e}
                operaTitolo={operaTitolo}
              />
            ))}
          </div>
          {restanti > 0 && !showAll && (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="mt-3 w-full py-2.5 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 text-blue-600 hover:text-blue-700 rounded-xl text-[11px] font-black uppercase tracking-widest transition-colors active:scale-[0.98]"
            >
              Mostra altre {restanti} edizioni ↓
            </button>
          )}
          {showAll && total > INITIAL && (
            <button
              type="button"
              onClick={() => setShowAll(false)}
              className="mt-3 w-full py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-500 hover:text-gray-700 rounded-xl text-[11px] font-black uppercase tracking-widest transition-colors active:scale-[0.98]"
            >
              Mostra meno ↑
            </button>
          )}
        </>
      ) : (
        <p className="text-xs text-gray-400 italic">
          Nessuna edizione registrata. Importane una da Google Books.
        </p>
      )}
    </div>
  );
}

// Card edizione compatta — link alla pagina dettaglio dell'edizione
function EditionCard({ edizione: e, operaTitolo }) {
  const displayName = e.titolo_edizione || operaTitolo || "Edizione";

  return (
    <Link
      to={`/edizione/${e.id_edizione}`}
      className="flex gap-3 p-2.5 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-300 hover:bg-blue-50/40 transition-colors active:scale-[0.98]"
    >
      {e.copertina_url ? (
        <img
          src={e.copertina_url}
          alt={`Copertina ${displayName}`}
          loading="lazy"
          className="w-11 h-16 object-cover rounded border border-gray-200 shrink-0 bg-white"
        />
      ) : (
        <div className="w-11 h-16 shrink-0 rounded border border-gray-200 bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-300">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 2v8l-3-2-3 2V4h6z" />
          </svg>
        </div>
      )}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-black text-gray-800 line-clamp-2 leading-snug">
            {displayName}
          </p>
          {e.numero_volume != null && (
            <span className="shrink-0 text-[9px] font-black text-blue-700 bg-blue-100 border border-blue-200 px-1.5 py-0.5 rounded uppercase tracking-wider">
              Vol. {e.numero_volume}
            </span>
          )}
        </div>
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider line-clamp-1 mt-0.5">
          {e.editore || "Editore N/A"}
          {e.anno_pubblicazione && ` • ${e.anno_pubblicazione}`}
        </p>
      </div>
      <svg
        className="w-4 h-4 text-gray-300 shrink-0 self-center"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}

function OperaDetail() {
  const { id_opera } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [opera, setOpera] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id_opera]);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError("");
      try {
        // Usa /full per avere autori/generi/serie già aggregati + edizioni embedded
        const response = await secureFetch(
          `${import.meta.env.VITE_API_BASE_URL}/opere/${id_opera}/full`,
          { method: "GET" },
          navigate
        );
        if (response?.ok) setOpera(await response.json());
        else setError("Errore nel caricamento dell'opera");
      } catch (err) {
        setError("Errore tecnico durante il caricamento");
      } finally {
        setLoading(false);
      }
    };
    if (id_opera) fetchDetail();
  }, [id_opera, navigate]);

  const autoriProcessati = opera?.autori
    ? opera.autori.split(",").map((nome, index) => ({
        nome: nome.trim(),
        id: opera.autori_ids ? opera.autori_ids[index] : null,
      }))
    : [];

  const generiProcessati = opera?.generi
    ? opera.generi.split(",").map((nome, index) => ({
        nome: nome.trim(),
        id: opera.generi_ids ? opera.generi_ids[index] : null,
      }))
    : [];

  const isFinito = opera?.stato_opera?.toLowerCase() === "finito";
  const headerBg = isFinito ? "bg-gray-50" : "bg-blue-50/50";

  // Edizioni ordinate: per manga (volume numerato) → numero_volume ASC,
  // altrimenti → anno_pubblicazione DESC (le più recenti prima).
  const edizioniOrdinate = useMemo(() => {
    const ed = opera?.edizioni;
    if (!ed || ed.length === 0) return [];
    const hasVolumi = ed.some((e) => e.numero_volume != null);
    const copia = [...ed];
    if (hasVolumi) {
      copia.sort((a, b) => {
        const va = a.numero_volume;
        const vb = b.numero_volume;
        if (va == null && vb == null) return 0;
        if (va == null) return 1; // null in coda
        if (vb == null) return -1;
        if (va !== vb) return va - vb;
        // a parità di volume, la più recente prima
        return (b.anno_pubblicazione || 0) - (a.anno_pubblicazione || 0);
      });
    } else {
      copia.sort(
        (a, b) => (b.anno_pubblicazione || 0) - (a.anno_pubblicazione || 0)
      );
    }
    return copia;
  }, [opera]);

  const handleDelete = async () => {
    if (!window.confirm("Sei sicuro di voler eliminare questa opera?")) return;
    const response = await secureFetch(
      `${import.meta.env.VITE_API_BASE_URL}/opere/${id_opera}`,
      { method: "DELETE" },
      navigate
    );
    if (response?.ok) navigate("/listopere");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />

      {/* Back link in alto */}
      <div className="max-w-3xl mx-auto px-4 pt-3 sm:pt-4">
        <button
          onClick={() => navigate("/listopere")}
          className="inline-flex items-center gap-1.5 text-gray-500 hover:text-blue-600 font-black text-[10px] uppercase tracking-[0.2em] py-1 active:scale-95 transition-all"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
          </svg>
          Torna alla lista
        </button>
      </div>

      <div className="max-w-3xl mx-auto pb-24 md:pb-10">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-4 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 mx-4 p-6 rounded-2xl border border-red-100 text-center">
            <p className="text-red-600 font-black uppercase tracking-widest text-sm">{error}</p>
          </div>
        ) : (
          opera && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* HEADER */}
              <div className={`${headerBg} relative p-5 sm:p-6 flex flex-col items-center text-center gap-4`}>
                {/* Tipo in alto a destra */}
                <span className="absolute top-3 right-3 text-[9px] font-black bg-gray-900 text-white px-2 py-1 rounded uppercase tracking-[0.2em]">
                  {opera.tipo || "Opera"}
                </span>

                {/* Titolo + Autori sopra l'immagine */}
                <div className="w-full max-w-md pr-20">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 leading-tight tracking-tight wrap-break-words">
                    {opera.titolo}
                  </h1>
                  {autoriProcessati.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap items-center justify-center gap-x-1.5">
                      {autoriProcessati.map((a, i) => (
                        <Link
                          key={i}
                          to={a.id ? `/autore/${a.id}` : "#"}
                          className="text-blue-600 font-bold hover:text-blue-800 text-sm uppercase tracking-wide"
                        >
                          {a.nome}
                          {i < autoriProcessati.length - 1 && (
                            <span className="text-gray-400 ml-1.5 font-normal">•</span>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Carosello cover grande */}
                <CoverCarousel
                  edizioni={edizioniOrdinate}
                  fallback={opera.copertina_principale}
                  title={opera.titolo}
                />

                {/* Sinossi sotto l'immagine */}
                {opera.descrizione_opera && (
                  <Sinossi text={opera.descrizione_opera} />
                )}

                {/* META compatta — chips orizzontali */}
                <div className="w-full flex flex-wrap justify-center gap-1.5">
                  <MetaChip label="Edizioni" value={opera.edizioni_count || opera.edizioni?.length || 0} />
                  <MetaChip label="Anno" value={opera.prima_edizione_anno || "—"} />
                  <MetaChip
                    label="Stato"
                    value={opera.stato_opera || "N/A"}
                    valueClass={isFinito ? "text-gray-500" : "text-green-600"}
                  />
                  {opera.serie && (
                    <Link
                      to={`/serie/${opera.id_serie}`}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-200 rounded-md text-[10px] font-black text-blue-700 hover:bg-blue-100 transition-colors uppercase tracking-wider"
                    >
                      <span className="text-blue-400">Serie:</span>
                      <span className="line-clamp-1 max-w-40">{opera.serie}</span>
                    </Link>
                  )}
                </div>

                {/* Generi inline */}
                {generiProcessati.length > 0 && (
                  <div className="w-full flex flex-wrap justify-center gap-1">
                    {generiProcessati.map((g, i) => (
                      <Link
                        key={i}
                        to={g.id ? `/genere/${g.id}` : "#"}
                        className="px-2 py-0.5 bg-white border border-gray-200 rounded-md text-[9px] font-black text-blue-600 hover:border-blue-400 uppercase tracking-wide"
                      >
                        {g.nome}
                      </Link>
                    ))}
                  </div>
                )}

                {/* Azioni */}
                <div className="w-full pt-3 border-t border-gray-200/60 flex flex-col gap-2">
                  <Button
                    variant="success"
                    onClick={() =>
                      navigate("/createlettura", {
                        state: { id_opera, titolo: opera.titolo },
                      })
                    }
                    className="w-full"
                  >
                    + Aggiungi al Diario
                  </Button>
                  {user?.editor && (
                    <div className="flex gap-2">
                      <Button variant="outlineBlue" to={`/updateopera/${id_opera}`} className="flex-1">
                        Modifica
                      </Button>
                      <Button variant="danger" onClick={handleDelete} className="flex-1">
                        Elimina
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* EDIZIONI — lista compatta con paginazione "mostra altre" */}
              <EdizioniList edizioni={edizioniOrdinate} operaTitolo={opera.titolo} canImport={!!user?.editor} />
            </motion.div>
          )
        )}
      </div>
    </div>
  );
}

export default OperaDetail;
