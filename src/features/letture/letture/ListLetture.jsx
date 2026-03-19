import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import Button from "../../../components/ui/Button"; // <-- Usiamo il nostro Button
import Pagination from "../../../components/Pagination"; // <-- Usiamo la paginazione standard
import { secureFetch } from "../../../utils/secureFetch";
import { useAuth } from "../../../context/AuthContext"; // <-- Usiamo il context globale

function ListLetture() {
  const { user } = useAuth(); // Utente dal context
  const [letture, setLetture] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Stati per filtri
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStato, setFilterStato] = useState("Tutti");
  
  const navigate = useNavigate();
  const { categoria } = useParams();

  // Scroll in alto al cambio pagina
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  // Caricamento Dati
  useEffect(() => {
    const loadAllData = async () => {
      const currentUserId = user?.id || user?.id_utente;
      if (!currentUserId) return; // Se l'utente non è ancora caricato, aspetta

      setLoading(true);
      setError("");
      
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL;
        let endpoint = `${baseUrl}/letture/utente/${currentUserId}`;
        
        if (categoria === "libri") endpoint = `${baseUrl}/letture/utente/libri/${currentUserId}`;
        else if (categoria === "manga") endpoint = `${baseUrl}/letture/utente/manga/${currentUserId}`;
        else if (categoria === "riviste") endpoint = `${baseUrl}/letture/utente/riviste/${currentUserId}`;

        const resLetture = await secureFetch(endpoint, { method: "GET" }, navigate);
        
        if (resLetture?.ok) {
          const data = await resLetture.json();
          setLetture(data);
          setCurrentPage(1); // Resetta la pagina quando cambi categoria
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

  // Ottimizzazione dei filtri con useMemo
  const filteredLetture = useMemo(() => {
    return letture.filter((l) => {
      const matchesSearch = l.opere?.titolo?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStato = filterStato === "Tutti" || l.stato === filterStato;
      return matchesSearch && matchesStato;
    });
  }, [letture, searchTerm, filterStato]);

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentLetture = filteredLetture.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredLetture.length / itemsPerPage);

  const getStatusStyles = (stato) => {
    switch (stato) {
      case 'da_iniziare': return { dot: 'bg-blue-500', text: 'text-blue-600', bg: 'bg-blue-50' };
      case 'in_corso': return { dot: 'bg-green-500', text: 'text-green-600', bg: 'bg-green-50' };
      case 'finito': return { dot: 'bg-gray-400', text: 'text-gray-500', bg: 'bg-gray-100' };
      case 'abbandonato': return { dot: 'bg-red-400', text: 'text-red-500', bg: 'bg-red-50' };
      default: return { dot: 'bg-gray-200', text: 'text-gray-400', bg: 'bg-gray-50' };
    }
  };

  const renderStars = (rating, size = "text-sm sm:text-lg") => {
    if (!rating) return <span className="text-gray-300 text-[9px] sm:text-[10px] italic font-bold uppercase tracking-wider">Nessun voto</span>;
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
      case "libri": return "Diario Libri";
      case "manga": return "Diario Manga";
      case "riviste": return "Diario Riviste";
      default: return "Diario Completo";
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar /> {/* Via le props! */}
      
      {/* Container con padding vitale per la Bottom Nav */}
      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 pt-6 pb-24 md:py-10">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div className="text-center md:text-left w-full">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
              {getTitle()}
            </h1>
            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-0.5">
              {filteredLetture.length} risultati trovati
            </p>
          </div>
          <Button variant="success" to="/createlettura" className="w-full md:w-auto">
            + Aggiungi Nuova
          </Button>
        </div>

        {/* --- BARRA FILTRI --- */}
        <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm mb-8 flex flex-col md:flex-row gap-2.5 relative z-10">
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
              className="w-full px-3 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 font-bold text-gray-600 cursor-pointer appearance-none outline-none transition-all"
              value={filterStato}
              onChange={(e) => { setFilterStato(e.target.value); setCurrentPage(1); }}
            >
              <option value="Tutti">Tutti gli stati</option>
              <option value="da_iniziare">Da iniziare</option>
              <option value="in_corso">In corso</option>
              <option value="finito">Finito</option>
              <option value="abbandonato">Abbandonato</option>
            </select>
            <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        {/* --- CONTENT --- */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-white rounded-xl border border-gray-100 animate-pulse" />
            ))}
          </div>
        ) : filteredLetture.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Nessuna lettura trovata</p>
            <button
              onClick={() => { setSearchTerm(""); setFilterStato("Tutti"); setCurrentPage(1); }}
              className="mt-3 text-blue-600 font-bold text-sm hover:underline"
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
                      <tr key={l.id_lettura} onClick={() => navigate(`/lettura/${l.id_lettura}`)} className="group hover:bg-blue-50/40 transition-colors cursor-pointer active:bg-blue-100/50">
                        <td className="px-5 py-4">
                          <p className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-1">{l.opere?.titolo}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{l.opere?.editore || "N/A"}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${styles.bg} ${styles.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
                            {l.stato.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-bold text-xs text-gray-500">
                           <div className="flex gap-1.5">
                             {l.volume && <span className="bg-gray-50 px-1.5 py-0.5 rounded">Vol.{l.volume}</span>}
                             {l.capitolo && <span className="bg-gray-50 px-1.5 py-0.5 rounded">Cap.{l.capitolo}</span>}
                             {l.pagina && <span className="bg-gray-50 px-1.5 py-0.5 rounded">Pag.{l.pagina}</span>}
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
                  <div key={l.id_lettura} onClick={() => navigate(`/lettura/${l.id_lettura}`)} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm active:scale-[0.98] transition-all">
                    <div className="flex justify-between items-start mb-3 gap-3">
                      <div className="flex-1">
                        <h3 className="text-sm font-black text-gray-800 leading-snug line-clamp-2">{l.opere?.titolo}</h3>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">{l.opere?.editore || "N/A"}</p>
                      </div>
                      <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider ${styles.bg} ${styles.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
                        {l.stato.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                      <div className="flex flex-wrap gap-1.5 text-[10px] font-bold text-gray-500 uppercase">
                        {l.volume && <span className="bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">Vol. {l.volume}</span>}
                        {l.capitolo && <span className="bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">Cap. {l.capitolo}</span>}
                        {l.pagina && <span className="bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">Pag. {l.pagina}</span>}
                      </div>
                      <div className="shrink-0">{renderStars(l.valutazione)}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* --- PAGINAZIONE --- (Ora usiamo quella standard!) */}
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