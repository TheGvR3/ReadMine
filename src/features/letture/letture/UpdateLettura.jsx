import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import { secureFetch } from "../../../utils/secureFetch";

function UpdateLettura() {
  const { id_lettura } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    data_lettura: "",
    volume: "",
    capitolo: "",
    pagina: "",
    stato: "",
    valutazione: "",
    note: "",
  });

  const [obraInfo, setObraInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Definiamo isLibro controllando bene l'oggetto obraInfo
  const isLibro = obraInfo?.id_tipo === 1 || obraInfo?.tipo === "Libro";

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
          volume: data.volume ?? "",
          capitolo: data.capitolo ?? "",
          pagina: data.pagina ?? "",
          stato: data.stato || "da_iniziare",
          valutazione: data.valutazione ?? "",
          note: data.note || "",
        });
        setObraInfo(data.opere);
      } else {
        setError("Impossibile recuperare i dati della lettura.");
      }
      setDataLoading(false);
    };

    if (id_lettura) fetchLettura();
  }, [id_lettura, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // BLOCCO SICUREZZA: Se è un libro, non permettere modifiche al volume
    if (isLibro && name === "volume") return;

    setFormData((prev) => {
      const newData = { ...prev, [name]: value };

      if (name === "stato" && value === "da_iniziare") {
        newData.volume = "";
        newData.capitolo = "";
        newData.pagina = "";
      }

      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const isActuallyDaIniziare = formData.stato === "da_iniziare";

    const dataToSend = {
      data_lettura: formData.data_lettura || null,
      // Se è libro o da iniziare, mandiamo null per il volume
      volume:
        isActuallyDaIniziare || isLibro
          ? null
          : formData.volume !== ""
          ? parseInt(formData.volume, 10)
          : null,
      capitolo: isActuallyDaIniziare
        ? null
        : formData.capitolo !== ""
        ? parseInt(formData.capitolo, 10)
        : null,
      pagina: isActuallyDaIniziare
        ? null
        : formData.pagina !== ""
        ? parseInt(formData.pagina, 10)
        : null,
      stato: formData.stato || null,
      valutazione:
        formData.valutazione !== "" ? parseInt(formData.valutazione, 10) : null,
      note: formData.note || null,
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
      setTimeout(() => navigate(`/lettura/${id_lettura}`), 1500);
    } else {
      const err = await response.json().catch(() => ({}));
      setError(err.error || "Errore durante l'aggiornamento.");
    }
    setLoading(false);
  };

  if (dataLoading)
    return <div className="text-center mt-10">Caricamento in corso...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex justify-center items-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg mt-10 border border-gray-100">
          <h1 className="text-2xl font-bold mb-2 text-center text-gray-800">
            Modifica Lettura
          </h1>
          {obraInfo && (
            <p className="text-center text-blue-600 font-medium mb-6">
              {obraInfo.titolo}
            </p>
          )}

          {error && (
            <p className="bg-red-100 text-red-600 p-3 rounded mb-4 text-center">
              {error}
            </p>
          )}
          {successMessage && (
            <p className="bg-green-100 text-green-600 p-3 rounded mb-4 text-center font-bold">
              {successMessage}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold">Stato</label>
                <select
                  name="stato"
                  value={formData.stato}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
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
                  className="mt-1 block w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            {/* PROGRESSO */}
            <div className="grid grid-cols-3 gap-4">
              {["volume", "capitolo", "pagina"].map((field) => {
                const isFieldVolume = field === "volume";
                // Disabilita se "da iniziare" OPPURE se è un libro e stiamo guardando il volume
                const isDisabled =
                  formData.stato === "da_iniziare" ||
                  (isLibro && isFieldVolume);

                return (
                  <div key={field}>
                    <label
                      className={`block text-sm font-semibold transition-colors ${
                        isDisabled ? "text-gray-300" : "text-gray-800"
                      }`}
                    >
                      {field.charAt(0).toUpperCase() + field.slice(1)}
                    </label>
                    <input
                      type="number"
                      name={field}
                      value={formData[field]}
                      onChange={handleChange}
                      disabled={isDisabled}
                      readOnly={isDisabled}
                      placeholder={isLibro && isFieldVolume ? "—" : ""}
                      className={`mt-1 block w-full px-3 py-2 border rounded-md outline-none transition-all ${
                        isDisabled
                          ? "bg-gray-50 border-gray-200 cursor-not-allowed text-gray-400 pointer-events-none shadow-inner"
                          : "border-gray-300 focus:ring-2 focus:ring-blue-500"
                      }`}
                    />
                  </div>
                );
              })}
            </div>

            <div>
              <label className="block text-sm font-semibold">Valutazione</label>
              <select
                name="valutazione"
                value={formData.valutazione}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Nessun voto</option>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n} ⭐
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold">
                Note Personali
              </label>
              <textarea
                name="note"
                value={formData.note}
                onChange={handleChange}
                rows="3"
                className="mt-1 block w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={() => navigate("/listletture")}
                className="w-1/2 py-3 bg-gray-200 rounded-md font-bold"
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-1/2 py-3 bg-blue-600 text-white rounded-md font-bold disabled:bg-gray-400 transition"
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
