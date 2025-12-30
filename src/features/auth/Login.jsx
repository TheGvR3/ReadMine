import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginService } from "../../services/auth/loginService";
import { Link } from "react-router-dom";

function Login() {
  // ---------------------------------------------------------------------------
  // Stati locali:
  // - error → messaggio di errore da mostrare all’utente
  // - loading → indica se la richiesta è in corso
  // ---------------------------------------------------------------------------
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  // ---------------------------------------------------------------------------
  // Se l’utente ha già un token → salta il login e vai alla Home
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (localStorage.getItem("accessToken")) {
      navigate("/home");
    }
  }, []);

  // ---------------------------------------------------------------------------
  // handleSubmit:
  // - intercetta il submit del form
  // - legge username e password
  // - chiama loginService
  // - salva il token
  // - reindirizza alla dashboard
  // ---------------------------------------------------------------------------
  const handleSubmit = async (event) => {
    event.preventDefault(); // evita il refresh della pagina
    setError("");
    setLoading(true);

    // Recupero dei valori dal form
    const identifier = event.target.identifier.value;
    const password = event.target.password.value;

    // validazioni lato client
    if (identifier.trim().length < 3) {
      setError("L'username deve avere almeno 3 caratteri");
      setLoading(false);
      return;
    } else if (identifier.trim().length > 100) {
      setError("L'username non può superare i 100 caratteri");
      setLoading(false);
      return;
    } else if (/\s/.test(identifier)) {
      setError("L'username non può contenere spazi");
      setLoading(false);
      return;
    }

    if (password.trim().length < 6) {
      setError("La password deve avere almeno 6 caratteri");
      setLoading(false);
      return;
    } else if (password.trim().length > 50) {
      setError("La password non può superare i 50 caratteri");
      setLoading(false);
      return;
    } else if (/\s/.test(password)) {
      setError("La password non può contenere spazi");
      setLoading(false);
      return;
    }

    try {
      // -----------------------------------------------------------------------
      // Chiamata al servizio di login
      // loginService restituisce:
      // { accessToken, userData, ... }
      // -----------------------------------------------------------------------
      const data = await loginService(identifier, password);
      // Salviamo l'access token nel localStorage
      localStorage.setItem("accessToken", data.accessToken);
      // Reindirizziamo alla dashboard
      navigate("/home");
    } catch (err) {
      // Errori lato server o credenziali errate
      setError(err.message || "Si è verificato un errore. Riprova!");
    } finally {
      // Fine del caricamento
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // RENDER DELLA PAGINA DI LOGIN
  // ---------------------------------------------------------------------------
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 gap-8">
      <div className="text-center mb-2">
        <h1 className="text-5xl font-extrabold tracking-tighter">
          <span className="text-blue-600">READ</span>
          <span className="text-gray-800">MINE</span>
        </h1>
        <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-mono">
          Explore your own library
        </p>
      </div>
      {/* -----------------------------------------------------------------------
        BOX DEL FORM DI LOGIN
      ------------------------------------------------------------------------ */}
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Campo Username */}
          <div className="flex flex-col">
            <label htmlFor="identifier" className="text-sm font-semibold">
              Username (Email):
            </label>
            <input
              type="text"
              id="identifier"
              name="identifier"
              required
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* Campo Password */}
          <div className="flex flex-col relative">
            {" "}
            {/* Aggiunta relative qui */}
            <label htmlFor="password" className="text-sm font-semibold">
              Password:
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"} // Tipo dinamico
                id="password"
                name="password"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10" // pr-10 per non sovrapporre testo e icona
              />
              {/* Bottone Occhio */}
              <button
                type="button" // Fondamentale: evita il submit del form al click
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-blue-600 transition-colors"
              >
                {showPassword ? (
                  // Icona Occhio Sbarrato (Nascondi)
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                    />
                  </svg>
                ) : (
                  // Icona Occhio (Mostra)
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
          {/* Bottone di Submit */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? "Caricamento..." : "Login"}
            </button>
          </div>
        </form>
        {/* Messaggio di errore */}
        {error && (
          <p className="mt-4 bg-red-200 text-red-500 text-sm text-center">
            {error}
          </p>
        )}
      </div>

      {/* -----------------------------------------------------------------------
        BOX REGISTRAZIONE
      ------------------------------------------------------------------------ */}
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg text-center">
        <h2 className="text-2xl font-bold mb-4">Non hai un account?</h2>
        <p className="text-gray-600 mb-4">
          Registrati ora per accedere a tutte le funzionalità!
        </p>
        <Link
          to="/register"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Registrati
        </Link>
      </div>
    </div>
  );
}

export default Login;
