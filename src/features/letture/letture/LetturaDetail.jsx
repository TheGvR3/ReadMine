import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "../../../components/Navbar";
import { secureFetch } from "../../../utils/secureFetch";

function LetturaDetail() {
  const { id_lettura } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [lettura, setLettura] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLetturaDetail = async () => {
      setLoading(true);
      try {
        const response = await secureFetch(
          `${import.meta.env.VITE_API_BASE_URL}/letture/lettura/${id_lettura}`,
          { method: "GET" },
          navigate
        );

        if (!response || !response.ok) throw new Error("Dettagli non trovati");
        const data = await response.json();
        setLettura(data);
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
      case "da_iniziare": return { text: "text-blue-600", bar: "bg-blue-600", bg: "bg-blue-50" };
      case "in_corso": return { text: "text-green-600", bar: "bg-green-600", bg: "bg-green-50" };
      case "finito": return { text: "text-gray-500", bar: "bg-gray-400", bg: "bg-gray-50" };
      case "abbandonato": return { text: "text-red-400", bar: "bg-red-400/70", bg: "bg-red-50" };
      default: return { text: "text-gray-400", bar: "bg-gray-200", bg: "bg-gray-50" };
    }
  };

  const styles = getStatusStyles(lettura?.stato);

  if (loading) return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar setUser={setUser} setError={setError} />
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Card Principale */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          
          {/* Header Card */}
          <div className={`${styles.bg} p-8 md:p-12 border-b border-gray-100 relative`}>
            <div className={`absolute top-0 left-0 w-full h-2 ${styles.bar}`} />
            
            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
              <div className="flex-1">
                <Link to={`/opere/${lettura.opere?.id_opera}`} className="group">
                  <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Titolo Opera</span>
                  <h1 className="text-4xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">
                    {lettura.opere?.titolo}
                  </h1>
                </Link>
                <p className="mt-2 text-gray-500 font-bold uppercase text-xs tracking-tighter">
                  Editore: <span className="text-gray-900">{lettura.opere?.editore || "N/A"}</span>
                </p>
              </div>

              {/* Azioni: Modifica (Blu) e Rimuovi (Rosso) */}
              <div className="flex gap-3 w-full md:w-auto">
                <button
                  onClick={() => navigate(`/updatelettura/${id_lettura}`)}
                  className="flex-1 md:flex-none bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition active:scale-95"
                >
                  Modifica
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 md:flex-none bg-red-500/10 text-red-600 px-6 py-3 rounded-2xl font-bold hover:bg-red-500 hover:text-white transition active:scale-95"
                >
                  Rimuovi
                </button>
              </div>
            </div>
          </div>

          {/* Body Card */}
          <div className="p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <div className="p-6 rounded-3xl bg-gray-50 border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Stato attuale</p>
                <p className={`text-2xl font-black uppercase ${styles.text}`}>
                  {lettura.stato?.replace("_", " ")}
                </p>
              </div>
              <div className="p-6 rounded-3xl bg-gray-50 border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Ultimo aggiornamento</p>
                <p className="text-2xl font-black text-gray-800">
                  {lettura.data_lettura ? new Date(lettura.data_lettura).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' }) : "--"}
                </p>
              </div>
            </div>

            {/* Sezione Numerica (Visibile solo se ci sono dati) */}
            {(lettura.volume || lettura.capitolo || lettura.pagina) && (
              <div className="flex flex-wrap justify-around items-center p-8 bg-gray-50 rounded-4xl shadow-xl mb-12">
                <div className="text-center px-4">
                  <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Volume</p>
                  <p className="text-4xl font-black">{lettura.volume ?? "--"}</p>
                </div>
                <div className="h-10 w-px bg-gray-800 hidden md:block"></div>
                <div className="text-center px-4">
                  <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Capitolo</p>
                  <p className="text-4xl font-black">{lettura.capitolo ?? "--"}</p>
                </div>
                <div className="h-10 w-px bg-gray-800 hidden md:block"></div>
                <div className="text-center px-4">
                  <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Pagina</p>
                  <p className="text-4xl font-black">{lettura.pagina ?? "--"}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Valutazione */}
              <div>
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                  Valutazione
                </h3>
                <div className="flex gap-1">
                  {lettura.valutazione ? (
                    [...Array(5)].map((_, i) => (
                      <span key={i} className={`text-3xl ${i < lettura.valutazione ? "text-yellow-400" : "text-gray-200"}`}>
                        ★
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400 font-bold italic">Nessun voto assegnato</span>
                  )}
                </div>
              </div>

              {/* Note */}
              <div>
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                  Note Personali
                </h3>
                <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100/50">
                  <p className="text-gray-700 leading-relaxed italic">
                    {lettura.note || "Nessun pensiero salvato per questa lettura."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Link di ritorno */}
        <div className="mt-10 flex justify-center">
          <Link
            to="/listletture"
            className="group flex items-center gap-3 text-gray-400 font-black uppercase text-xs tracking-[0.2em] hover:text-blue-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4 group-hover:-translate-x-1 transition-transform">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Torna alla lista
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LetturaDetail;