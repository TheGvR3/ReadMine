export const refreshAccessToken = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) return null; // Restituisci null se il refresh fallisce

    const data = await response.json();
    localStorage.setItem("accessToken", data.accessToken);
    return data.accessToken;
  } catch (error) {
    console.error("Errore di rete durante il refresh:", error.message);
    return null; // Restituisci null anche in caso di server offline
  }
};
