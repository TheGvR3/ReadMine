import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "../../../components/Navbar";
import { secureFetch } from "../../../utils/secureFetch";

function EdizioneDetail() {
  const { id_edizione } = useParams();
  const navigate = useNavigate();

  const [edizione, setEdizione] = useState(null);
  const [opera, setOpera] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [coverErrored, setCoverErrored] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id_edizione]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL;
        const res = await secureFetch(
          `${baseUrl}/edizioni/${id_edizione}`,
          { method: "GET" },
          navigate
        );
        if (!res?.ok) {
          setError("Edizione non trovata");
          return;
        }
        const ediz = await res.json();
        setEdizione(ediz);

        if (ediz?.id_opera) {
          const resOp = await secureFetch(
            `${baseUrl}/opere/${ediz.id_opera}`,
            { method: "GET" },
            navigate
          );
          if (resOp?.ok) setOpera(await resOp.json());
        }
      } catch {
        setError("Errore tecnico durante il caricamento");
      } finally {
        setLoading(false);
      }
    };
    if (id_edizione) load();
  }, [id_edizione, navigate]);

  const showCover = edizione?.copertina_url && !coverErrored;
  const displayName = edizione?.titolo_edizione || opera?.titolo || "Edizione";

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 pt-6 pb-24 md:py-10">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-blue-600" />
          </div>
        ) : error ? (
          <div className="bg-red-50 p-6 rounded-2xl border border-red-100 text-center">
            <p className="text-red-600 font-black uppercase tracking-widest text-sm">
              {error}
            </p>
          </div>
        ) : (
          edizione && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100"
            >
              {/* HEADER — cover centrata grande */}
              <div className="bg-blue-50/50 p-5 sm:p-6 border-b border-gray-100 flex flex-col items-center text-center">
                {showCover ? (
                  <img
                    src={edizione.copertina_url}
                    alt={`Copertina ${displayName}`}
                    onError={() => setCoverErrored(true)}
                    className="w-44 h-64 md:w-52 md:h-72 object-cover rounded-lg shadow-md border border-gray-200 bg-white"
                  />
                ) : (
                  <div className="w-44 h-64 md:w-52 md:h-72 rounded-lg shadow-md border border-gray-200 bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-300">
                    <svg className="w-14 h-14" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 2v8l-3-2-3 2V4h6z" />
                    </svg>
                  </div>
                )}

                <div className="mt-4 w-full">
                  {edizione.numero_volume != null && (
                    <span className="text-[9px] font-black bg-blue-600 text-white px-2 py-1 rounded uppercase tracking-[0.2em] inline-block mb-2">
                      Vol. {edizione.numero_volume}
                    </span>
                  )}
                  <h1 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight tracking-tight wrap-break-words">
                    {displayName}
                  </h1>
                  {opera && (
                    <Link
                      to={`/opere/${opera.id_opera}`}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800 mt-1 uppercase tracking-wider inline-block"
                    >
                      ← {opera.titolo}
                    </Link>
                  )}
                </div>
              </div>

              {/* BODY — sommario generale */}
              <div className="p-5 sm:p-6 space-y-5">
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <div>
                    <dt className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Editore</dt>
                    <dd className="text-sm font-bold text-gray-800 mt-0.5">{edizione.editore || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Anno</dt>
                    <dd className="text-sm font-bold text-gray-800 mt-0.5">{edizione.anno_pubblicazione || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Pagine</dt>
                    <dd className="text-sm font-bold text-gray-800 mt-0.5">{edizione.numero_pagine || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Lingua</dt>
                    <dd className="text-sm font-bold text-gray-800 uppercase mt-0.5">{edizione.lingua || "—"}</dd>
                  </div>
                  {edizione.traduttore && (
                    <div className="col-span-2">
                      <dt className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Traduttore</dt>
                      <dd className="text-sm font-bold text-purple-600 mt-0.5">{edizione.traduttore}</dd>
                    </div>
                  )}
                  {edizione.isbn_issn && (
                    <div className="col-span-2">
                      <dt className="text-[9px] font-black text-gray-400 uppercase tracking-widest">ISBN / ISSN</dt>
                      <dd className="text-sm font-mono text-gray-700 mt-0.5">{edizione.isbn_issn}</dd>
                    </div>
                  )}
                </dl>

                {edizione.google_volume_id && (
                  <a
                    href={`https://books.google.com/books?id=${edizione.google_volume_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center px-4 py-3 bg-blue-50 text-blue-700 border-2 border-blue-200 font-black rounded-xl hover:bg-blue-100 transition-all active:scale-95 text-xs uppercase tracking-wider"
                  >
                    Apri su Google Books ↗
                  </a>
                )}
              </div>
            </motion.div>
          )
        )}

        <div className="flex justify-center mt-8">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-blue-600 font-black text-[10px] uppercase tracking-[0.2em] py-2"
          >
            ← Torna indietro
          </button>
        </div>
      </div>
    </div>
  );
}

export default EdizioneDetail;
