import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "../../../components/Navbar";
import { secureFetch } from "../../../utils/secureFetch";

function OperaDetail() {
  const { id_opera } = useParams();
  const navigate = useNavigate();

  const [opera, setOpera] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchOperaDetail = async () => {
      setLoading(true);
      setError("");
      try {
        const resUser = await secureFetch(
          `${import.meta.env.VITE_API_BASE_URL}/users/profile`,
          {},
          navigate
        );
        if (resUser && resUser.ok) {
          setUser(await resUser.json());
        }

        const response = await secureFetch(
          `${import.meta.env.VITE_API_BASE_URL}/opere/${id_opera}`,
          { method: "GET" },
          navigate
        );
        if (response && response.ok) {
          setOpera(await response.json());
        } else {
          setError("Errore nel caricamento dell'opera");
        }
      } catch (err) {
        setError("Errore tecnico durante il caricamento");
      } finally {
        setLoading(false);
      }
    };
    if (id_opera) fetchOperaDetail();
  }, [id_opera, navigate]);

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
    opera?.stato_opera === "finito"
      ? "border-r-gray-300"
      : "border-r-green-500";
  const headerBg =
    opera?.stato_opera === "finito" ? "bg-gray-200" : "bg-green-50";

  const handleDelete = async () => {
    if (!window.confirm("Sei sicuro di voler eliminare questa opera?")) return;
    const response = await secureFetch(
      `${import.meta.env.VITE_API_BASE_URL}/opere/${id_opera}`,
      { method: "DELETE" },
      navigate
    );
    if (response?.ok) {
      navigate("/ListOpere");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar setUser={setUser} setError={setError} />

      <div className="max-w-4xl mx-auto px-4 py-12">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-6 rounded-2xl border border-red-100 text-center">
            <p className="text-red-600 font-black uppercase tracking-widest">
              {error}
            </p>
          </div>
        ) : (
          opera && (
            <div
              className={`bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 border-r-8 ${borderClass}`}
            >
              {/* --- HEADER (COPERTINA) --- */}
              <div
                className={`${headerBg} p-8 md:p-12 border-b border-gray-200`}
              >
                <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                  <div className="flex-1">
                    <span className="text-[10px] font-black bg-gray-900 text-white px-3 py-1 rounded uppercase tracking-[0.2em] mb-4 inline-block">
                      {opera.tipo}
                    </span>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-none tracking-tight">
                      {opera.titolo}
                    </h1>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {autoriProcessati.map((a, i) => (
                        <Link
                          key={i}
                          to={`/autore/${a.id}`}
                          className="text-blue-600 font-bold hover:underline text-lg"
                        >
                          {a.nome}
                          {i < autoriProcessati.length - 1 ? " • " : ""}
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* AZIONI */}
                  <div className="flex flex-wrap gap-2 shrink-0">
                    <button
                      onClick={() =>
                        navigate("/createlettura", {
                          state: {
                            id_opera,
                            titolo: opera.titolo,
                            editore: opera.editore,
                          },
                        })
                      }
                      className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-black text-xs uppercase tracking-widest shadow-lg shadow-green-100"
                    >
                      Aggiungi
                    </button>
                    {user?.editor && (
                      <>
                        <button
                          onClick={() => navigate(`/updateopera/${id_opera}`)}
                          className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-100"
                        >
                          Modifica
                        </button>
                        <button
                          onClick={handleDelete}
                          className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-black text-xs uppercase tracking-widest shadow-lg shadow-red-100"
                        >
                          Elimina
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* --- CORPO DETTAGLI --- */}
              <div className="p-8 md:p-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Editore
                    </p>
                    <p className="text-lg font-bold text-gray-800">
                      {opera.editore || "N/A"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Anno Pubblicazione
                    </p>
                    <p className="text-lg font-bold text-gray-800">
                      {opera.anno_pubblicazione || "N/A"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Stato Opera
                    </p>
                    <p
                      className={`text-lg font-black uppercase ${
                        opera.stato_opera === "finito"
                          ? "text-gray-400"
                          : "text-green-600"
                      }`}
                    >
                      {opera.stato_opera}
                    </p>
                  </div>
                </div>

                {/* Generi & Serie */}
                <div className="flex flex-col md:flex-row gap-6 mb-10">
                  <div className="flex-1 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                      Generi
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {generiProcessati.map((g, i) => (
                        <Link
                          key={i}
                          to={`/genere/${g.id}`}
                          className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-black text-blue-600 hover:border-blue-300 transition-colors"
                        >
                          {g.nome.toUpperCase()}
                        </Link>
                      ))}
                    </div>
                  </div>
                  {opera.serie && (
                    <div className="flex-1 bg-blue-50/30 p-6 rounded-2xl border border-blue-50">
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3">
                        Serie
                      </p>
                      <Link
                        to={`/serie/${opera.id_serie}`}
                        className="text-xl font-black text-blue-900 hover:underline"
                      >
                        {opera.serie}
                      </Link>
                    </div>
                  )}
                </div>

                {/* Descrizione */}
                {opera.descrizione && (
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b pb-2">
                      Sinossi / Descrizione
                    </p>
                    <p className="text-gray-700 leading-relaxed text-lg italic font-serif">
                      "{opera.descrizione}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          )
        )}

        <div className="flex justify-center mt-12">
          <button
            onClick={() => navigate("/listopere")}
            className="text-gray-400 hover:text-blue-600 font-black text-xs uppercase tracking-[0.3em] transition-colors"
          >
            ← Torna alla lista
          </button>
        </div>
      </div>
    </div>
  );
}

export default OperaDetail;
