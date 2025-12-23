import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { secureFetch } from "../../utils/secureFetch";

function UpdatePassword() {
  const navigate = useNavigate();
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
      return setMessage({ type: "error", text: "Le password non coincidono." });
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

    if (response.ok) {
      setMessage({ type: "success", text: "Password aggiornata!" });
      setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => navigate("/profile"), 1500);
    } else {
      const err = await response.json();
      setMessage({ type: "error", text: err.error || "Errore." });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-red-600">Cambio Password</h2>
        
        {message.text && (
          <div className={`p-3 mb-4 rounded ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-semibold">Vecchia Password</label>
            <input type="password" name="oldPassword" value={passwords.oldPassword} onChange={handleChange} required className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="text-sm font-semibold">Nuova Password</label>
            <input type="password" name="newPassword" value={passwords.newPassword} onChange={handleChange} required className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="text-sm font-semibold">Conferma Nuova Password</label>
            <input type="password" name="confirmPassword" value={passwords.confirmPassword} onChange={handleChange} required className="w-full p-2 border rounded" />
          </div>
          
          <div className="flex gap-4 pt-4">
            <button type="button" onClick={() => navigate("/profile")} className="w-1/2 bg-gray-200 py-2 rounded">Annulla</button>
            <button type="submit" disabled={loading} className="w-1/2 bg-red-600 text-white py-2 rounded font-bold">
              {loading ? "Attendere..." : "Aggiorna Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UpdatePassword;