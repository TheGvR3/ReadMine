import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "../../../components/Navbar";
import { secureFetch } from "../../../utils/secureFetch";

function OperaDetail() {
  // ---------------------------------------------------------------------------
  // 1. RECUPERO ID E NAVIGAZIONE
  // ---------------------------------------------------------------------------
  const { id_opera } = useParams();
  const navigate = useNavigate();

  // ---------------------------------------------------------------------------
  // 2. STATI LOCALI
  // ---------------------------------------------------------------------------
  const [opera, setOpera] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ---------------------------------------------------------------------------
  // 3. CARICAMENTO DATI
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const fetchOperaDetail = async () => {
      setLoading(true);
      setError("");

      const response = await secureFetch(
        `${import.meta.env.VITE_API_BASE_URL}/opere/${id_opera}`,
        { method: "GET" },
        navigate
      );

      if (!response) return;

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        setError(err.error || "Errore nel caricamento dell'opera");
        setLoading(false);
        return;
      }

      const data = await response.json();
      setOpera(data);
      setLoading(false);
    };

    if (id_opera) fetchOperaDetail();
  }, [id_opera, navigate]);

  // ---------------------------------------------------------------------------
  // 4. LOGICA DI SUPPORTO (Parsing stringhe dalla Vista SQL)
  // ---------------------------------------------------------------------------
  const autoriProcessati = opera?.autori
    ? opera.autori.split(",").map((nome, index) => ({
        nome: nome.trim(),
        id: opera.autori_ids[index],
      }))
    : [];

  const generiProcessati = opera?.generi
    ? opera.generi.split(",").map((nome, index) => ({
        nome: nome.trim(),
        id: opera.generi_ids[index],
      }))
    : [];

  const borderClass =
    opera?.stato_opera === "finito" ? "border-black" : "border-green-600";

  // ---------------------------------------------------------------------------
  // 5. GESTIONE AZIONI (MODIFICA ED ELIMINA)
  // ---------------------------------------------------------------------------

  // Naviga alla pagina di modifica
  const handleUpdate = () => {
    navigate(`/updateopera/${id_opera}`);
  };

  // Funzione per l'eliminazione
  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Sei sicuro di voler eliminare questa opera? L'azione è irreversibile."
    );

    if (!confirmDelete) return;

    const response = await secureFetch(
      `${import.meta.env.VITE_API_BASE_URL}/opere/${id_opera}`,
      { method: "DELETE" },
      navigate
    );

    if (!response) return;

    if (response.ok) {
      alert("Opera eliminata con successo.");
      navigate("/ListOpere");
    } else {
      const err = await response.json().catch(() => ({}));
      setError(err.error || "Errore durante l'eliminazione.");
    }
  };

  // ---------------------------------------------------------------------------
  // 6. RENDER
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading && (
          <p className="text-center text-lg text-gray-700">
            Caricamento in corso...
          </p>
        )}

        {error && (
          <p className="text-center text-xl text-red-600 font-medium my-4">
            {error}
          </p>
        )}

        {opera && (
          <div
            className={`bg-white rounded-xl shadow-xl overflow-hidden border-r-8 ${borderClass} transition-all duration-200`}
          >
            {/* INTESTAZIONE / COPERTINA */}
            <div className="bg-linear-to-br from-gray-100 to-gray-200 p-8 border-b">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <h1 className="text-4xl font-extrabold text-gray-900 leading-tight">
                  {opera.titolo}
                </h1>

                <div className="flex space-x-2 shrink-0">
                  <button
                    onClick={handleUpdate}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-semibold shadow-sm"
                  >
                    Modifica
                  </button>

                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition font-semibold shadow-sm"
                  >
                    Elimina
                  </button>
                </div>
              </div>

              {opera.editore && (
                <p className="text-sm text-gray-600 italic mt-2">
                  Editore: {opera.editore}
                </p>
              )}
            </div>

            {/* DETTAGLI CORPO PAGINA */}
            <div className="p-8 space-y-4">
              {/* Autori */}
              <p className="text-lg text-gray-800">
                <span className="font-semibold">Autore/i:</span>{" "}
                {autoriProcessati.length > 0
                  ? autoriProcessati.map((autore, index) => (
                      <span key={autore.id || index}>
                        <Link
                          to={`/autore/${autore.id}`}
                          className="text-black-600 hover:underline font-medium"
                        >
                          {autore.nome}
                        </Link>
                        {/* Aggiunge il pallino separatore tranne che dopo l'ultimo elemento */}
                        {index < autoriProcessati.length - 1 && " • "}
                      </span>
                    ))
                  : "N/A"}
              </p>

              {/* Anno */}
              <p className="text-lg text-gray-800">
                <span className="font-semibold">Anno:</span>{" "}
                {opera.anno_pubblicazione}
              </p>

              {/* Lingua */}
              <p className="text-lg text-gray-800">
                <span className="font-semibold">Lingua Originale:</span>{" "}
                {opera.lingua_originale || "N/A"}
              </p>

              {/* Generi */}
              <div className="text-lg font-semibold text-indigo-600 flex flex-wrap gap-y-1">
                {generiProcessati.length > 0
                  ? generiProcessati.map((genere, index) => (
                      <span key={genere.id || index}>
                        <Link
                          to={`/genere/${genere.id}`}
                          className="hover:text-indigo-800 hover:underline"
                        >
                          {genere.nome}
                        </Link>
                        {index < generiProcessati.length - 1 && (
                          <span className="mx-2 text-gray-400">•</span>
                        )}
                      </span>
                    ))
                  : "N/A"}
              </div>

              {/* Tipo + Stato */}
              <p className="text-sm text-gray-600 uppercase tracking-wider">
                {opera.tipo}
                {" • "}
                <span
                  className={
                    opera.stato_opera === "finito"
                      ? "text-gray-500"
                      : "text-green-600 font-semibold"
                  }
                >
                  {opera.stato_opera}
                </span>
              </p>

              {/* Serie */}
              {opera.serie && (
                <p className="text-gray-600 italic">
                  Serie:{" "}
                  <Link
                    to={`/serie/${opera.id_serie}`}
                    className="text-indigo-600 font-semibold hover:underline"
                  >
                    {opera.serie}
                  </Link>
                </p>
              )}

              {/* Descrizione */}
              {opera.descrizione && (
                <div className="pt-4 border-t">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {opera.descrizione}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {!loading && !opera && !error && (
          <p className="text-center text-xl text-gray-500 mt-8">
            Opera non trovata.
          </p>
        )}
        {/* PULSANTE TORNA ALLA LISTA — SEMPRE MOSTRATO UNA SOLA VOLTA */}
        <div className="flex justify-center mt-10">
          <button
            onClick={() => navigate("/listopere")}
            className="text-blue-600 hover:underline font-medium text-lg"
          >
            ← Torna alla lista
          </button>
        </div>
      </div>
    </div>
  );
}

export default OperaDetail;
