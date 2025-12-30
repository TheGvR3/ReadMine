import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { secureFetch } from "../../utils/secureFetch";

function UpdateProfileData() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
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
        if (res.ok) {
          const data = await res.json();
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

    if (response.ok) {
      setMessage({ type: "success", text: "Profilo aggiornato!" });
      setTimeout(() => navigate("/profile"), 1500);
    } else {
      const err = await response.json();
      setMessage({ type: "error", text: err.error || "Errore aggiornamento." });
    }
    setLoading(false);
  };

  if (dataLoading)
    return <div className="text-center mt-10">Caricamento...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar setUser={setUser} setError={setError} />
      <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-indigo-700">
          Modifica Dati Personali
        </h2>

        {message.text && (
          <div
            className={`p-3 mb-4 rounded ${
              message.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            placeholder="Nome"
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            name="cognome"
            value={formData.cognome}
            onChange={handleChange}
            placeholder="Cognome"
            className="w-full p-2 border rounded"
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            required
            className="w-full p-2 border rounded"
          />
          <input
            type="date"
            name="data_nascita"
            value={formData.data_nascita}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            name="indirizzo"
            value={formData.indirizzo}
            onChange={handleChange}
            placeholder="Indirizzo"
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            placeholder="Telefono"
            className="w-full p-2 border rounded"
          />

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="w-1/2 bg-gray-200 py-2 rounded"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-1/2 bg-indigo-600 text-white py-2 rounded"
            >
              {loading ? "Salvataggio..." : "Salva"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UpdateProfileData;
