import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { secureFetch } from "../utils/secureFetch";

function ChatPage() {
  const navigate = useNavigate();

  // Stati per la chat
  const [messages, setMessages] = useState([]); // Storia della conversazione
  const [input, setInput] = useState(""); // Testo nel campo di input
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", content: input };
    
    // Aggiorna la UI con il messaggio dell'utente
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setLoading(true);
    setError("");

    try {
      const response = await secureFetch(
        `${import.meta.env.VITE_API_BASE_URL}/ai/generate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            userInput: currentInput // Cambiato da "message" a "userInput"
          }),
        },
        navigate
      );

      if (!response) return;

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Errore nella risposta del server");
      }

      const data = await response.json();
      
      // Aggiungi la risposta del bot alla storia
      const botMessage = { role: "assistant", content: data.response };
      setMessages((prev) => [...prev, botMessage]);

    } catch (err) {
      setError("Impossibile contattare l'assistente: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar setError={setError} />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 flex flex-col">
        <div className="bg-white rounded-t-xl shadow-md p-6 border-b-2 border-indigo-500">
          <h1 className="text-2xl font-bold text-gray-800">🤖 AI Assistant</h1>
          <p className="text-sm text-gray-500">Powered by Groq - Llama 3.3 70B</p>
        </div>

        {/* Area Messaggi */}
        <div className="flex-1 bg-white shadow-md overflow-y-auto p-4 space-y-4 min-h-[400px]">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 mt-10">
              <p className="text-lg">👋 Ciao! Come posso aiutarti?</p>
              <p className="text-sm mt-2">Fai qualsiasi domanda, sono qui per te!</p>
            </div>
          )}

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-2xl ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white rounded-br-none"
                    : "bg-gray-200 text-gray-800 rounded-bl-none"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 p-3 rounded-2xl animate-pulse text-gray-500 text-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                <span className="ml-2">L'assistente sta pensando...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-center text-sm border border-red-200">
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Input Form */}
        <form
          onSubmit={handleSendMessage}
          className="bg-gray-50 p-4 rounded-b-xl shadow-inner border-t flex gap-2"
        >
          <input
            type="text"
            className="flex-1 border-2 border-gray-200 rounded-full px-4 py-2 focus:outline-none focus:border-indigo-500 transition-colors"
            placeholder="Scrivi qui la tua domanda..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-indigo-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
          >
            {loading ? "..." : "Invia"}
          </button>
        </form>
      </main>
    </div>
  );
}

export default ChatPage;