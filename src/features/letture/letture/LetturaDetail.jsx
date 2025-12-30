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
      try {
        const response = await secureFetch(
          `${import.meta.env.VITE_API_BASE_URL}/letture/lettura/${id_lettura}`,
          { method: "GET" },
          navigate
        );

        if (!response || !response.ok) {
          throw new Error("Impossibile recuperare i dettagli della lettura");
        }

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

  // --- LOGICA DI ELIMINAZIONE ---
  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Sei sicuro di voler eliminare questa lettura dal tuo diario? L'azione è irreversibile."
    );

    if (!confirmDelete) return;

    try {
      const response = await secureFetch(
        `${import.meta.env.VITE_API_BASE_URL}/letture/${id_lettura}`,
        { method: "DELETE" },
        navigate
      );

      if (!response) return;

      if (response.ok) {
        alert("Lettura eliminata con successo.");
        navigate("/listletture"); // Torna alla lista
      } else {
        const err = await response.json().catch(() => ({}));
        setError(err.error || "Errore durante l'eliminazione.");
      }
    } catch (err) {
      setError("Si è verificato un errore durante l'eliminazione.");
    }
  };

  const getStatusStyles = (stato) => {
    const defaultStyle = {
      text: "text-blue-600",
      border: "border-blue-600",
      bg: "bg-blue-50",
    };
    if (!stato) return defaultStyle;

    switch (stato) {
      case "finito":
        return {
          text: "text-gray-500",
          border: "border-black",
          bg: "bg-gray-50",
        };
      case "in_corso":
        return {
          text: "text-green-600",
          border: "border-green-600",
          bg: "bg-green-50",
        };
      case "da_iniziare":
        return {
          text: "text-orange-600",
          border: "border-orange-600",
          bg: "bg-orange-50",
        };
      case "abbandonato":
        return {
          text: "text-red-600",
          border: "border-red-600",
          bg: "bg-red-50",
        };
      default:
        return defaultStyle;
    }
  };

  const styles = getStatusStyles(lettura?.stato);

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow-lg text-center">
          <p className="text-red-600 font-bold">{error}</p>
          <button
            onClick={() => navigate("/listletture")}
            className="mt-4 text-indigo-600 underline"
          >
            Torna alla lista
          </button>
        </div>
      </div>
    );

  if (!lettura) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-10">
        <div
          className={`bg-white rounded-xl shadow-2xl overflow-hidden border-t-8 ${styles.border}`}
        >
          <div className={`${styles.bg} p-8 border-b border-gray-100`}>
            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
              <div className="flex-1">
                <Link to={`/opere/${lettura.opere?.id_opera}`}>
                  <h1 className="text-4xl font-black text-gray-900 mt-1 uppercase">
                    {lettura.opere?.titolo || "Titolo mancante"}
                  </h1>
                </Link>
                <p className="text-lg text-gray-600 font-medium italic mt-2">
                  Editore:{" "}
                  <span className="text-indigo-600">
                    {lettura.opere?.editore || "N/D"}
                  </span>
                </p>
              </div>

              {/* PULSANTI AZIONE */}
              <div className="flex gap-3">
                <button
                  onClick={() => navigate(`/updatelettura/${id_lettura}`)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-bold shadow-lg transition"
                >
                  Modifica
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-bold shadow-lg transition"
                >
                  Rimuovi
                </button>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 shadow-inner">
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">
                  Stato di lettura
                </p>
                <p className={`text-2xl font-black uppercase ${styles.text}`}>
                  {lettura.stato
                    ? lettura.stato.replace("_", " ")
                    : "Non definito"}
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 shadow-inner">
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">
                  Letto il:
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {lettura.data_lettura
                    ? new Date(lettura.data_lettura).toLocaleDateString()
                    : "Data non presente"}
                </p>
              </div>
            </div>

            <div className="bg-indigo-900 rounded-3xl p-8 text-white flex justify-around items-center shadow-xl">
              <div className="text-center">
                <p className="text-indigo-300 text-xs font-bold uppercase mb-1">
                  Volume
                </p>
                <p className="text-4xl font-black">{lettura.volume ?? "--"}</p>
              </div>
              <div className="h-12 w-px bg-indigo-700"></div>
              <div className="text-center">
                <p className="text-indigo-300 text-xs font-bold uppercase mb-1">
                  Capitolo
                </p>
                <p className="text-4xl font-black">
                  {lettura.capitolo ?? "--"}
                </p>
              </div>
              <div className="h-12 w-px bg-indigo-700"></div>
              <div className="text-center">
                <p className="text-indigo-300 text-xs font-bold uppercase mb-1">
                  Pagina
                </p>
                <p className="text-4xl font-black">{lettura.pagina ?? "--"}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  La mia valutazione
                </h3>
                <div className="flex text-3xl text-yellow-400">
                  {lettura.valutazione ? (
                    "⭐".repeat(lettura.valutazione)
                  ) : (
                    <span className="text-gray-300 italic text-sm">
                      Nessun voto
                    </span>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  Note Personali
                </h3>
                <p className="text-gray-600 italic bg-yellow-50 p-4 rounded-xl border border-yellow-100 min-h-[100px]">
                  {lettura.note || "Nessuna nota aggiunta a questa lettura."}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/listletture"
            className="text-indigo-600 font-bold hover:underline flex items-center justify-center gap-2"
          >
            ← Torna alla lista completa
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LetturaDetail;
