import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { secureFetch } from "../../utils/secureFetch";

function UpdateProfileData() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [navError, setNavError] = useState(""); // Per compatibilità con Navbar
  
  const [formData, setFormData] = useState({
    email: "",
    nome: "",
    cognome: "",
    data_nascita: "",
    indirizzo: "",
    telefono: "",
  });

  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await secureFetch(
          `${import.meta.env.VITE_API_BASE_URL}/users/profile`,
          { method: "GET" },
          navigate
        );
        if (res && res.ok) {
          const data = await res.json();
          setUser(data);
          setFormData({
            email: data.email || "",
            nome: data.nome || "",
            cognome: data.cognome || "",
            data_nascita: data.data_nascita
              ? new Date(data.data_nascita).toISOString().split("T")[0]
              : "",
            indirizzo: data.indirizzo || "",
            telefono: data.telefono || "",
          });
        }
      } catch (err) {
        setMessage({ type: "error", text: "Errore nel caricamento dati." });
      } finally {
        setDataLoading(false);
      }
    };
    fetchUserData();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    const response = await secureFetch(
      `${import.meta.env.VITE_API_BASE_URL}/users/profile/update`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      },
      navigate
    );

    if (response && response.ok) {
      setMessage({ type: "success", text: "Profilo aggiornato con successo!" });
      setTimeout(() => navigate("/profile"), 1500);
    } else {
      const err = await response.json().catch(() => ({}));
      setMessage({ type: "error", text: err.error || "Errore aggiornamento." });
    }
    setLoading(false);
  };

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar setUser={setUser} setError={setNavError} />
      
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white shadow-xl shadow-blue-100/50 rounded-3xl overflow-hidden border border-gray-100">
          
          {/* Header del Form */}
          <div className="bg-linear-to-r from-blue-600 to-blue-400 p-8 text-center text-white">
            <h2 className="text-2xl font-black">✏️ Modifica Dati</h2>
            <p className="text-blue-100 text-sm mt-1">Aggiorna le tue informazioni personali</p>
          </div>

          <div className="p-8">
            {/* Messaggi di Alert */}
            {message.text && (
              <div className={`p-4 mb-6 rounded-2xl text-sm font-bold border transition-all ${
                message.type === "success" 
                ? "bg-green-50 text-green-600 border-green-100" 
                : "bg-red-50 text-red-600 border-red-100"
              }`}>
                {message.type === "success" ? "✅ " : "⚠️ "}{message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="Nome" name="nome" value={formData.nome} onChange={handleChange} placeholder="Mario" />
                <InputGroup label="Cognome" name="cognome" value={formData.cognome} onChange={handleChange} placeholder="Rossi" />
              </div>

              <InputGroup label="Indirizzo Email" type="email" name="email" disabled value={formData.email} onChange={handleChange} placeholder="email@esempio.it" required />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="Data di Nascita" type="date" name="data_nascita" value={formData.data_nascita} onChange={handleChange} />
                <InputGroup label="Telefono" name="telefono" value={formData.telefono} onChange={handleChange} placeholder="333 1234567" />
              </div>

              <InputGroup label="Indirizzo di Residenza" name="indirizzo" value={formData.indirizzo} onChange={handleChange} placeholder="Via Roma, 10" />

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => navigate("/profile")}
                  className="w-full sm:w-1/2 py-4 px-6 rounded-2xl bg-gray-50 text-gray-500 font-bold hover:bg-gray-100 transition-all active:scale-95"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-1/2 py-4 px-6 rounded-2xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
                >
                  {loading ? "Salvataggio..." : "Salva Modifiche"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sottocomponente per Input coerenti
const InputGroup = ({ label, ...props }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">{label}</label>
    <input
      {...props}
      className="w-full px-4 py-3.5 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-gray-300"
    />
  </div>
);

export default UpdateProfileData;