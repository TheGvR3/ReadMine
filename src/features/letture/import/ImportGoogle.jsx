import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import Button from "../../../components/ui/Button";
import { secureFetch } from "../../../utils/secureFetch";

function ImportGoogle() {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [mode, setMode] = useState("q");
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Set di volumeId selezionati per import multiplo
  const [selected, setSelected] = useState(new Set());

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    setResults([]);
    setSelected(new Set());

    const param = mode === "isbn"
      ? `isbn=${encodeURIComponent(query.trim())}`
      : `q=${encodeURIComponent(query.trim())}`;
    const url = `${import.meta.env.VITE_API_BASE_URL}/import/google/search?${param}&maxResults=40`;

    try {
      const res = await secureFetch(url, { method: "GET" }, navigate);
      if (!res?.ok) {
        const err = await res?.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res?.status}`);
      }
      const data = await res.json();
      setResults(data.results || []);
      setSearched(true);
    } catch (err) {
      setError(err.message || "Errore durante la ricerca");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (volumeId) => {
    setSelected((prev) => {
      const s = new Set(prev);
      if (s.has(volumeId)) s.delete(volumeId);
      else s.add(volumeId);
      return s;
    });
  };

  const clearSelection = () => setSelected(new Set());

  const selectAllVisible = () => {
    setSelected(new Set(results.filter((r) => !r.alreadyImported).map((r) => r.google_volume_id)));
  };

  const goToPreview = (volumeId) => {
    navigate(`/import-google/preview/${encodeURIComponent(volumeId)}`);
  };

  const goToBulk = () => {
    if (selected.size === 0) return;
    const items = results.filter((r) => selected.has(r.google_volume_id));
    navigate("/import-google/bulk", { state: { items } });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-32">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 pt-6 pb-24 md:py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Importa da Google Books
          </h1>
          <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mt-1">
            Cerca → seleziona → personalizza → importa
          </p>
        </div>

        <form
          onSubmit={handleSearch}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6"
        >
          <div className="flex bg-gray-100 p-1 rounded-xl mb-4 w-max">
            <button
              type="button"
              onClick={() => setMode("q")}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                mode === "q" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"
              }`}
            >
              🔍 Titolo / Autore
            </button>
            <button
              type="button"
              onClick={() => setMode("isbn")}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                mode === "isbn" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"
              }`}
            >
              📖 ISBN
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder={mode === "isbn" ? "9788804668237" : "Es. One Piece, Tolkien..."}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold text-gray-700"
            />
            <Button type="submit" variant="primary" disabled={loading || !query.trim()}>
              {loading ? "Cercando..." : "Cerca"}
            </Button>
          </div>
        </form>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-xs font-black uppercase tracking-widest text-center">
            ⚠️ {error}
          </div>
        )}

        {searched && results.length === 0 && !loading && !error && (
          <div className="text-center py-12 text-gray-400 font-black uppercase tracking-widest text-xs">
            Nessun risultato per "{query}"
          </div>
        )}

        {results.length > 0 && (
          <div className="flex justify-between items-center mb-3 px-1">
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest">
              {results.length} risultati
            </p>
            <button
              type="button"
              onClick={selectAllVisible}
              className="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest"
            >
              ☑ Seleziona tutti (non importati)
            </button>
          </div>
        )}

        <div className="space-y-3">
          {results.map((book) => {
            const cover = book.copertina_url || "https://via.placeholder.com/80x120?text=No+Cover";
            const isImported = !!book.alreadyImported;
            const isSelected = selected.has(book.google_volume_id);
            const serie = book.serie_parsata?.nome;
            const numVol = book.serie_parsata?.numero;
            const matchingCount = book.matching_opere?.length || 0;

            return (
              <div
                key={book.google_volume_id}
                className={`flex gap-4 p-4 bg-white border rounded-xl shadow-sm items-center transition-all ${
                  isSelected ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-100"
                }`}
              >
                {/* Checkbox solo se non già importato */}
                {!isImported ? (
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(book.google_volume_id)}
                    className="w-5 h-5 shrink-0 cursor-pointer accent-blue-600"
                  />
                ) : (
                  <div className="w-5 h-5 shrink-0 flex items-center justify-center text-emerald-500">
                    ✓
                  </div>
                )}

                <img
                  src={cover}
                  alt="Cover"
                  className="w-14 h-20 sm:w-16 sm:h-24 object-cover rounded shadow-sm shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-black text-gray-900 text-sm sm:text-base line-clamp-1">
                      {book.titolo}
                    </h3>
                    {isImported && (
                      <span className="text-[10px] font-black bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                        ✓ GIÀ IMPORTATO ({book.alreadyImported.match_via === "isbn" ? "via ISBN" : "via Google ID"})
                      </span>
                    )}
                    {!isImported && matchingCount > 0 && (
                      <span className="text-[10px] font-black bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                        ⚠ {matchingCount} opera{matchingCount > 1 ? "e" : ""} simile{matchingCount > 1 ? "i" : ""}
                      </span>
                    )}
                    {serie && (
                      <span className="text-[10px] font-black bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
                        🔗 {serie}{numVol ? ` #${numVol}` : ""}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider line-clamp-1 mt-1">
                    {book.autori?.join(", ") || "Autore sconosciuto"}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    {book.editore || "Editore N/A"} • {book.anno_pubblicazione || "Anno N/A"}
                    {book.isbn_issn && ` • ISBN ${book.isbn_issn}`}
                  </p>
                </div>

                <Button
                  variant={isImported ? "outlineBlue" : "outlineGreen"}
                  onClick={() => isImported
                    ? navigate(`/opere/${book.alreadyImported.id_opera}`)
                    : goToPreview(book.google_volume_id)
                  }
                  className="text-[10px] sm:text-xs shrink-0"
                >
                  {isImported ? "Vedi opera" : "Anteprima"}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Barra fissa "selezionati" */}
      {selected.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 z-50">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
            <p className="text-sm font-black text-gray-800">
              📥 <span className="text-blue-600">{selected.size}</span> selezionat{selected.size === 1 ? "o" : "i"}
            </p>
            <div className="flex gap-2">
              <Button variant="outlineBlue" onClick={clearSelection}>
                Annulla
              </Button>
              <Button variant="success" onClick={goToBulk}>
                Importa selezionati →
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ImportGoogle;
