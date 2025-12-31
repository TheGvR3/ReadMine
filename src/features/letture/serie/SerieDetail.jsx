import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "../../../components/Navbar";
import Book from "../../../components/Book";
import { secureFetch } from "../../../utils/secureFetch";

function SerieDetail() {
  const { id_serie } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [opere, setOpere] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [serieName, setSerieName] = useState("");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");
      try {
        const resUser = await secureFetch(
          `${import.meta.env.VITE_API_BASE_URL}/users/profile`,
          {},
          navigate
        );
        if (resUser && resUser.ok) {
          const userData = await resUser.json();
          setUser(userData);
        }

        const response = await secureFetch(
          `${import.meta.env.VITE_API_BASE_URL}/opere/serie/${id_serie}`,
          {},
          navigate
        );

        if (response) {
          if (response.ok) {
            const data = await response.json();
            setOpere(data);
            setSerieName(data[0]?.serie || "Dettaglio Serie");
          } else if (response.status === 404) {
            setOpere([]);
          } else {
            setError("Impossibile caricare le opere.");
          }
        }
      } catch (err) {
        setError("Errore tecnico durante il caricamento.");
      } finally {
        setLoading(false);
      }
    };
    if (id_serie) loadData();
  }, [id_serie, navigate]);

  const handleUpdate = () => navigate(`/updateserie/${id_serie}`);

  const handleDeleteSerie = async () => {
    if (opere.length > 0) {
      alert("Impossibile eliminare la serie: contiene opere collegate.");
      return;
    }

    const confirmDelete = window.confirm(
      "Sei sicuro di voler eliminare questa serie? L'azione è irreversibile."
    );

    if (!confirmDelete) return;

    const response = await secureFetch(
      `${import.meta.env.VITE_API_BASE_URL}/serie/${id_serie}`,
      { method: "DELETE" },
      navigate
    );

    if (response && response.ok) {
      navigate("/ListSerie");
    } else {
      const err = await response.json().catch(() => ({}));
      setError(err.error || "Errore durante l'eliminazione.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar setUser={setUser} setError={setError} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* BENTO HEADER */}
        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-gray-200/50 border border-gray-100 mb-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">
                Collezione / Serie
              </span>
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 mt-2 tracking-tight">
                {loading ? "..." : serieName}
              </h1>
            </div>

            {user && user.editor === true && (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleUpdate}
                  className="px-8 py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-100"
                >
                  Modifica
                </button>
                <button
                  onClick={handleDeleteSerie}
                  className="px-8 py-4 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-all font-black text-xs uppercase tracking-widest shadow-lg shadow-red-100"
                >
                  Elimina
                </button>
              </div>
            )}
          </div>
        </div>

        {/* SECTION TITLE */}
        <div className="flex items-center gap-4 mb-8 ml-4">
          <h2 className="text-xl font-black text-gray-800 uppercase tracking-tighter">
            Opere Disponibili
          </h2>
          <div className="h-0.5 flex-1 bg-gray-100"></div>
          <span className="bg-gray-200 text-gray-600 px-4 py-1 rounded-full text-xs font-bold">
            {opere.length}
          </span>
        </div>

        {/* GRID OPERE */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
             {[1,2,3].map(i => <div key={i} className="h-64 bg-gray-200 rounded-4xl]"></div>)}
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-6 rounded-4xl] border border-red-100 text-center font-bold uppercase text-xs tracking-widest">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {opere.map((opera) => (
              <Link key={opera.id_opera} to={`/opere/${opera.id_opera}`} className="transition-transform hover:scale-[1.02] active:scale-95">
                <Book
                  title={opera.titolo}
                  author={opera.autori}
                  anno={opera.anno_pubblicazione}
                  stato_opera={opera.stato_opera}
                  tipo={opera.tipo}
                />
              </Link>
            ))}
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && opere.length === 0 && !error && (
          <div className="text-center py-20 bg-white rounded-[3rem] border-4 border-dashed border-gray-100">
            <div className="text-5xl mb-4">📚</div>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">
              Nessuna opera collegata a questa serie.
            </p>
          </div>
        )}

        {/* BACK ACTION */}
        <div className="mt-16 text-center">
          <button
            onClick={() => navigate("/listserie")}
            className="group flex items-center gap-3 px-10 py-5 bg-white border-2 border-gray-100 text-gray-400 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:border-blue-600 hover:text-blue-600 transition-all shadow-sm"
          >
            <span className="transition-transform group-hover:-translate-x-2">←</span>
            Torna alla lista completa
          </button>
        </div>
      </div>
    </div>
  );
}

export default SerieDetail;