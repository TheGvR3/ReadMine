import { useState, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import { secureFetch } from "../../../utils/secureFetch";

function ListLetture() {
  const [letture, setLetture] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [user, setUser] = useState(null);
  
  // --- NUOVI STATI PER FILTRI ---
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStato, setFilterStato] = useState("Tutti");
  
  const navigate = useNavigate();
  const { categoria } = useParams();

  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      setError("");
      try {
        const resUser = await secureFetch(
          `${import.meta.env.VITE_API_BASE_URL}/users/profile`,
          { method: "GET" },
          navigate
        );
        if (!resUser || !resUser.ok) throw new Error("Errore profilo");
        const userData = await resUser.json();
        const currentUserId = userData.id || userData.id_utente;

        let endpoint = `${import.meta.env.VITE_API_BASE_URL}/letture/utente/${currentUserId}`;
        if (categoria === "libri") endpoint = `${import.meta.env.VITE_API_BASE_URL}/letture/utente/libri/${currentUserId}`;
        else if (categoria === "manga") endpoint = `${import.meta.env.VITE_API_BASE_URL}/letture/utente/manga/${currentUserId}`;
        else if (categoria === "riviste") endpoint = `${import.meta.env.VITE_API_BASE_URL}/letture/utente/riviste/${currentUserId}`;

        const resLetture = await secureFetch(endpoint, { method: "GET" }, navigate);
        if (resLetture && resLetture.ok) {
          const data = await resLetture.json();
          setLetture(data);
          setCurrentPage(1);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadAllData();
  }, [navigate, categoria]);

  // --- LOGICA DI FILTRAGGIO ---
  const filteredLetture = letture.filter((l) => {
    const matchesSearch = l.opere?.titolo?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStato = filterStato === "Tutti" || l.stato === filterStato;
    return matchesSearch && matchesStato;
  });

  const getStatusStyles = (stato) => {
    switch (stato) {
      case 'da_iniziare': return { dot: 'bg-blue-500', text: 'text-blue-600', bg: 'bg-blue-50' };
      case 'in_corso': return { dot: 'bg-green-500', text: 'text-green-600', bg: 'bg-green-50' };
      case 'finito': return { dot: 'bg-gray-400', text: 'text-gray-500', bg: 'bg-gray-100' };
      case 'abbandonato': return { dot: 'bg-red-400', text: 'text-red-500', bg: 'bg-red-50' };
      default: return { dot: 'bg-gray-200', text: 'text-gray-400', bg: 'bg-gray-50' };
    }
  };

  const renderStars = (rating, size = "text-lg") => {
    if (!rating) return <span className="text-gray-300 text-[10px] italic font-medium">No voto</span>;
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
      default: return "Diario Letture";
    }
  };

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentLetture = filteredLetture.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredLetture.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar setUser={setUser} setError={setError} />
      
      <div className="max-w-6xl mx-auto px-4 py-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">{getTitle()}</h1>
            <p className="text-gray-400 font-bold text-sm uppercase tracking-widest mt-1">
              {filteredLetture.length} risultati trovati
            </p>
          </div>
          <Link to="/createlettura" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 transition-all shadow-lg shadow-green-100">
            Aggiungi Nuova
          </Link>
        </div>

        {/* --- BARRA FILTRI --- */}
        <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <input 
              type="text"
              placeholder="Cerca nel tuo diario..."
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 transition-all"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
            <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <div className="md:w-64">
            <select 
              className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 appearance-none"
              value={filterStato}
              onChange={(e) => { setFilterStato(e.target.value); setCurrentPage(1); }}
            >
              <option value="Tutti">Tutti gli stati</option>
              <option value="da_iniziare">Da iniziare</option>
              <option value="in_corso">In corso</option>
              <option value="finito">Finito</option>
              <option value="abbandonato">Abbandonato</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-3xl animate-pulse" />)}
          </div>
        ) : filteredLetture.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Nessuna lettura trovata</p>
          </div>
        ) : (
          <>
            {/* VISTA DESKTOP */}
            <div className="hidden md:block bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Opera</th>
                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Stato</th>
                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Progresso</th>
                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Voto</th>
                    <th className="px-6 py-5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {currentLetture.map((l) => {
                    const styles = getStatusStyles(l.stato);
                    return (
                      <tr key={l.id_lettura} onClick={() => navigate(`/lettura/${l.id_lettura}`)} className="group hover:bg-blue-50/30 transition-colors cursor-pointer">
                        <td className="px-6 py-5">
                          <p className="font-black text-gray-800 group-hover:text-blue-600 transition-colors">{l.opere?.titolo}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase">{l.opere?.editore || "N/A"}</p>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase ${styles.bg} ${styles.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
                            {l.stato.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-5 font-bold text-sm text-gray-600">
                           <div className="flex gap-2">
                             {l.volume && <span className="bg-gray-50 px-2 py-0.5 rounded">Vol.{l.volume}</span>}
                             {l.capitolo && <span className="bg-gray-50 px-2 py-0.5 rounded">Cap.{l.capitolo}</span>}
                             {l.pagina && <span className="bg-gray-50 px-2 py-0.5 rounded">Pag.{l.pagina}</span>}
                             {(!l.volume && !l.capitolo) && <span className="text-gray-300">--</span>}
                           </div>
                        </td>
                        <td className="px-6 py-5">{renderStars(l.valutazione)}</td>
                        <td className="px-6 py-5 text-right font-bold text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                           VEDI →
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* VISTA MOBILE */}
            <div className="md:hidden space-y-4">
              {currentLetture.map((l) => {
                const styles = getStatusStyles(l.stato);
                return (
                  <div key={l.id_lettura} onClick={() => navigate(`/lettura/${l.id_lettura}`)} className="bg-white p-5 rounded-4xl border border-gray-100 shadow-sm active:scale-[0.98] transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-black text-gray-800 leading-tight">{l.opere?.titolo}</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{l.opere?.editore || "N/A"}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase ${styles.bg} ${styles.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
                        {l.stato.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                      <div className="flex gap-2 text-[11px] font-black text-gray-500 uppercase">
                        {l.volume && <span>Vol. {l.volume}</span>}
                        {l.capitolo && <span>Cap. {l.capitolo}</span>}
                      </div>
                      <div>{renderStars(l.valutazione, "text-base")}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Paginazione */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-12">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-gray-100 shadow-sm disabled:opacity-20 text-gray-400"
            > ← </button>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {currentPage} / {totalPages}
            </span>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-gray-100 shadow-sm disabled:opacity-20 text-gray-400"
            > → </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ListLetture;