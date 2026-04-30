import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "../../../components/Navbar";
import Button from "../../../components/ui/Button"; // <-- Il nostro nuovo componente!
import { secureFetch } from "../../../utils/secureFetch";

function LetturaDetail() {
  const { id_lettura } = useParams();
  const navigate = useNavigate();
  
  const [lettura, setLettura] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Scroll in cima
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id_lettura]);

  useEffect(() => {
    const fetchLetturaDetail = async () => {
      setLoading(true);
      setError("");
      try {
        // Fetch SOLO dei dettagli lettura (l'utente è gestito da AuthContext)
        const response = await secureFetch(
          `${import.meta.env.VITE_API_BASE_URL}/letture/lettura/${id_lettura}`,
          { method: "GET" },
          navigate
        );

        if (!response || !response.ok) throw new Error("Dettagli non trovati");
        setLettura(await response.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (id_lettura) fetchLetturaDetail();
  }, [id_lettura, navigate]);

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Vuoi davvero rimuovere questa lettura dal diario?");
    if (!confirmDelete) return;

    try {
      const response = await secureFetch(
        `${import.meta.env.VITE_API_BASE_URL}/letture/${id_lettura}`,
        { method: "DELETE" },
        navigate
      );
      if (response && response.ok) {
        navigate("/listletture");
      }
    } catch (err) {
      setError("Errore durante l'eliminazione.");
    }
  };

  const getStatusStyles = (stato) => {
    switch (stato) {
      case "da_iniziare": return { text: "text-blue-600", bar: "bg-blue-600", bg: "bg-blue-50/50" };
      case "in_corso": return { text: "text-green-600", bar: "bg-green-600", bg: "bg-green-50/50" };
      case "finito": return { text: "text-gray-500", bar: "bg-gray-400", bg: "bg-gray-50" };
      case "abbandonato": return { text: "text-red-400", bar: "bg-red-400/70", bg: "bg-red-50/50" };
      default: return { text: "text-gray-400", bar: "bg-gray-200", bg: "bg-gray-50" };
    }
  };

  const styles = getStatusStyles(lettura?.stato);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar /> {/* Niente props! */}

      {/* pb-24 per proteggere dalla Bottom Nav */}
      <div className="max-w-3xl mx-auto px-4 pt-6 pb-24 md:py-10">
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-4 border-blue-600"></div>
          </div>
        ) : error ? (
           <div className="bg-red-50 p-6 rounded-2xl border border-red-100 text-center">
            <p className="text-red-600 font-black uppercase tracking-widest text-sm">
              {error}
            </p>
          </div>
        ) : (
          lettura && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative"
            >
              {/* Barra colorata in alto in base allo stato */}
              <div className={`absolute top-0 left-0 w-full h-1.5 sm:h-2 ${styles.bar}`} />
              
              {/* --- HEADER CARD --- */}
              <div className={`${styles.bg} p-6 sm:p-8 border-b border-gray-100 pt-8 sm:pt-10`}>
                <div className="flex flex-col md:flex-row justify-between items-start gap-5 w-full">
                  <div className="flex-1 w-full">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">
                      Opera collegata
                    </span>
                    <Link to={`/opere/${lettura.opere?.id_opera}`} className="group inline-block">
                      <h1 className="text-2xl sm:text-3xl font-black text-gray-900 group-hover:text-blue-600 transition-colors leading-tight line-clamp-2">
                        {lettura.opere?.titolo}
                      </h1>
                    </Link>
                    {lettura.edizioni && (
                      <p className="mt-1.5 text-gray-500 font-bold uppercase text-[10px] sm:text-xs tracking-wide">
                        Edizione: <span className="text-gray-800">{lettura.edizioni.editore || "—"}</span>
                        {lettura.edizioni.anno_pubblicazione && (
                          <span className="text-gray-500"> ({lettura.edizioni.anno_pubblicazione})</span>
                        )}
                      </p>
                    )}
                  </div>

                  {/* AZIONI: Usiamo il componente Button! */}
                  <div className="flex flex-row md:flex-col flex-wrap gap-2 w-full md:w-auto mt-2 md:mt-0 shrink-0">
                    <Button 
                      variant="outlineBlue" 
                      to={`/updatelettura/${id_lettura}`}
                      className="flex-1 md:flex-none"
                    >
                      Modifica
                    </Button>
                    <Button 
                      variant="danger" 
                      onClick={handleDelete}
                      className="flex-1 md:flex-none"
                    >
                      Rimuovi
                    </Button>
                  </div>
                </div>
              </div>

              {/* --- BODY CARD --- */}
              <div className="p-6 sm:p-8">
                
                {/* Stato e Date */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 border-b border-gray-100 pb-8">
                  <div className="p-4 sm:p-5 rounded-xl bg-gray-50 border border-gray-100">
                    <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Stato</p>
                    <p className={`text-base sm:text-lg font-black uppercase tracking-wide ${styles.text}`}>
                      {lettura.stato?.replace("_", " ")}
                    </p>
                  </div>
                  <div className="p-4 sm:p-5 rounded-xl bg-gray-50 border border-gray-100">
                    <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Inizio</p>
                    <p className="text-sm sm:text-base font-black text-gray-800">
                      {lettura.data_inizio ? new Date(lettura.data_inizio).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' }) : "—"}
                    </p>
                  </div>
                  <div className="p-4 sm:p-5 rounded-xl bg-gray-50 border border-gray-100">
                    <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Fine</p>
                    <p className="text-sm sm:text-base font-black text-gray-800">
                      {lettura.data_fine ? new Date(lettura.data_fine).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' }) : "—"}
                    </p>
                  </div>
                </div>

                {/* Sezione Progresso Numerico (Solo se presenti dati) */}
                {(lettura.volume || lettura.capitolo || lettura.pagina) && (
                  <div className="flex flex-row justify-around items-center p-4 sm:p-6 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm mb-8 gap-2">
                    <div className="text-center px-2 sm:px-4">
                      <p className="text-gray-400 text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-1">Volume</p>
                      <p className="text-2xl sm:text-3xl font-black text-gray-800">{lettura.volume ?? "--"}</p>
                    </div>
                    <div className="h-8 sm:h-10 w-px bg-gray-200"></div>
                    <div className="text-center px-2 sm:px-4">
                      <p className="text-gray-400 text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-1">Capitolo</p>
                      <p className="text-2xl sm:text-3xl font-black text-gray-800">{lettura.capitolo ?? "--"}</p>
                    </div>
                    <div className="h-8 sm:h-10 w-px bg-gray-200"></div>
                    <div className="text-center px-2 sm:px-4">
                      <p className="text-gray-400 text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-1">Pagina</p>
                      <p className="text-2xl sm:text-3xl font-black text-gray-800">{lettura.pagina ?? "--"}</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                  {/* Valutazione */}
                  <div className="bg-white">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
                      Valutazione
                    </h3>
                    <div className="flex gap-1 bg-gray-50 p-4 rounded-xl border border-gray-100 w-max">
                      {lettura.valutazione ? (
                        [...Array(5)].map((_, i) => (
                          <span key={i} className={`text-2xl sm:text-3xl leading-none ${i < lettura.valutazione ? "text-yellow-400" : "text-gray-200"}`}>
                            ★
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 font-bold italic text-xs">Nessun voto</span>
                      )}
                    </div>
                  </div>

                  {/* Note */}
                  <div>
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                      Note Personali
                    </h3>
                    <div className="bg-blue-50/50 p-4 sm:p-5 rounded-xl border border-blue-100/50 h-full">
                      <p className="text-gray-700 leading-relaxed italic text-sm">
                        {lettura.note || "Nessun pensiero salvato per questa lettura."}
                      </p>
                    </div>
                  </div>
                </div>
                
              </div>
            </motion.div>
          )
        )}

        {/* Link di ritorno */}
        <div className="mt-8 flex justify-center">
          <Link
            to="/listletture"
            className="group flex items-center gap-2 text-gray-400 font-black uppercase text-[10px] sm:text-xs tracking-[0.2em] hover:text-blue-600 transition-colors py-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:-translate-x-1 transition-transform">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Torna al diario
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LetturaDetail;