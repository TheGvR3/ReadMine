import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import { secureFetch } from "../../../utils/secureFetch";

function UpdateLettura() {
  const { id_lettura } = useParams();
  const navigate = useNavigate();

  // --- 1. STATO DEL FORM ---
  const [formData, setFormData] = useState({
    data_lettura: "",
    volume: "",
    capitolo: "",
    pagina: "",
    stato: "",
    valutazione: "",
    note: ""
  });

  const [obraInfo, setObraInfo] = useState(null); // Per mostrare a quale opera si riferisce la lettura
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // --- 2. CARICAMENTO DATI ESISTENTI ---
  useEffect(() => {
    const fetchLettura = async () => {
      setDataLoading(true);
      const response = await secureFetch(
        `${import.meta.env.VITE_API_BASE_URL}/letture/lettura/${id_lettura}`,
        { method: "GET" },
        navigate
      );

      if (response && response.ok) {
        const data = await response.json();
        setFormData({
          data_lettura: data.data_lettura || "",
          volume: data.volume || "",
          capitolo: data.capitolo || "",
          pagina: data.pagina || "",
          stato: data.stato || "da_iniziare",
          valutazione: data.valutazione || "",
          note: data.note || ""
        });
        setObraInfo(data.opere); // Salviamo info dell'opera (titolo, etc)
      } else {
        setError("Impossibile recuperare i dati della lettura.");
      }
      setDataLoading(false);
    };

    if (id_lettura) fetchLettura();
  }, [id_lettura, navigate]);

  // --- 3. GESTORI EVENTI ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- 4. SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Prepariamo i dati convertendo le stringhe vuote in null e i numeri in Int
    const dataToSend = {
      data_lettura: formData.data_lettura || null,
      volume: formData.volume !== "" ? parseInt(formData.volume, 10) : null,
      capitolo: formData.capitolo !== "" ? parseInt(formData.capitolo, 10) : null,
      pagina: formData.pagina !== "" ? parseInt(formData.pagina, 10) : null,
      stato: formData.stato || null,
      valutazione: formData.valutazione !== "" ? parseInt(formData.valutazione, 10) : null,
      note: formData.note || null
    };

    const response = await secureFetch(
      `${import.meta.env.VITE_API_BASE_URL}/letture/${id_lettura}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      },
      navigate
    );

    if (response && response.ok) {
      setSuccessMessage("Lettura aggiornata con successo!");
      setTimeout(() => navigate("/listletture"), 1500);
    } else {
      const err = await response.json().catch(() => ({}));
      setError(err.error || "Errore durante l'aggiornamento.");
    }
    setLoading(false);
  };

  if (dataLoading) return <div className="text-center mt-10">Caricamento in corso...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex justify-center items-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg mt-10">
          <h1 className="text-2xl font-bold mb-2 text-center text-gray-800">Modifica Lettura</h1>
          {obraInfo && (
            <p className="text-center text-blue-600 font-medium mb-6">
              {obraInfo.titolo}
            </p>
          )}

          {error && <p className="bg-red-100 text-red-600 p-3 rounded mb-4 text-center">{error}</p>}
          {successMessage && (
            <p className="bg-green-100 text-green-600 p-3 rounded mb-4 text-center font-bold">
              {successMessage}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* STATO E DATA */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold">Stato</label>
                <select
                  name="stato"
                  value={formData.stato}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border rounded-md"
                >
                  <option value="da_iniziare">Da iniziare</option>
                  <option value="in_corso">In corso</option>
                  <option value="finito">Finito</option>
                  <option value="abbandonato">Abbandonato</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold">Data</label>
                <input
                  type="date"
                  name="data_lettura"
                  value={formData.data_lettura}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>

            {/* PROGRESSO */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold">Volume</label>
                <input
                  type="number"
                  name="volume"
                  value={formData.volume}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold">Capitolo</label>
                <input
                  type="number"
                  name="capitolo"
                  value={formData.capitolo}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold">Pagina</label>
                <input
                  type="number"
                  name="pagina"
                  value={formData.pagina}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>

            {/* VALUTAZIONE */}
            <div>
              <label className="block text-sm font-semibold">Valutazione</label>
              <select
                name="valutazione"
                value={formData.valutazione}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border rounded-md"
              >
                <option value="">Nessun voto</option>
                {[1, 2, 3, 4, 5].map(n => (
                  <option key={n} value={n}>{n} ⭐</option>
                ))}
              </select>
            </div>

            {/* NOTE */}
            <div>
              <label className="block text-sm font-semibold">Note Personali</label>
              <textarea
                name="note"
                value={formData.note}
                onChange={handleChange}
                rows="3"
                className="mt-1 block w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={() => navigate("/listletture")}
                className="w-1/2 py-2 bg-gray-500 text-white rounded-md font-bold"
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-1/2 py-2 bg-blue-600 text-white rounded-md font-bold disabled:bg-gray-400 shadow-md"
              >
                {loading ? "Salvataggio..." : "Salva Modifiche"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UpdateLettura;