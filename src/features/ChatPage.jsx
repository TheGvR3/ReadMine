import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { secureFetch } from "../utils/secureFetch";

function ChatPage() {
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]); 
  const [input, setInput] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", content: input };
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
          body: JSON.stringify({ userInput: currentInput }),
        },
        navigate
      );

      if (!response) return;

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Errore nella risposta del server");
      }

      const data = await response.json();
      const botMessage = { role: "assistant", content: data.response };
      setMessages((prev) => [...prev, botMessage]);

    } catch (err) {
      setError("Impossibile contattare l'assistente: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      <Navbar setUser={setUser} setError={setError} />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 flex flex-col">
        
        {/* AVVISO STATO SVILUPPO (DISCLAIMER) */}
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-4 rounded-r-xl shadow-sm">
          <div className="flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <h3 className="text-sm font-bold text-amber-800 uppercase tracking-tight">Fase di Test (Pre-Beta)</h3>
              <p className="text-xs text-amber-700 leading-relaxed mt-1">
                Questo assistente è in una fase embrionale. Al momento può gestire solo ricerche molto basiche e potrebbe non essere sempre stabile. 
                <strong> Non integra ancora funzioni avanzate</strong>, ma stiamo lavorando per permettergli presto di aiutarti a scoprire letture personalizzate basate sulla tua biblioteca.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-t-xl shadow-md p-6 border-b-2 border-blue-500">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                🤖 ReadMine Assistant
              </h1>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Experimental AI Engine</p>
            </div>
            <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-full border border-blue-200">
              V 0.1a
            </span>
          </div>
        </div>

        {/* Area Messaggi */}
        <div className="flex-1 bg-white shadow-md overflow-y-auto p-4 space-y-4 min-h-[400px]">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 mt-10">
              <div className="bg-gray-50 inline-block p-4 rounded-full mb-4">🤖</div>
              <p className="text-lg font-medium text-gray-600">Ciao! Sono l'assistente di ReadMine.</p>
              <p className="text-sm mt-2 max-w-xs mx-auto">
                In questa fase posso aiutarti con domande semplici. Cosa vorresti sapere?
              </p>
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
                    ? "bg-blue-600 text-white rounded-br-none shadow-md"
                    : "bg-gray-100 text-gray-800 rounded-bl-none border border-gray-200"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-50 p-3 rounded-2xl animate-pulse text-gray-500 text-xs flex items-center gap-2 border border-gray-100">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                </div>
                <span>Elaborazione in corso...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-center text-xs border border-red-200">
              {error}
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
            className="flex-1 border-2 border-gray-200 rounded-full px-5 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            placeholder="Chiedimi qualcosa (Beta)..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-blue-700 disabled:bg-gray-300 transition-all shadow-sm"
          >
            {loading ? "..." : "Invia"}
          </button>
        </form>
      </main>
    </div>
  );
}

export default ChatPage;