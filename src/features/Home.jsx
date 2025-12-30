import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Book from "../components/Book";
import { secureFetch } from "../utils/secureFetch";

function Home() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Stati per i dati generali
  const [books, setBooks] = useState([]);
  const [autori, setAutori] = useState([]);
  const [serie, setSerie] = useState([]);

  // Stato per le ultime letture personali
  const [ultimeLetture, setUltimeLetture] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getRandomElements = (array, n) => {
    return [...array].sort(() => 0.5 - Math.random()).slice(0, n);
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setError("");

      try {
        // 1. Recupero Profilo Utente per ottenere l'ID
        const resUser = await secureFetch(
          `${import.meta.env.VITE_API_BASE_URL}/users/profile`,
          { method: "GET" },
          navigate
        );

        let currentUserId = null;
        if (resUser && resUser.ok) {
          const userData = await resUser.json();
          currentUserId = userData.id || userData.id_utente;
        }

        // 2. Chiamate parallele (Opere, Autori, Serie + Letture se abbiamo l'ID)
        const fetchPromises = [
          secureFetch(
            `${import.meta.env.VITE_API_BASE_URL}/opere`,
            {},
            navigate
          ),
          secureFetch(
            `${import.meta.env.VITE_API_BASE_URL}/autori`,
            {},
            navigate
          ),
          secureFetch(
            `${import.meta.env.VITE_API_BASE_URL}/serie`,
            {},
            navigate
          ),
        ];

        if (currentUserId) {
          fetchPromises.push(
            secureFetch(
              `${
                import.meta.env.VITE_API_BASE_URL
              }/letture/utente/${currentUserId}`,
              {},
              navigate
            )
          );
        }

        const responses = await Promise.all(fetchPromises);

        // Assegnazione dati generali
        if (responses[0]?.ok) setBooks(await responses[0].json());
        if (responses[1]?.ok) setAutori(await responses[1].json());
        if (responses[2]?.ok) setSerie(await responses[2].json());

        // Assegnazione Ultime Letture (Ultime 5)
        if (currentUserId && responses[3]?.ok) {
          const dataLetture = await responses[3].json();
          // Prendiamo le ultime 5 (assumendo che l'API le restituisca dalla più recente o ordinandole noi)
          setUltimeLetture(dataLetture.slice(0, 5));
        }
      } catch (err) {
        setError("Errore di connessione al server.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar setError={setError} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Intestazione */}
        <div className="bg-white p-8 rounded-xl shadow-xl text-center mb-10 border-t-4 border-blue-600">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            👋 Benvenuto nella tua Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Gestisci le tue opere, gli autori e le serie preferite.
          </p>
        </div>

        {/* BOX INVITO EDITOR */}
        {!user.editor && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 mb-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="text-left">
              <h3 className="text-xl font-bold text-indigo-900 mb-1">
                🚀 Aiutaci a far crescere il progetto!
              </h3>
              <p className="text-indigo-700">
                Non trovi l'opera che cerchi? Diventa un <strong>Editor</strong>{" "}
                per avere i permessi di
                <span className="text-green-700"> inserire</span>,
                <span style={{ color: "blue" }}> modificare</span> o
                <span className="text-red-700"> eliminare</span> opere, serie,
                generi e autori.
              </p>
            </div>
            <button
              onClick={() => navigate("/profile")}
              className="shrink-0 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              Fai la richiesta nel Profilo
            </button>
          </div>
        )}

        {/* GUIDA RAPIDA ALL'USO */}
        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            📖 Guida rapida alla Biblioteca
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            {/* Colonna: Creazione Opere */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-blue-600 flex items-center gap-2">
                ✨ Come inserire una nuova Opera
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Per mantenere i dati puliti, un'opera può essere creata solo se
                i suoi "mattoncini" esistono già. Segui questo ordine:
              </p>
              <ol className="list-decimal list-inside text-gray-700 text-sm space-y-2 ml-2">
                <li>
                  Controlla se <strong>Autore</strong> e <strong>Genere</strong>{" "}
                  sono già presenti nelle rispettive liste.
                </li>
                <li>
                  Se mancano,{" "}
                  <span className="text-green-600 font-semibold">creali</span>{" "}
                  prima di procedere.
                </li>
                <li>
                  Controlla se l'opera fa parte di una <strong>Serie</strong>{" "}
                  (facoltativo).
                </li>
                <li>
                  Infine, vai su{" "}
                  <span className="font-semibold text-gray-900">
                    Nuova Opera
                  </span>{" "}
                  e compila i campi.
                </li>
              </ol>
              <p className="text-xs italic text-gray-500">
                Nota: Non puoi creare un'opera senza almeno un autore e un
                genere associati!
              </p>
            </div>

            {/* Colonna: Preferiti e Biblioteca */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-orange-600 flex items-center gap-2">
                📚 Gestire la tua Biblioteca
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Vuoi tenere traccia di quello che leggi o dei tuoi libri
                preferiti? Hai due strade semplicissime:
              </p>
              <ul className="list-disc list-inside text-gray-700 text-sm space-y-3 ml-2">
                <li>
                  <strong>Dalla Biblioteca:</strong> Esplora le opere esistenti
                  e clicca sul tasto
                  <span className="mx-1 px-2 py-0.5 bg-green-100 text-green-700 rounded font-bold">
                    + Diario
                  </span>
                  per aggiungerla alle tue letture.
                </li>
                <li>
                  <strong>Inserimento Manuale:</strong> Se l'opera non esiste
                  ancora nel nostro database, puoi
                  <span className="text-blue-600 font-semibold underline">
                    {" "}
                    aggiungerla tu stesso
                  </span>{" "}
                  (se sei un Editor) e poi collegarla al tuo diario.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {loading && (
          <p className="text-center text-lg text-gray-600">
            Caricamento in corso...
          </p>
        )}
        {error && (
          <div className="text-center text-red-600 font-medium my-6">
            {error}
          </div>
        )}

        {/* --- SEZIONE: LE MIE ULTIME LETTURE --- */}
        {!loading && (
          <section className="mb-12 bg-blue-900 p-6 rounded-2xl shadow-lg text-white">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                📖 Ultime Letture
              </h2>
              {ultimeLetture.length > 0 && (
                <Link
                  to="/listletture"
                  className="text-sm bg-white/20 hover:bg-white/30 px-4 py-1 rounded-full transition-colors"
                >
                  Vedi Diario
                </Link>
              )}
            </div>

            {ultimeLetture.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                {ultimeLetture.map((l) => (
                  <Link
                    key={l.id_lettura}
                    to={`/lettura/${l.id_lettura}`}
                    className="bg-white/10 hover:bg-white/20 p-4 rounded-xl border border-white/10 transition-all group"
                  >
                    <p className="font-bold truncate text-sm group-hover:text-indigo-200 transition-colors">
                      {l.opere?.titolo}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[10px] uppercase font-bold text-indigo-300">
                        {l.stato?.replace("_", " ")}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {l.capitolo
                          ? `Cap. ${l.capitolo}`
                          : `Vol. ${l.volume || "-"}`}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              /* --- STATO VUOTO --- */
              <div className="text-center py-6 bg-white/5 rounded-xl border border-dashed border-white/20">
                <p className="text-indigo-200 mb-4">
                  Non hai ancora registrato nessuna lettura nel tuo diario.
                </p>
                <Link
                  to="/createlettura"
                  className="inline-block bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-md"
                >
                  + Aggiungi la tua prima lettura
                </Link>
              </div>
            )}
          </section>
        )}

        {/* --- SEZIONE SCOPRI OPERE (RANDOM) --- */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6 border-b pb-2">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              🎲 Scopri Opere
            </h2>
            {/* Pulsante opzionale per rimescolare i suggerimenti */}
            <Link
              to="/listopere"
              className="text-sm text-indigo-600 hover:underline font-medium"
            >
              Vedi tutte
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {books.length > 0
              ? getRandomElements(books, 4).map((book) => (
                  <Link key={book.id_opera} to={`/opere/${book.id_opera}`}>
                    <Book
                      title={book.titolo}
                      author={book.autori}
                      anno={book.anno_pubblicazione}
                      stato_opera={book.stato_opera}
                      serie={book.serie}
                    />
                  </Link>
                ))
              : !loading && (
                  <p className="col-span-full text-center text-gray-500">
                    Nessuna opera disponibile.
                  </p>
                )}
          </div>
        </section>

        {/* --- SEZIONE SCOPRI AUTORI --- */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6 border-b pb-2">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              ✍️ Autori Consigliati
            </h2>
            <Link
              to="/listautori"
              className="text-sm text-indigo-600 hover:underline font-medium"
            >
              Vedi tutti
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {autori.length > 0
              ? getRandomElements(autori, 6).map((autore) => (
                  <Link
                    key={autore.id_autore}
                    to={`/autore/${autore.id_autore}`}
                    className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all text-center border border-gray-100 hover:border-indigo-200"
                  >
                    <p className="font-semibold text-indigo-600 truncate">
                      {autore.nome_autore}
                    </p>
                  </Link>
                ))
              : !loading && (
                  <p className="text-gray-500 italic">Nessun autore trovato.</p>
                )}
          </div>
        </section>

        {/* --- SEZIONE SCOPRI SERIE --- */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6 border-b pb-2">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              📺 Esplora Serie
            </h2>
            <Link
              to="/listserie"
              className="text-sm text-indigo-600 hover:underline font-medium"
            >
              Vedi tutte
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {serie.length > 0
              ? getRandomElements(serie, 5).map((s) => (
                  <Link
                    key={s.id_serie}
                    to={`/serie/${s.id_serie}`}
                    className="bg-white p-4 rounded-lg border-l-4 border-indigo-500 shadow-sm hover:bg-indigo-50 transition-colors group"
                  >
                    <p className="font-bold text-gray-800 group-hover:text-indigo-700 transition-colors">
                      {s.nome_serie}
                    </p>
                    <p className="text-[10px] text-gray-400 uppercase mt-1 tracking-wider font-semibold">
                      Catalogo Serie
                    </p>
                  </Link>
                ))
              : !loading && (
                  <p className="text-gray-500 italic">Nessuna serie trovata.</p>
                )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Home;
