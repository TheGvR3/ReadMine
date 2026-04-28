import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import Button from "../../../components/ui/Button";
import Pagination from "../../../components/Pagination";
import { secureFetch } from "../../../utils/secureFetch";
import { useAuth } from "../../../context/AuthContext";

const STATI = [
  { key: "Tutti",        label: "Tutti"     },
  { key: "in_corso",     label: "In corso"  },
  { key: "da_iniziare",  label: "In coda"   },
  { key: "finito",       label: "Finite"    },
  { key: "abbandonato",  label: "Lasciate"  },
];

const SORT_OPTIONS = [
  { key: "recent",   label: "Più recente" },
  { key: "rating",   label: "Voto ↓"      },
  { key: "az",       label: "A → Z"       },
  { key: "za",       label: "Z → A"       },
];

function ListLetture() {
  const { user } = useAuth();
  const [letture, setLetture] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStato, setFilterStato] = useState("Tutti");
  const [sortBy, setSortBy] = useState("recent");

  const navigate = useNavigate();
  const { categoria } = useParams();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  useEffect(() => {
    const loadAllData = async () => {
      const currentUserId = user?.id || user?.id_utente;
      if (!currentUserId) return;

      setLoading(true);
      setError("");

      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL;
        let endpoint = `${baseUrl}/letture/utente/${currentUserId}`;

        if (categoria === "libri")        endpoint = `${baseUrl}/letture/utente/libri/${currentUserId}`;
        else if (categoria === "manga")   endpoint = `${baseUrl}/letture/utente/manga/${currentUserId}`;
        else if (categoria === "riviste") endpoint = `${baseUrl}/letture/utente/riviste/${currentUserId}`;

        const resLetture = await secureFetch(endpoint, { method: "GET" }, navigate);

        if (resLetture?.ok) {
          const data = await resLetture.json();
          setLetture(data);
          setCurrentPage(1);
        } else {
          throw new Error("Errore nel caricamento del diario");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, [navigate, categoria, user]);

  // Conteggi per ogni stato (sempre sull'intera lista, non sui filtri)
  const stateCounts = useMemo(() => {
    const counts = { Tutti: letture.length };
    for (const s of STATI) {
      if (s.key !== "Tutti") counts[s.key] = letture.filter((l) => l.stato === s.key).length;
    }
    return counts;
  }, [letture]);

  // Filtri + sort
  const filteredLetture = useMemo(() => {
    const filtered = letture.filter((l) => {
      const matchesSearch = l.opere?.titolo?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStato  = filterStato === "Tutti" || l.stato === filterStato;
      return matchesSearch && matchesStato;
    });

    const sorted = [...filtered];
    switch (sortBy) {
      case "rating":
        sorted.sort((a, b) => (Number(b.valutazione) || 0) - (Number(a.valutazione) || 0));
        break;
      case "az":
        sorted.sort((a, b) => (a.opere?.titolo ?? "").localeCompare(b.opere?.titolo ?? "", "it"));
        break;
      case "za":
        sorted.sort((a, b) => (b.opere?.titolo ?? "").localeCompare(a.opere?.titolo ?? "", "it"));
        break;
      case "recent":
      default:
        sorted.sort((a, b) => (b.id_lettura ?? 0) - (a.id_lettura ?? 0));
    }
    return sorted;
  }, [letture, searchTerm, filterStato, sortBy]);

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentLetture = filteredLetture.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredLetture.length / itemsPerPage);

  const getStatusStyles = (stato) => {
    switch (stato) {
      case "da_iniziare": return { dot: "bg-blue-500",    text: "text-blue-600",    bg: "bg-blue-50"    };
      case "in_corso":    return { dot: "bg-emerald-500", text: "text-emerald-600", bg: "bg-emerald-50" };
      case "finito":      return { dot: "bg-gray-400",    text: "text-gray-500",    bg: "bg-gray-100"   };
      case "abbandonato": return { dot: "bg-red-400",     text: "text-red-500",     bg: "bg-red-50"     };
      default:            return { dot: "bg-gray-200",    text: "text-gray-400",    bg: "bg-gray-50"    };
    }
  };

  const renderStars = (rating, size = "text-sm sm:text-lg") => {
    if (!rating)
      return (
        <span className="text-gray-300 text-[9px] sm:text-[10px] italic font-bold uppercase tracking-wider">
          Nessun voto
        </span>
      );
    return (
      <div className={`flex gap-0.5 ${size} text-yellow-400`}>
        {[...Array(5)].map((_, i) => (
          <span key={i}>{i < rating ? "★" : "☆"}</span>
        ))}
      </div>
    );
  };

  const getTitle = () => {
    switch (categoria) {
      case "libri":   return "Diario Libri";
      case "manga":   return "Diario Manga";
      case "riviste": return "Diario Riviste";
      default:        return "Diario Completo";
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setFilterStato("Tutti");
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm !== "" || filterStato !== "Tutti";
  const isEmpty = !loading && letture.length === 0;
  const isFilteredEmpty = !loading && letture.length > 0 && filteredLetture.length === 0;

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />

      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 pt-6 pb-24 md:py-10">

        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div className="text-center md:text-left w-full">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
              {getTitle()}
            </h1>
            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-0.5">
              {filteredLetture.length} {filteredLetture.length === 1 ? "risultato" : "risultati"}
            </p>
          </div>
          <Button variant="success" to="/createlettura" className="w-full md:w-auto">
            + Aggiungi Nuova
          </Button>
        </div>

        {/* --- BARRA RICERCA + SORT --- */}
        {!isEmpty && (
          <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm mb-4 flex flex-col md:flex-row gap-2.5 relative z-10">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Cerca un'opera nel diario..."
                className="w-full pl-10 pr-9 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
              <svg className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchTerm && (
                <button
                  onClick={() => { setSearchTerm(""); setCurrentPage(1); }}
                  aria-label="Pulisci ricerca"
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 focus:outline-none bg-gray-200/50 rounded-full p-0.5"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            <div className="md:w-48 relative">
              <select
                aria-label="Ordina per"
                className="w-full pl-9 pr-9 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 font-bold text-gray-600 cursor-pointer appearance-none outline-none transition-all"
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.key} value={o.key}>{o.label}</option>
                ))}
              </select>
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base pointer-events-none">⇅</span>
              <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* --- SEGMENTED CONTROL STATO --- */}
        {!isEmpty && (
          <div
            role="tablist"
            aria-label="Filtra per stato"
            className="bg-white border border-gray-100 rounded-2xl shadow-sm mb-6 flex overflow-hidden divide-x divide-gray-100"
          >
            {STATI.map((s) => {
              const active = filterStato === s.key;
              const count = stateCounts[s.key] ?? 0;
              return (
                <button
                  key={s.key}
                  role="tab"
                  aria-selected={active}
                  onClick={() => { setFilterStato(s.key); setCurrentPage(1); }}
                  className={`flex-1 min-w-0 px-1 py-2.5 sm:py-3 transition-colors active:scale-[0.97] ${
                    active
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider truncate w-full text-center px-1">
                      {s.label}
                    </span>
                    <span className={`text-[10px] sm:text-[11px] font-black ${
                      active ? "text-white/80" : "text-gray-400"
                    }`}>
                      {count}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* --- ERROR --- */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-5 text-center shadow-sm mb-6">
            <p className="text-red-600 text-xs font-black uppercase tracking-widest">⚠️ {error}</p>
          </div>
        )}

        {/* --- CONTENT --- */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-white rounded-xl border border-gray-100 animate-pulse" />
            ))}
          </div>
        ) : isEmpty ? (
          <div className="text-center py-12 sm:py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-6xl mb-4" aria-hidden="true">📚</div>
            <h3 className="text-lg font-black text-gray-900 mb-2">Il tuo diario è vuoto</h3>
            <p className="text-gray-500 text-sm mb-6 px-4">
              Inizia ad aggiungere le tue letture per tenerne traccia, segnare i progressi e dare un voto.
            </p>
            <Link
              to="/createlettura"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white text-sm font-black rounded-xl shadow-md active:scale-95 transition-all uppercase tracking-widest"
            >
              <span className="text-base">＋</span> Aggiungi la prima lettura
            </Link>
          </div>
        ) : isFilteredEmpty ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
            <div className="text-4xl mb-3" aria-hidden="true">🔍</div>
            <p className="text-gray-700 font-black uppercase tracking-widest text-xs mb-1">
              Nessun risultato
            </p>
            <p className="text-gray-400 text-xs mb-4 px-4">
              Nessuna lettura corrisponde ai filtri attivi.
            </p>
            <button
              onClick={resetFilters}
              className="text-blue-600 font-bold text-sm hover:underline"
            >
              Resetta i filtri
            </button>
          </div>
        ) : (
          <>
            {/* VISTA DESKTOP */}
            <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100">
                    <th className="px-5 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Opera</th>
                    <th className="px-5 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Stato</th>
                    <th className="px-5 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Progresso</th>
                    <th className="px-5 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Voto</th>
                    <th className="px-5 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {currentLetture.map((l) => {
                    const styles = getStatusStyles(l.stato);
                    return (
                      <tr
                        key={l.id_lettura}
                        onClick={() => navigate(`/lettura/${l.id_lettura}`)}
                        className="group hover:bg-blue-50/40 transition-colors cursor-pointer active:bg-blue-100/50"
                      >
                        <td className="px-5 py-4">
                          <p className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-1">{l.opere?.titolo}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{l.opere?.editore || "N/A"}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${styles.bg} ${styles.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
                            {l.stato.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-bold text-xs text-gray-500">
                          <div className="flex gap-1.5">
                            {l.volume   && <span className="bg-gray-50 px-1.5 py-0.5 rounded">Vol.{l.volume}</span>}
                            {l.capitolo && <span className="bg-gray-50 px-1.5 py-0.5 rounded">Cap.{l.capitolo}</span>}
                            {l.pagina   && <span className="bg-gray-50 px-1.5 py-0.5 rounded">Pag.{l.pagina}</span>}
                            {(!l.volume && !l.capitolo && !l.pagina) && <span className="text-gray-300">--</span>}
                          </div>
                        </td>
                        <td className="px-5 py-4">{renderStars(l.valutazione)}</td>
                        <td className="px-5 py-4 text-right">
                          <span className="text-[10px] font-black text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-md">
                            Vedi →
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* VISTA MOBILE */}
            <div className="md:hidden space-y-3">
              {currentLetture.map((l) => {
                const styles = getStatusStyles(l.stato);
                return (
                  <div
                    key={l.id_lettura}
                    onClick={() => navigate(`/lettura/${l.id_lettura}`)}
                    className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm active:scale-[0.98] transition-all"
                  >
                    <div className="flex justify-between items-start mb-3 gap-3">
                      <div className="flex-1">
                        <h3 className="text-sm font-black text-gray-800 leading-snug line-clamp-2">{l.opere?.titolo}</h3>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">{l.opere?.editore || "N/A"}</p>
                      </div>
                      <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider ${styles.bg} ${styles.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
                        {l.stato.replace("_", " ")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                      <div className="flex flex-wrap gap-1.5 text-[10px] font-bold text-gray-500 uppercase">
                        {l.volume   && <span className="bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">Vol. {l.volume}</span>}
                        {l.capitolo && <span className="bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">Cap. {l.capitolo}</span>}
                        {l.pagina   && <span className="bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">Pag. {l.pagina}</span>}
                      </div>
                      <div className="shrink-0">{renderStars(l.valutazione)}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => setCurrentPage(page)}
                />
              </div>
            )}
          </>
        )}
      </div>

    </div>
  );
}

export default ListLetture;
