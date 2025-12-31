import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "../../../components/Navbar";
import Book from "../../../components/Book";
import { secureFetch } from "../../../utils/secureFetch";

function AutoreDetails() {
  const { id_autore } = useParams();
  const navigate = useNavigate();

  const [opere, setOpere] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [autoreName, setAutoreName] = useState("");
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

        const resAutore = await secureFetch(
          `${import.meta.env.VITE_API_BASE_URL}/autori/${id_autore}`,
          {},
          navigate
        );

        if (resAutore && resAutore.ok) {
          const dataAutore = await resAutore.json();
          setAutoreName(dataAutore.nome_autore);
        } else {
          setError("Impossibile trovare l'autore.");
          setLoading(false);
          return;
        }

        const response = await secureFetch(
          `${import.meta.env.VITE_API_BASE_URL}/opere/autore/${id_autore}`,
          {},
          navigate
        );

        if (response) {
          if (response.ok) {
            const dataOpere = await response.json();
            setOpere(dataOpere);
          } else if (response.status === 404) {
            setOpere([]);
          }
        }
      } catch (err) {
        setError("Errore durante il caricamento.");
      } finally {
        setLoading(false);
      }
    };
    if (id_autore) loadData();
  }, [id_autore, navigate]);

  const handleUpdate = () => navigate(`/updateautore/${id_autore}`);

  const handleDeleteAutore = async () => {
    if (opere.length > 0) {
      alert("Impossibile eliminare l'autore: contiene opere collegate.");
      return;
    }

    const confirmDelete = window.confirm("Sei sicuro di voler eliminare questo autore?");
    if (!confirmDelete) return;

    const response = await secureFetch(
      `${import.meta.env.VITE_API_BASE_URL}/autori/${id_autore}`,
      { method: "DELETE" },
      navigate
    );

    if (response && response.ok) {
      navigate("/ListAutori");
    } else {
      alert("Errore durante l'eliminazione.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar setUser={setUser} setError={setError} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* HEADER BENTO - AUTORE */}
        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-gray-200/50 border border-gray-100 mb-10 overflow-hidden relative">
          {/* Decorazione astratta sullo sfondo */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full -mr-16 -mt-16 z-0"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] bg-blue-50 px-4 py-1.5 rounded-full">
                Profilo Creatore
              </span>
              <h1 className="text-4xl md:text-6xl font-black text-gray-900 mt-4 tracking-tight">
                {loading ? "..." : autoreName}
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
                  onClick={handleDeleteAutore}
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
          <div className="bg-red-50 text-red-600 p-6 rounded-4xl] border border-red-100 text-center font-black uppercase text-xs tracking-widest mb-10">
            ⚠️ {error}
          </div>
        )}

        {/* TITOLO SEZIONE GRID */}
        <div className="flex items-center gap-4 mb-10 ml-4">
          <h2 className="text-xl font-black text-gray-800 uppercase tracking-tighter italic">
            Bibliografia ({opere.length})
          </h2>
          <div className="h-0.5 flex-1 bg-gray-100"></div>
        </div>

        {/* GRID OPERE */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-72 bg-gray-100 rounded-[2.5rem] animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {opere.map((opera) => (
              <Link 
                key={opera.id_opera} 
                to={`/opere/${opera.id_opera}`}
                className="transition-all duration-300 hover:-translate-y-2"
              >
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
          <div className="text-center py-20 bg-white rounded-[3rem] border-4 border-dashed border-gray-100 flex flex-col items-center">
            <span className="text-6xl mb-4 grayscale opacity-30">✍️</span>
            <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-sm">
              Nessuna opera registrata per questo autore
            </p>
          </div>
        )}

        {/* TORNA INDIETRO */}
        <div className="mt-20 flex justify-center">
          <button
            onClick={() => navigate("/listautori")}
            className="group flex items-center gap-3 px-10 py-5 bg-white border-2 border-gray-100 text-gray-400 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:border-blue-600 hover:text-blue-600 transition-all shadow-sm"
          >
            <span className="transition-transform group-hover:-translate-x-2">←</span>
            Torna all'Indice Autori
          </button>
        </div>
      </div>
    </div>
  );
}

export default AutoreDetails;