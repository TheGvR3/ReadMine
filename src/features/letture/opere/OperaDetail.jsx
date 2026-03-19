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
    const fetchOperaDetail = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await secureFetch(
          `${import.meta.env.VITE_API_BASE_URL}/opere/${id_opera}`,
          { method: "GET" },
          navigate,
        );
        if (response?.ok) {
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
      navigate,
    );
    if (response?.ok) {
      navigate("/listopere");
    }
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
            <p className="text-red-600 font-black uppercase tracking-widest text-sm">
              {error}
            </p>
          </div>
        ) : (
          opera && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              // Bordo e arrotondamenti ridotti (da rounded-3xl a rounded-2xl)
              className={`bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 border-r-[6px] ${borderClass}`}
            >
              {/* --- HEADER (COPERTINA) --- */}
              {/* Padding ridotto (da p-12 a p-6/p-8) */}
              <div
                className={`${headerBg} p-6 md:p-8 border-b border-gray-100 flex flex-col gap-5`}
              >
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 w-full">
                  <div className="flex-1 w-full">
                    {/* Badge più piccolo */}
                    <span className="text-[9px] font-black bg-gray-900 text-white px-2 py-1 rounded uppercase tracking-[0.2em] mb-3 inline-block">
                      {opera.tipo || "Opera"}
                    </span>

                    {/* Titolo rimpicciolito (da text-5xl a text-2xl/3xl) */}
                    <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight tracking-tight wrap-break-words">
                      {opera.titolo}
                    </h1>

                    {/* Autori rimpiccioliti (da text-lg a text-sm) */}
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      {autoriProcessati.map((a, i) => (
                        <Link
                          key={i}
                          to={a.id ? `/autore/${a.id}` : "#"}
                          className="text-blue-600 font-bold hover:text-blue-800 transition-colors text-sm uppercase tracking-wide"
                        >
                          {a.nome}
                          {i < autoriProcessati.length - 1 && (
                            <span className="text-gray-400 ml-1.5 font-normal">
                              •
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                {/* AZIONI BOTTONI - Tutti ridotti e messi in riga orizzontale compatta */}
                <div className="flex flex-wrap gap-2 w-full mt-2 border-t border-gray-200/50 pt-4 md:border-t-0 md:pt-0">
                  <Button
                    variant="success"
                    onClick={() =>
                      navigate("/createlettura", {
                        id_opera,
                        titolo: opera.titolo,
                        editore: opera.editore,
                      })
                    }
                    className="flex-1"
                  >
                    + Diario
                  </Button>
                  {user?.editor && (
                    <>
                      <Button
                        variant="outlineBlue"
                        to={`/updateopera/${id_opera}`}
                        className="flex-1"
                      >
                        Modifica
                      </Button>

                      <Button
                        variant="danger"
                        onClick={handleDelete}
                        className="flex-1"
                      >
                        Elimina
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* --- CORPO DETTAGLI --- */}
              {/* Padding ridotto (da p-12 a p-6/p-8) */}
              <div className="p-6 md:p-8 bg-white">
                {/* Meta Info: 2 colonne su mobile compattissime */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-5 mb-8 border-b border-gray-100 pb-6">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                      Editore
                    </p>
                    {/* Testi da text-lg a text-sm/base */}
                    <p className="text-sm sm:text-base font-bold text-gray-800 line-clamp-2">
                      {opera.editore || "N/A"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                      Anno
                    </p>
                    <p className="text-sm sm:text-base font-bold text-gray-800">
                      {opera.anno_pubblicazione || "N/A"}
                    </p>
                  </div>
                  <div className="space-y-1 col-span-2 md:col-span-1">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                      Stato
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

                {/* Generi & Serie - Blocchi più snelli e meno padding */}
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
                            // Badge generi rimpiccioliti (text-[9px])
                            className="px-2 py-1 bg-white border border-gray-200 rounded-md text-[9px] font-black text-blue-600 hover:border-blue-400 hover:shadow-sm transition-all uppercase tracking-wide"
                          >
                            {g.nome}
                          </Link>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400 font-bold italic">
                          Nessun genere
                        </span>
                      )}
                    </div>
                  </div>

                  {opera.serie && (
                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                      <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1.5">
                        Serie
                      </p>
                      {/* Testo serie da text-xl a text-base */}
                      <Link
                        to={`/serie/${opera.id_serie}`}
                        className="text-base sm:text-lg font-black text-blue-900 hover:text-blue-600 hover:underline transition-colors line-clamp-2"
                      >
                        {opera.serie}
                      </Link>
                    </div>
                  )}
                </div>

                {/* Descrizione */}
                {opera.descrizione && (
                  <div className="space-y-2 pt-2">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                      Sinossi
                    </p>
                    {/* Testo sinossi da text-lg a text-sm */}
                    <p className="text-gray-700 leading-relaxed text-sm italic font-serif">
                      "{opera.descrizione}"
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )
        )}

        {/* Bottone Indietro */}
        <div className="flex justify-center mt-8">
          <button
            onClick={() => navigate("/listopere")}
            className="text-gray-400 hover:text-blue-600 font-black text-[10px] uppercase tracking-[0.2em] transition-colors py-2"
          >
            ← Torna alla lista
          </button>
        </div>
      </div>
    </div>
  );
}

export default OperaDetail;
