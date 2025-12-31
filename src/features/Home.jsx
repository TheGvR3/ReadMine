import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import GenereCard from "../components/GenereCard";
import SerieCard from "../components/SerieCard";
import AutoreCard from "../components/AutoreCard";
import Book from "../components/Book";
import { secureFetch } from "../utils/secureFetch";

function Home() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [books, setBooks] = useState([]);
  const [autori, setAutori] = useState([]);
  const [serie, setSerie] = useState([]);
  const [generi, setGeneri] = useState([]);
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
        const resUser = await secureFetch(
          `${import.meta.env.VITE_API_BASE_URL}/users/profile`,
          { method: "GET" },
          navigate
        );
        let currentUserId = null;
        if (resUser && resUser.ok) {
          const userData = await resUser.json();
          setUser(userData);
          currentUserId = userData.id || userData.id_utente;
        }

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
          secureFetch(
            `${import.meta.env.VITE_API_BASE_URL}/genere`,
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
        if (responses[0]?.ok) setBooks(await responses[0].json());
        if (responses[1]?.ok) setAutori(await responses[1].json());
        if (responses[2]?.ok) setSerie(await responses[2].json());
        if (responses[3]?.ok) setGeneri(await responses[3].json());
        if (currentUserId && responses[4]?.ok) {
          const dataLetture = await responses[4].json();
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* INTESTAZIONE UNIFORMATA */}
        <div className="bg-white p-6 md:p-10 rounded-xl shadow-md text-center mb-10 border-t-4 border-blue-600">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
            👋 Benvenuto su ReadMine
          </h1>
          <p className="text-base md:text-lg text-gray-600">
            Il tuo spazio personale per gestire letture, autori e collezioni.
          </p>
        </div>

        {/* BOX INVITO EDITOR */}
        {user && !user.editor && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="text-left">
              <h3 className="text-xl font-bold text-blue-900 mb-1">
                🚀 Aiutaci a far crescere il progetto!
              </h3>
              <p className="text-blue-700">
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

        {/* GUIDA GENERALE READMINE (Database & Biblioteca) */}
        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            📖 Guida all'utilizzo di ReadMine
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-left">
            {/* SEZIONE EDITOR: GESTIONE DATABASE */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-blue-600 flex items-center gap-2">
                🛠️ Contribuisci al Database (Editor)
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Per aggiungere nuovi elementi nell'Archivio (Autori, Serie,
                Generi o Opere):
              </p>
              <ul className="space-y-3 text-sm text-gray-700">
                <li>
                  •{" "}
                  <span className="text-green-600 font-bold uppercase">
                    Inserire:
                  </span>{" "}
                  Vai nella sezione desiderata e clicca su "Nuovo". Controlla
                  sempre che non sia già presente per evitare duplicati.
                </li>
                <li>
                  •{" "}
                  <span className="text-blue-600 font-bold uppercase">
                    Modificare:
                  </span>{" "}
                  In caso di errore nei dati, puoi correggere ogni elemento dal
                  suo dettaglio.
                </li>
                <li>
                  •{" "}
                  <span className="text-red-600 font-bold uppercase">
                    Eliminare:
                  </span>{" "}
                  Se un elemento è errato o non più necessario, puoi rimuoverlo
                  definitivamente.
                </li>
              </ul>
              <p className="text-[11px] bg-blue-50 p-2 rounded text-blue-800">
                <strong>Nota Opere:</strong> Titolo, Anno, Tipo, Stato, un
                Autore e un Genere sono <strong>obbligatori</strong>. Lingua,
                Editore e Serie sono opzionali.
              </p>
            </div>

            {/* SEZIONE UTENTE: DIARIO & FILTRI */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-orange-600 flex items-center gap-2">
                📚 Gestisci la tua Biblioteca
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Usa la biblioteca per tenere traccia delle tue letture personali
                e filtrare i tuoi diari:
              </p>
              <div className="space-y-2 text-sm text-gray-700">
                <p>
                  • <strong>Filtri rapidi:</strong> Scegli tra <i>Libri</i>,{" "}
                  <i>Manga & Fumetti</i> o <i>Riviste</i> per vedere solo quel
                  tipo di opere.
                </p>
                <p>
                  •{" "}
                  <span className="text-green-600 font-bold uppercase text-xs">
                    Aggiungi al diario:
                  </span>{" "}
                  Clicca su "Aggiungi" in Biblioteca, sul <strong>"+"</strong>{" "}
                  in lista o su <strong>"+ Diario"</strong> nel dettaglio opera.
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-xs">
                <p className="font-bold text-gray-800 mb-1">Dati Diario:</p>
                <p className="text-gray-600">
                  Obbligatori: <strong>Nome</strong> e <strong>Stato</strong>.
                  <br />
                  Opzionali: Data, Volume, Capitolo, Pagina, Valutazione e Note.
                </p>
              </div>
            </div>
          </div>

          {/* BADGE BETA */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest">
              Versione Beta - Nuove funzioni in arrivo
            </span>
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
        {/* --- SEZIONE FULCRO: DASHBOARD DIARIO (STYLE DARK PREMIUM) --- */}
        {!loading && (
          <section className="mb-16 relative">
            {/* Contenitore Principale Scuro */}
            <div className="bg-[#0f172a] rounded-[3rem] p-8 md:p-12 shadow-2xl shadow-blue-900/20 overflow-hidden relative">
              {/* Decorazione di sfondo per dare profondità */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[80px] rounded-full -mr-20 -mt-20"></div>

              {/* Header Sezione */}
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-lg border border-blue-500/30">
                      Personal Space
                    </span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                    Il Mio Diario di Lettura
                  </h2>
                </div>
                <Link
                  to="/listletture"
                  className="inline-flex items-center justify-center px-6 py-3 bg-white text-gray-900 font-black rounded-2xl hover:bg-blue-50 transition-all shadow-xl shadow-white/5 text-sm"
                >
                  Vai al Diario Completo →
                </Link>
              </div>

              {/* Grid Letture */}
              {ultimeLetture.length > 0 ? (
                <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ultimeLetture.slice(0, 3).map((l) => {
                    // Stili specifici per il tema Dark
                    const getDarkStatusStyles = (stato) => {
                      switch (stato) {
                        case "in_corso":
                          return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
                        case "da_iniziare":
                          return "text-blue-400 bg-blue-400/10 border-blue-400/20";
                        case "finito":
                          return "text-gray-400 bg-gray-400/10 border-gray-400/20";
                        default:
                          return "text-red-400 bg-red-400/10 border-red-400/20";
                      }
                    };

                    return (
                      <Link
                        key={l.id_lettura}
                        to={`/lettura/${l.id_lettura}`}
                        className="group bg-white/5 border border-white/10 p-6 rounded-4xl hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                      >
                        <div className="flex flex-col h-full">
                          <div className="flex justify-between items-start mb-4">
                            <span
                              className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase border ${getDarkStatusStyles(
                                l.stato
                              )}`}
                            >
                              {l.stato?.replace("_", " ")}
                            </span>
                            {l.valutazione && (
                              <span className="text-yellow-400 font-bold text-xs flex items-center gap-1">
                                ★ {l.valutazione}
                              </span>
                            )}
                          </div>

                          <h3 className="text-xl font-black text-white group-hover:text-blue-400 transition-colors line-clamp-2 mb-6">
                            {l.opere?.titolo}
                          </h3>

                          <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                            <div className="flex gap-4">
                              {l.volume && (
                                <div>
                                  <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">
                                    Vol
                                  </p>
                                  <p className="text-lg font-black text-white">
                                    {l.volume}
                                  </p>
                                </div>
                              )}
                              {l.capitolo && (
                                <div>
                                  <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">
                                    Cap
                                  </p>
                                  <p className="text-lg font-black text-white">
                                    {l.capitolo}
                                  </p>
                                </div>
                              )}
                            </div>
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-blue-600 transition-all">
                              <span className="text-white group-hover:translate-x-0.5 transition-transform">
                                →
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="relative z-10 py-12 text-center">
                  <p className="text-gray-400 font-bold mb-6">
                    Non hai ancora iniziato il tuo viaggio...
                  </p>
                  <Link
                    to="/createlettura"
                    className="px-8 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-500 transition-all"
                  >
                    + INIZIA ORA
                  </Link>
                </div>
              )}
            </div>
          </section>
        )}
        {/* --- SCOPRI OPERE --- */}
        <section className="mb-14">
          <div className="flex justify-between items-end mb-6 border-b border-gray-200 pb-2">
            <h2 className="text-2xl font-bold text-gray-800">
              🎲 Scopri Opere
            </h2>
            <Link
              to="/listopere"
              className="text-sm font-bold text-blue-600 hover:underline uppercase tracking-wider"
            >
              Tutte le opere
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {books.length > 0 &&
              getRandomElements(books, 4).map((book) => (
                <Link
                  key={book.id_opera}
                  to={`/opere/${book.id_opera}`}
                  className="hover:scale-[1.02] transition-transform"
                >
                  <Book
                    title={book.titolo}
                    author={book.autori}
                    anno={book.anno_pubblicazione}
                    stato_opera={book.stato_opera}
                    serie={book.serie}
                  />
                </Link>
              ))}
          </div>
        </section>

        {/* --- SCOPRI AUTORI, SERIE & GENERI (Grid Tripla) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Sezione Autori */}
          <section>
            <div className="flex justify-between items-end mb-6 border-b border-gray-200 pb-2">
              <h2 className="text-xl font-bold text-gray-800">✍️ Autori</h2>
              <Link
                to="/listautori"
                className="text-xs font-bold text-blue-500 uppercase"
              >
                Vedi Tutti
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {autori.length > 0 &&
                getRandomElements(autori, 3).map((autore) => (
                  <AutoreCard key={autore.id_autore} autore={autore} />
                ))}
            </div>
          </section>

          {/* Sezione Serie (Esempio, se la hai) */}
          <section>
            <div className="flex justify-between items-end mb-6 border-b border-gray-200 pb-2">
              <h2 className="text-xl font-bold text-gray-800">📚 Serie</h2>
              <Link
                to="/listserie"
                className="text-xs font-bold text-blue-500 uppercase"
              >
                Vedi Tutte
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {serie &&
                getRandomElements(serie, 4).map((s) => (
                  <SerieCard
                    key={s.id_serie}
                    id={s.id_serie}
                    nome={s.nome_serie}
                  />
                ))}
            </div>
          </section>

          {/* Sezione Generi */}
          <section>
            <div className="flex justify-between items-end mb-6 border-b border-gray-200 pb-2">
              <h2 className="text-xl font-bold text-gray-800">🎭 Generi</h2>
              <Link
                to="/listgeneri"
                className="text-xs font-bold text-blue-500 uppercase"
              >
                Vedi Tutti
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {getRandomElements(generi, 3).map((genere) => (
                <GenereCard
                  key={genere.id_genere}
                  id={genere.id_genere}
                  nome={genere.nome_genere}
                  isEditor={false} // Disattiviamo i tasti Edit/Delete in Home
                />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Home;
