import { useState , useEffect } from "react";
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
    } else if (identifier.trim().length > 30) {
      setError("L'username non può superare i 30 caratteri");
      setLoading(false);
      return;
    }else if (/\s/.test(identifier)) {
      setError("L'username non può contenere spazi");
      setLoading(false);
      return;
    }

    if (password.trim().length < 6) {
      setError("La password deve avere almeno 6 caratteri");
      setLoading(false);
      return;
    }else if (password.trim().length > 50) {
      setError("La password non può superare i 50 caratteri");
      setLoading(false);
      return;
    }else if (/\s/.test(password)) {
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
      {/* -----------------------------------------------------------------------
        BOX DEL FORM DI LOGIN
      ------------------------------------------------------------------------ */}
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Campo Username */}
          <div className="flex flex-col">
            <label htmlFor="identifier" className="text-sm font-semibold">
              Username:
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
          <div className="flex flex-col">
            <label htmlFor="password" className="text-sm font-semibold">
              Password:
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
