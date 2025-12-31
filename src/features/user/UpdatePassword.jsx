import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { secureFetch } from "../../utils/secureFetch";

function UpdatePassword() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [navError, setNavError] = useState("");
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      return setMessage({ type: "error", text: "Le nuove password non coincidono." });
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    const response = await secureFetch(
      `${import.meta.env.VITE_API_BASE_URL}/users/profile/updatePassword`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldPassword: passwords.oldPassword,
          newPassword: passwords.newPassword,
        }),
      },
      navigate
    );

    if (response && response.ok) {
      setMessage({ type: "success", text: "Password aggiornata con successo!" });
      setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => navigate("/profile"), 1500);
    } else {
      const err = await response.json().catch(() => ({}));
      setMessage({ type: "error", text: err.error || "Errore durante l'aggiornamento." });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar setUser={setUser} setError={setNavError} />
      
      <div className="max-w-xl mx-auto px-4 py-12">
        <div className="bg-white shadow-xl shadow-blue-100/50 rounded-3xl overflow-hidden border border-gray-100">
          
          <div className="bg-linear-to-r from-red-600 to-red-400 p-8 text-center text-white">
            <h2 className="text-2xl font-black">🔒 Sicurezza Account</h2>
            <p className="text-red-100 text-sm mt-1">Gestisci le tue credenziali di accesso</p>
          </div>

          <div className="p-8">
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
              <InputPassword 
                label="Vecchia Password" 
                name="oldPassword" 
                value={passwords.oldPassword} 
                onChange={handleChange} 
                placeholder="La tua password attuale"
              />

              <div className="h-px bg-gray-100 my-2"></div>

              <InputPassword 
                label="Nuova Password" 
                name="newPassword" 
                value={passwords.newPassword} 
                onChange={handleChange} 
                placeholder="Nuova password"
              />

              <InputPassword 
                label="Conferma Nuova Password" 
                name="confirmPassword" 
                value={passwords.confirmPassword} 
                onChange={handleChange} 
                placeholder="Ripeti la password"
              />

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => navigate("/profile")}
                  className="w-full sm:w-1/3 py-4 px-6 rounded-2xl bg-gray-50 text-gray-500 font-bold hover:bg-gray-100 transition-all active:scale-95"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-2/3 py-4 px-6 rounded-2xl bg-red-600 text-white font-bold shadow-lg shadow-red-200 hover:bg-red-700 transition-all active:scale-95 disabled:opacity-50"
                >
                  {loading ? "Aggiornamento..." : "Salva Nuova Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente InputPassword con icone SVG e toggle
const InputPassword = ({ label, name, value, onChange, placeholder }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">
        {label}
      </label>
      <div className="relative group">
        <input
          type={isVisible ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required
          className="w-full px-4 py-3.5 pr-12 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all placeholder:text-gray-300"
        />
        <button
          type="button"
          onClick={() => setIsVisible(!isVisible)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors focus:outline-none"
          tabIndex="-1"
        >
          {isVisible ? (
            // Icona Occhio Sbarrato (Nascondi)
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
            </svg>
          ) : (
            // Icona Occhio (Mostra)
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default UpdatePassword;