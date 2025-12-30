import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "../../../components/Navbar";
import { secureFetch } from "../../../utils/secureFetch";

function LetturaDetail() {
  // ---------------------------------------------------------------------------
  // 1. RECUPERO ID E NAVIGAZIONE
  // ---------------------------------------------------------------------------
  const { id_lettura } = useParams();
  const navigate = useNavigate();

  // ---------------------------------------------------------------------------
  // 2. STATI LOCALI
  // ---------------------------------------------------------------------------
  const [lettura, setLettura] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ---------------------------------------------------------------------------
  // 3. CARICAMENTO DATI
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const fetchLetturaDetail = async () => {
      setLoading(true);
      setError("");

      const response = await secureFetch(
        `${import.meta.env.VITE_API_BASE_URL}/letture/dettaglio/${id_lettura}`,
        { method: "GET" },
        navigate
      );

      if (!response) return;

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        setError(err.error || "Errore nel caricamento della lettura");
        setLoading(false);
        return;
      }

      const data = await response.json();
      setLettura(data);
      setLoading(false);
    };

    if (id_lettura) fetchLetturaDetail();
  }, [id_lettura, navigate]);

  // ---------------------------------------------------------------------------
  // 4. LOGICA DI SUPPORTO
  // ---------------------------------------------------------------------------
  const getStatusColor = (stato) => {
    switch (stato) {
      case "finito": return "text-gray-500 border-black";
      case "in_corso": return "text-green-600 border-green-600";
      case "abbandonato": return "text-red-600 border-red-600";
      default: return "text-blue-600 border-blue-600";
    }
  };

  const statusInfo = lettura ? getStatusColor(lettura.stato) : "";

  // ---------------------------------------------------------------------------
  // 5. AZIONI
  // ---------------------------------------------------------------------------
  const handleUpdate = () => {
    navigate(`/updatelettura/${id_lettura}`);
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Rimuovere questa lettura dal tuo diario?");
    if (!confirmDelete) return;

    const response = await secureFetch(
      `${import.meta.env.VITE_API_BASE_URL}/letture/${id_lettura}`,
      { method: "DELETE" },
      navigate
    );

    if (response?.ok) {
      alert("Lettura rimossa.");
      navigate("/listletture");
    } else {
      setError("Errore durante l'eliminazione.");
    }
  };

  // ---------------------------------------------------------------------------
  // 6. RENDER
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-10">
        {loading && <p className="text-center text-lg text-gray-700">Caricamento...</p>}
        {error && <p className="text-center text-xl text-red-600 font-medium my-4">{error}</p>}

        {lettura && (
          <div className={`bg-white rounded-xl shadow-xl overflow-hidden border-r-8 ${statusInfo.split(' ')[1]}`}>
            
            {/* INTESTAZIONE: INFO OPERA */}
            <div className="bg-linear-to-br from-indigo-50 to-gray-100 p-8 border-b">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                  <h1 className="text-4xl font-extrabold text-gray-900 leading-tight">
                    {lettura.opere?.titolo}
                  </h1>
                  <p className="text-indigo-600 font-semibold mt-1 italic">
                    {lettura.opere?.editore || "Editore non specificato"}
                  </p>
                </div>

                <div className="flex space-x-2 shrink-0">
                  <button onClick={handleUpdate} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold shadow-sm transition">
                    Aggiorna
                  </button>
                  <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-semibold shadow-sm transition">
                    Elimina
                  </button>
                </div>
              </div>
            </div>

            {/* CORPO: DETTAGLI LETTURA */}
            <div className="p-8 space-y-6">
              
              {/* STATO E DATA */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <span className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Stato Attuale</span>
                  <span className={`text-xl font-bold uppercase ${statusInfo.split(' ')[0]}`}>
                    {lettura.stato.replace("_", " ")}
                  </span>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <span className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Ultimo Aggiornamento</span>
                  <span className="text-xl font-semibold text-gray-800">
                    {lettura.data_lettura ? new Date(lettura.data_lettura).toLocaleDateString() : "N/D"}
                  </span>
                </div>
              </div>

              {/* PROGRESSO FISICO */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 border rounded-lg bg-white shadow-sm">
                  <span className="block text-gray-500 text-sm">Volume</span>
                  <span className="text-2xl font-bold text-indigo-700">{lettura.volume || "-"}</span>
                </div>
                <div className="text-center p-3 border rounded-lg bg-white shadow-sm">
                  <span className="block text-gray-500 text-sm">Capitolo</span>
                  <span className="text-2xl font-bold text-indigo-700">{lettura.capitolo || "-"}</span>
                </div>
                <div className="text-center p-3 border rounded-lg bg-white shadow-sm">
                  <span className="block text-gray-500 text-sm">Pagina</span>
                  <span className="text-2xl font-bold text-indigo-700">{lettura.pagina || "-"}</span>
                </div>
              </div>

              {/* VALUTAZIONE */}
              <div className="flex items-center space-x-2 pt-2">
                <span className="font-semibold text-gray-700">Valutazione Personale:</span>
                <span className="text-xl text-yellow-500">
                  {lettura.valutazione ? "⭐".repeat(lettura.valutazione) : "Nessuna"}
                </span>
              </div>

              {/* NOTE */}
              {lettura.note && (
                <div className="pt-6 border-t">
                  <h3 className="text-sm font-bold text-gray-400 uppercase mb-2">Note Personali</h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                    {lettura.note}
                  </p>
                </div>
              )}

              {/* LINK ALL'OPERA */}
              <div className="pt-4">
                <Link 
                  to={`/opera/${lettura.opere?.id_opera}`} 
                  className="text-sm text-indigo-600 hover:underline font-medium"
                >
                  Visualizza scheda tecnica dell'opera →
                </Link>
              </div>

            </div>
          </div>
        )}

        <div className="flex justify-center mt-10">
          <button onClick={() => navigate("/listletture")} className="text-blue-600 hover:underline font-medium text-lg">
            ← Torna al diario
          </button>
        </div>
      </div>
    </div>
  );
}

export default LetturaDetail;