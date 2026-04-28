function Book({
  title,
  author,
  anno,
  stato_opera,
  generi,
  tipo,
  editore,
  serie,
}) {
  // Coerente con le tue istruzioni: Verde per in corso, Grigio per finito
  const isFinito = stato_opera?.toLowerCase() === "finito";
  const statoClass = isFinito ? "border-r-gray-300" : "border-r-green-500";
  const headerBg = isFinito ? "bg-gray-50" : "bg-blue-50/50";

  const autoriList = author ? author.split(",").map((a) => a.trim()) : [];
  const generiList = generi ? generi.split(",").map((g) => g.trim()) : [];
  const displayTitle = title || "Titolo Sconosciuto";

  return (
    <div
      className={`
        bg-white shadow-sm rounded-xl overflow-hidden h-full
        border border-gray-100 border-r-[6px] ${statoClass} 
        transition-all duration-200 hover:shadow-md hover:-translate-y-1 active:scale-[0.98]
        flex flex-col relative
      `}
    >
      {/* TESTATA (Copertina) */}
      <div className={`${headerBg} p-3 sm:p-4 border-b border-gray-100 flex-none`}>
        <h2
          className="text-[14px] sm:text-base font-black text-gray-900 leading-tight line-clamp-2 uppercase tracking-tight wrap-break-words pr-10 sm:pr-11"
          title={displayTitle}
        >
          {displayTitle}
        </h2>

        {autoriList.length > 0 && (
          <p className="text-[10px] sm:text-[11px] font-bold text-gray-500 mt-1.5 uppercase tracking-wider line-clamp-1">
            {autoriList.join(" • ")}
          </p>
        )}
      </div>

      {/* CORPO (Contenuto) */}
      <div className="p-3 sm:p-4 flex flex-col justify-between grow gap-3 bg-white">
        
        <div className="space-y-2">
          {/* Info Secondarie: Editore e Anno */}
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {editore && (
              <p className="text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase line-clamp-1">
                <span className="text-gray-400 mr-0.5">ED:</span> {editore}
              </p>
            )}
            {anno && (
              <p className="text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase">
                <span className="text-gray-400 mr-0.5">ANNO:</span> {anno}
              </p>
            )}
          </div>

          {/* Generi - Stile compatto */}
          {generiList.length > 0 && (
            <p className="text-[10px] sm:text-xs font-black text-gray-600 line-clamp-1 uppercase tracking-wide">
              {generiList.join(" / ")}
            </p>
          )}
        </div>

        {/* FOOTER - Tipo, Serie e Stato */}
        <div className="mt-auto pt-3 border-t border-gray-50 flex flex-col gap-2">
          
          <div className="flex justify-between items-start gap-2">
            {/* Tipo (Es. Manga, Libro) */}
            {tipo && (
              <span className="text-[9px] sm:text-[10px] font-black bg-gray-900 text-white px-1.5 py-0.5 rounded uppercase tracking-widest whitespace-nowrap">
                {tipo}
              </span>
            )}

            {/* Badge Stato Testuale (In corso / Finito) */}
            <span className={`text-[8px] sm:text-[9px] font-black uppercase px-1.5 py-0.5 rounded border whitespace-nowrap ml-auto ${
              isFinito ? 'text-gray-400 border-gray-200 bg-gray-50' : 'text-green-600 border-green-200 bg-green-50'
            }`}>
              {stato_opera || "Sconosciuto"}
            </span>
          </div>

          {/* Serie / Opera Singola (Messa sotto per evitare sovrapposizioni con il badge) */}
          <p className="text-[10px] sm:text-[11px] font-bold italic text-gray-500 uppercase line-clamp-1 wrap-break-words">
            {serie ? serie : "OPERA SINGOLA"}
          </p>
          
        </div>
      </div>
    </div>
  );
}

export default Book;