function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  // Stile comune: altezza fissa (h-8 su mobile, h-10 su schermi grandi), padding ridotto, effetto touch
  const navBtnClass = "h-8 sm:h-10 px-2.5 sm:px-4 text-xs sm:text-sm font-bold rounded-xl border border-gray-200 bg-white text-gray-600 hover:border-blue-400 hover:text-blue-600 disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-600 transition-all shadow-sm flex items-center justify-center active:scale-95";

  return (
    // Margini verticali ridotti su mobile (mt-6 mb-4)
    <div className="flex flex-wrap justify-center items-center gap-1.5 sm:gap-2 mt-6 sm:mt-10 mb-4 sm:mb-8">
      
      {/* Tasto Prima */}
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className={navBtnClass}
        title="Prima pagina"
      >
        <span className="hidden sm:inline mr-1">Prima</span> «
      </button>

      {/* Tasto Indietro */}
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className={navBtnClass}
        title="Pagina precedente"
      >
        ←
      </button>

      {/* Numeri delle pagine */}
      <div className="flex flex-wrap justify-center gap-1 sm:gap-1.5">
        {pages.map((num) => (
          <button
            key={num}
            onClick={() => onPageChange(num)}
            className={`w-8 h-8 sm:w-10 sm:h-10 text-xs sm:text-sm rounded-xl font-bold transition-all duration-200 border flex items-center justify-center active:scale-95 ${
              currentPage === num
                ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200/50"
                : "bg-white text-gray-500 border-gray-100 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50"
            }`}
          >
            {num}
          </button>
        ))}
      </div>

      {/* Tasto Avanti */}
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className={navBtnClass}
        title="Pagina successiva"
      >
        →
      </button>

      {/* Tasto Ultima */}
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className={navBtnClass}
        title="Ultima pagina"
      >
        » <span className="hidden sm:inline ml-1">Ultima</span>
      </button>
    </div>
  );
}

export default Pagination;