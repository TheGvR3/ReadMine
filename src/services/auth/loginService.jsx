// -----------------------------------------------------------------------------
// loginService:
// - Effettua la chiamata POST a /auth/login
// - Invia username + password
// - Riceve accessToken + eventuali dati utente
// - Gestisce errori del server
// -----------------------------------------------------------------------------
export async function loginService(identifier, password) {
  // ---------------------------------------------------------------------------
  // Chiamata al backend
  // credentials: "include" → invia i cookie (refresh token)
  // ---------------------------------------------------------------------------
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ identifier, password }),
  });

  // Proviamo a leggere il JSON della risposta
  const data = await response.json();

  // Se il login fallisce (401, 403, ecc.)
  if (!response.ok) {
    throw new Error(data.error || "Login fallito");
  }

  // Login riuscito → ritorniamo i dati al componente Login
  return data;
}
