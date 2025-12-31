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
  const statoClass = stato_opera === "finito" ? "border-gray-300" : "border-green-500";
  const headerBg = stato_opera === "finito" ? "bg-gray-100" : "bg-blue-50";

  const autoriList = author ? author.split(",").map((a) => a.trim()) : [];
  const generiList = generi ? generi.split(",").map((g) => g.trim()) : [];

  return (
    <div
      className={`
        bg-white shadow-md rounded-xl overflow-hidden 
        border border-gray-200 border-r-8 ${statoClass} 
        transition-all duration-200 hover:shadow-xl hover:-translate-y-1
        flex flex-col
      `}
      style={{ minHeight: "270px" }}
    >
      {/* TESTATA (Copertina) - Cambio colore netto */}
      <div className={`${headerBg} p-5 border-b border-gray-200`}>
        <h2
          className="text-lg font-black text-gray-900 leading-tight line-clamp-2 uppercase tracking-tight"
          title={title}
        >
          {title}
        </h2>

        {autoriList.length > 0 && (
          <p className="text-[12px] font-bold text-gray-600 mt-2 uppercase tracking-widest">
            {autoriList.join(" • ")}
          </p>
        )}
      </div>

      {/* CORPO (Contenuto) */}
      <div className="p-5 flex flex-col justify-between grow space-y-4">
        
        <div className="space-y-2">
          {/* Info Secondarie */}
          <div className="flex flex-wrap gap-y-1 gap-x-4">
             {editore && (
              <p className="text-[10px] font-bold text-gray-500 uppercase">
                <span className="text-gray-400 mr-1">ED:</span> {editore}
              </p>
            )}
            {anno && (
              <p className="text-[10px] font-bold text-gray-500 uppercase">
                <span className="text-gray-400 mr-1">ANNO:</span> {anno}
              </p>
            )}
          </div>

          {/* Generi - Stile compatto */}
          {generiList.length > 0 && (
            <p className="text-xs font-black text-gray-600 line-clamp-1">
              {generiList.join(" / ")}
            </p>
          )}
        </div>

        {/* FOOTER - Tipo e Serie */}
        <div className="mt-auto pt-3 border-t border-gray-50 flex justify-between items-end">
          <div className="flex flex-col gap-1">
            {tipo && (
              <span className="text-[10px] font-black bg-gray-900 text-white px-2 py-0.5 rounded uppercase tracking-[0.15em] w-fit">
                {tipo}
              </span>
            )}
            <p className="text-[12px] font-bold italic text-gray-600 uppercase">
              {serie ? `${serie}` : "OPERA SINGOLA"}
            </p>
          </div>
          
          {/* Badge Stato Testuale */}
          <span className={`text-[8px] font-black uppercase px-2 py-1 rounded border ${
            stato_opera === 'finito' ? 'text-gray-400 border-gray-200' : 'text-green-600 border-green-200 bg-green-50'
          }`}>
            {stato_opera}
          </span>
        </div>
      </div>
    </div>
  );
}

export default Book;