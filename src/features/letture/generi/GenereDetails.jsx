import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "../../../components/Navbar";
import Book from "../../../components/Book";
import { secureFetch } from "../../../utils/secureFetch";

function GenereDetails() {
  const { id_genere } = useParams();
  const navigate = useNavigate();

  const [opere, setOpere] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [genereName, setGenereName] = useState("");
  const [user, setUser] = useState(null);

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

        const resGenere = await secureFetch(
          `${import.meta.env.VITE_API_BASE_URL}/genere/${id_genere}`,
          {},
          navigate
        );

        if (resGenere && resGenere.ok) {
          const dataGenere = await resGenere.json();
          setGenereName(dataGenere.nome_genere);
        } else {
          setError("Impossibile trovare il genere selezionato.");
          setLoading(false);
          return;
        }

        const response = await secureFetch(
          `${import.meta.env.VITE_API_BASE_URL}/opere/genere/${id_genere}`,
          {},
          navigate
        );

        if (response) {
          if (response.ok) {
            const dataOpere = await response.json();
            setOpere(dataOpere);
          } else if (response.status === 404) {
            setOpere([]);
          } else {
            setError("Errore tecnico durante il recupero delle opere.");
          }
        }
      } catch (err) {
        setError("Errore di connessione al server.");
      } finally {
        setLoading(false);
      }
    };

    if (id_genere) loadData();
  }, [id_genere, navigate]);

  const handleUpdate = () => navigate(`/updategenere/${id_genere}`);

  const handleDeleteGenere = async () => {
    if (opere.length > 0) {
      alert("Impossibile eliminare il genere: sono presenti opere collegate.");
      return;
    }

    const confirmDelete = window.confirm(
      "Sei sicuro di voler eliminare definitivamente questo genere?"
    );
    if (!confirmDelete) return;

    const response = await secureFetch(
      `${import.meta.env.VITE_API_BASE_URL}/genere/${id_genere}`,
      { method: "DELETE" },
      navigate
    );

    if (response && response.ok) {
      navigate("/ListGeneri");
    } else {
      alert("Errore durante l'eliminazione.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar setUser={setUser} setError={setError} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* HEADER BENTO */}
        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-gray-200/50 border border-gray-100 mb-10 transition-all">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] bg-gray-50 px-3 py-1 rounded-full">
                Categoria / Genere
              </span>
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 mt-4 tracking-tight">
                {loading ? "..." : genereName}
              </h1>
            </div>

            {user && user.editor === true && (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleUpdate}
                  className="px-8 py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-100 active:scale-95"
                >
                  Modifica
                </button>
                <button
                  onClick={handleDeleteGenere}
                  className="px-8 py-4 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-all font-black text-xs uppercase tracking-widest shadow-lg shadow-red-100 active:scale-95"
                >
                  Elimina
                </button>
              </div>
            )}
          </div>
        </div>

        {/* FEEDBACK ERRORI */}
        {error && (
          <div className="bg-red-50 text-red-600 p-6 rounded-4xl] border border-red-100 text-center font-black uppercase text-xs tracking-widest mb-10 animate-shake">
            ⚠️ {error}
          </div>
        )}

        {/* TITOLO SEZIONE GRID */}
        <div className="flex items-center gap-4 mb-8 ml-4">
          <h2 className="text-xl font-black text-gray-800 uppercase tracking-tighter">
            Opere Associate
          </h2>
          <div className="h-0.5 flex-1 bg-gray-100"></div>
          <span className="bg-white border border-gray-100 text-gray-400 px-4 py-1 rounded-full text-xs font-black">
            {opere.length} RISULTATI
          </span>
        </div>

        {/* LISTA OPERE GRID */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-72 bg-gray-100 rounded-4xl] animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {opere.map((opera) => (
              <Link 
                key={opera.id_opera} 
                to={`/opere/${opera.id_opera}`}
                className="transition-all duration-300 hover:scale-[1.03] active:scale-95"
              >
                <Book
                  title={opera.titolo}
                  author={opera.autori}
                  anno={opera.anno_pubblicazione}
                  stato_opera={opera.stato_opera}
                  serie={opera.serie}
                />
              </Link>
            ))}
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && opere.length === 0 && !error && (
          <div className="text-center py-24 bg-white rounded-[3rem] border-4 border-dashed border-gray-50 flex flex-col items-center">
            <span className="text-6xl mb-6 opacity-20">📂</span>
            <p className="text-gray-400 font-black uppercase tracking-[0.2em] text-sm max-w-xs leading-relaxed">
              Nessuna opera trovata per questa categoria
            </p>
          </div>
        )}

        {/* FOOTER NAVIGATION */}
        <div className="mt-20 flex justify-center">
          <button
            onClick={() => navigate("/ListGeneri")}
            className="group flex items-center gap-3 px-10 py-5 bg-white border-2 border-gray-100 text-gray-400 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:border-blue-600 hover:text-blue-600 transition-all shadow-sm"
          >
            <span className="transition-transform group-hover:-translate-x-2">←</span>
            Lista Generi
          </button>
        </div>
      </div>
    </div>
  );
}

export default GenereDetails;