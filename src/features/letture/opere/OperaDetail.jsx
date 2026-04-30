import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "../../../components/Navbar";
import Button from "../../../components/ui/Button";
import { secureFetch } from "../../../utils/secureFetch";
import { useAuth } from "../../../context/AuthContext";

function OperaDetail() {
  const { id_opera } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [opera, setOpera] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id_opera]);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError("");
      try {
        // Usa /full per avere autori/generi/serie già aggregati + edizioni embedded
        const response = await secureFetch(
          `${import.meta.env.VITE_API_BASE_URL}/opere/${id_opera}/full`,
          { method: "GET" },
          navigate
        );
        if (response?.ok) setOpera(await response.json());
        else setError("Errore nel caricamento dell'opera");
      } catch (err) {
        setError("Errore tecnico durante il caricamento");
      } finally {
        setLoading(false);
      }
    };
    if (id_opera) fetchDetail();
  }, [id_opera, navigate]);

  const autoriProcessati = opera?.autori
    ? opera.autori.split(",").map((nome, index) => ({
        nome: nome.trim(),
        id: opera.autori_ids ? opera.autori_ids[index] : null,
      }))
    : [];

  const generiProcessati = opera?.generi
    ? opera.generi.split(",").map((nome, index) => ({
        nome: nome.trim(),
        id: opera.generi_ids ? opera.generi_ids[index] : null,
      }))
    : [];

  const isFinito = opera?.stato_opera?.toLowerCase() === "finito";
  const borderClass = isFinito ? "border-r-gray-300" : "border-r-green-500";
  const headerBg = isFinito ? "bg-gray-50" : "bg-blue-50/50";

  const handleDelete = async () => {
    if (!window.confirm("Sei sicuro di voler eliminare questa opera?")) return;
    const response = await secureFetch(
      `${import.meta.env.VITE_API_BASE_URL}/opere/${id_opera}`,
      { method: "DELETE" },
      navigate
    );
    if (response?.ok) navigate("/listopere");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 pt-6 pb-24 md:py-10">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-4 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-6 rounded-2xl border border-red-100 text-center">
            <p className="text-red-600 font-black uppercase tracking-widest text-sm">{error}</p>
          </div>
        ) : (
          opera && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 border-r-[6px] ${borderClass}`}
            >
              {/* HEADER */}
              <div className={`${headerBg} p-6 md:p-8 border-b border-gray-100 flex flex-col gap-5`}>
                <div className="flex flex-col md:flex-row gap-5 w-full">
                  {opera.copertina_principale && (
                    <img
                      src={opera.copertina_principale}
                      alt="copertina"
                      className="w-24 h-36 md:w-28 md:h-40 object-cover rounded shadow-sm shrink-0"
                    />
                  )}
                  <div className="flex-1 w-full">
                    <span className="text-[9px] font-black bg-gray-900 text-white px-2 py-1 rounded uppercase tracking-[0.2em] mb-3 inline-block">
                      {opera.tipo || "Opera"}
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight tracking-tight wrap-break-words">
                      {opera.titolo}
                    </h1>
                    {opera.numero_volume && (
                      <p className="text-xs font-bold text-gray-500 mt-1">
                        Volume {opera.numero_volume}
                        {opera.serie && ` • ${opera.serie}`}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      {autoriProcessati.map((a, i) => (
                        <Link
                          key={i}
                          to={a.id ? `/autore/${a.id}` : "#"}
                          className="text-blue-600 font-bold hover:text-blue-800 text-sm uppercase tracking-wide"
                        >
                          {a.nome}
                          {i < autoriProcessati.length - 1 && (
                            <span className="text-gray-400 ml-1.5 font-normal">•</span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 w-full mt-2 border-t border-gray-200/50 pt-4 md:border-t-0 md:pt-0">
                  <Button
                    variant="success"
                    onClick={() =>
                      navigate("/createlettura", {
                        state: { id_opera, titolo: opera.titolo },
                      })
                    }
                    className="flex-1"
                  >
                    + Diario
                  </Button>
                  {user?.editor && (
                    <>
                      <Button variant="outlineBlue" to={`/updateopera/${id_opera}`} className="flex-1">
                        Modifica
                      </Button>
                      <Button variant="danger" onClick={handleDelete} className="flex-1">
                        Elimina
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* BODY */}
              <div className="p-6 md:p-8 bg-white">
                {/* Meta info */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-5 mb-8 border-b border-gray-100 pb-6">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                      Edizioni
                    </p>
                    <p className="text-sm sm:text-base font-bold text-gray-800">
                      {opera.edizioni_count || 0}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                      Prima pubblicazione
                    </p>
                    <p className="text-sm sm:text-base font-bold text-gray-800">
                      {opera.prima_edizione_anno || "—"}
                    </p>
                  </div>
                  <div className="space-y-1 col-span-2 md:col-span-1">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                      Stato pubblicazione
                    </p>
                    <p
                      className={`text-sm sm:text-base font-black uppercase tracking-wide ${
                        isFinito ? "text-gray-400" : "text-green-600"
                      }`}
                    >
                      {opera.stato_opera || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Generi & Serie */}
                <div className="flex flex-col gap-4 mb-8">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2.5">
                      Generi
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {generiProcessati.length > 0 ? (
                        generiProcessati.map((g, i) => (
                          <Link
                            key={i}
                            to={g.id ? `/genere/${g.id}` : "#"}
                            className="px-2 py-1 bg-white border border-gray-200 rounded-md text-[9px] font-black text-blue-600 hover:border-blue-400 uppercase tracking-wide"
                          >
                            {g.nome}
                          </Link>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400 font-bold italic">Nessun genere</span>
                      )}
                    </div>
                  </div>

                  {opera.serie && (
                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                      <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1.5">
                        Serie
                      </p>
                      <Link
                        to={`/serie/${opera.id_serie}`}
                        className="text-base sm:text-lg font-black text-blue-900 hover:text-blue-600 hover:underline line-clamp-2"
                      >
                        {opera.serie}
                      </Link>
                    </div>
                  )}
                </div>

                {/* EDIZIONI */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                      Edizioni ({opera.edizioni?.length || 0})
                    </p>
                    {user?.editor && (
                      <Link
                        to="/import-google"
                        className="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest"
                      >
                        + Importa edizione
                      </Link>
                    )}
                  </div>
                  {opera.edizioni && opera.edizioni.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {opera.edizioni.map((e) => (
                        <div
                          key={e.id_edizione}
                          className="flex gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100"
                        >
                          {e.copertina_url && (
                            <img
                              src={e.copertina_url}
                              alt="cover"
                              className="w-12 h-16 object-cover rounded shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-gray-800 line-clamp-1">
                              {e.editore || "Editore N/A"}
                            </p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                              {e.anno_pubblicazione || "—"}
                              {e.numero_pagine && ` • ${e.numero_pagine} pag`}
                              {e.lingua && ` • ${e.lingua}`}
                            </p>
                            {e.isbn_issn && (
                              <p className="text-[9px] font-mono text-gray-400 mt-1">
                                ISBN {e.isbn_issn}
                              </p>
                            )}
                            {e.traduttore && (
                              <p className="text-[10px] font-bold text-purple-600 mt-1">
                                Trad: {e.traduttore}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">
                      Nessuna edizione registrata. Importane una da Google Books.
                    </p>
                  )}
                </div>

                {/* Descrizione */}
                {opera.descrizione_opera && (
                  <div className="space-y-2 pt-2">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                      Sinossi
                    </p>
                    <p className="text-gray-700 leading-relaxed text-sm italic font-serif">
                      "{opera.descrizione_opera}"
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )
        )}

        <div className="flex justify-center mt-8">
          <button
            onClick={() => navigate("/listopere")}
            className="text-gray-400 hover:text-blue-600 font-black text-[10px] uppercase tracking-[0.2em] py-2"
          >
            ← Torna alla lista
          </button>
        </div>
      </div>
    </div>
  );
}

export default OperaDetail;
