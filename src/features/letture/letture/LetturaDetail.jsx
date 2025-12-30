import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "../../../components/Navbar";
import { secureFetch } from "../../../utils/secureFetch";

function LetturaDetail() {
  const { id_lettura } = useParams();
  const navigate = useNavigate();

  const [lettura, setLettura] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLetturaDetail = async () => {
      setLoading(true);
      setError("");
      try {
        // NOTA: Verifica se l'URL del backend è /letture/ o /letture/dettaglio/
        const response = await secureFetch(
          `${import.meta.env.VITE_API_BASE_URL}/letture/${id_lettura}`,
          { method: "GET" },
          navigate
        );

        if (!response) return;

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          setError(err.error || "Lettura non trovata");
        } else {
          const data = await response.json();
          setLettura(data);
        }
      } catch (err) {
        setError("Errore di connessione al server");
      } finally {
        setLoading(false);
      }
    };

    if (id_lettura) fetchLetturaDetail();
  }, [id_lettura, navigate]);

  // LOGICA COLORI SICURA
  const getStatusStyles = (stato) => {
    switch (stato) {
      case "finito": return { text: "text-gray-500", border: "border-black" };
      case "in_corso": return { text: "text-green-600", border: "border-green-600" };
      case "abbandonato": return { text: "text-red-600", border: "border-red-600" };
      default: return { text: "text-blue-600", border: "border-blue-600" };
    }
  };

  const styles = getStatusStyles(lettura?.stato);

  const handleDelete = async () => {
    if (!window.confirm("Rimuovere questa lettura dal tuo diario?")) return;
    const response = await secureFetch(
      `${import.meta.env.VITE_API_BASE_URL}/letture/${id_lettura}`,
      { method: "DELETE" },
      navigate
    );
    if (response?.ok) {
      navigate("/listletture");
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50"><Navbar />
      <p className="text-center mt-20 text-gray-500 animate-pulse">Caricamento in corso...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50"><Navbar />
      <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow text-center">
        <p className="text-red-600 font-bold">{error}</p>
        <button onClick={() => navigate("/listletture")} className="mt-4 text-indigo-600 underline">Torna alla lista</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-10">
        {lettura && (
          <div className={`bg-white rounded-xl shadow-xl overflow-hidden border-r-8 ${styles.border}`}>
            
            {/* HEADER */}
            <div className="bg-gray-50 p-8 border-b">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                  <h1 className="text-4xl font-extrabold text-gray-900 leading-tight">
                    {lettura.opere?.titolo || "Titolo non disponibile"}
                  </h1>
                  <p className="text-indigo-600 font-semibold mt-1 italic">
                    {lettura.opere?.editore || "Editore non specificato"}
                  </p>
                </div>

                <div className="flex space-x-2">
                  <button onClick={() => navigate(`/updatelettura/${id_lettura}`)} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold transition">
                    Aggiorna
                  </button>
                  <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-semibold transition">
                    Elimina
                  </button>
                </div>
              </div>
            </div>

            {/* INFO CONTENT */}
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <span className="block text-xs font-bold text-gray-400 uppercase">Stato</span>
                  <span className={`text-xl font-bold uppercase ${styles.text}`}>
                    {lettura.stato?.replace("_", " ")}
                  </span>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <span className="block text-xs font-bold text-gray-400 uppercase">Data</span>
                  <span className="text-xl font-semibold text-gray-800">
                    {lettura.data_lettura ? new Date(lettura.data_lettura).toLocaleDateString() : "Nessuna data"}
                  </span>
                </div>
              </div>

              {/* PROGRESSO */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Volume", val: lettura.volume },
                  { label: "Capitolo", val: lettura.capitolo },
                  { label: "Pagina", val: lettura.pagina }
                ].map((item) => (
                  <div key={item.label} className="text-center p-3 border rounded-lg bg-white shadow-sm">
                    <span className="block text-gray-400 text-xs font-bold uppercase">{item.label}</span>
                    <span className="text-2xl font-black text-indigo-700">{item.val || "-"}</span>
                  </div>
                ))}
              </div>

              {/* VALUTAZIONE */}
              <div className="flex items-center space-x-2 pt-2">
                <span className="font-semibold text-gray-700">Valutazione:</span>
                <span className="text-xl text-yellow-500">
                  {lettura.valutazione ? "⭐".repeat(lettura.valutazione) : "Non valutata"}
                </span>
              </div>

              {/* NOTE */}
              {lettura.note && (
                <div className="pt-6 border-t">
                  <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Note Personali</h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line bg-yellow-50/50 p-4 rounded-lg border border-yellow-100">
                    {lettura.note}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-center mt-10">
          <Link to="/listletture" className="text-indigo-600 hover:underline font-medium">
            ← Torna al diario
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LetturaDetail;