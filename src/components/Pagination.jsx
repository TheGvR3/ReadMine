function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  // Stile comune per i tasti funzione (Prima/Ultima/Frecce)
  const navBtnClass = "px-4 py-2 text-sm font-medium rounded-xl border border-gray-200 bg-white text-gray-600 hover:border-blue-400 hover:text-blue-600 disabled:opacity-30 disabled:hover:border-gray-200 disabled:hover:text-gray-600 transition-all shadow-sm flex items-center justify-center";

  return (
    <div className="flex flex-wrap justify-center items-center gap-2 mt-12 mb-8">
      {/* Tasto Prima */}
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className={navBtnClass}
      >
        « Prima
      </button>

      {/* Tasto Indietro */}
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className={navBtnClass}
      >
        ←
      </button>

      {/* Numeri delle pagine */}
      <div className="flex gap-1.5">
        {pages.map((num) => (
          <button
            key={num}
            onClick={() => onPageChange(num)}
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl font-bold transition-all duration-200 border ${
              currentPage === num
                ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200"
                : "bg-white text-gray-400 border-gray-100 hover:border-blue-200 hover:text-blue-600"
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
      >
        →
      </button>

      {/* Tasto Ultima */}
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className={navBtnClass}
      >
        Ultima »
      </button>
    </div>
  );
}

export default Pagination;