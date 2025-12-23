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
  const statoClass =
    stato_opera === "finito" ? "border-gray-300" : "border-green-500";

  const autoriList = author ? author.split(",").map((a) => a.trim()) : [];
  const generiList = generi ? generi.split(",").map((g) => g.trim()) : [];

  return (
    <div
      className={`
        bg-white shadow-lg rounded-lg overflow-hidden 
        border-r-8 ${statoClass} 
        transition-transform duration-200 hover:scale-[1.02]
        flex flex-col
      `}
      style={{ minHeight: "260px" }}
    >
      {/* COPERTINA (simulata) */}
      <div className="bg-linear-to-br from-gray-100 to-gray-200 p-4 border-b">
        <h2
          className="text-xl font-bold text-gray-900 leading-tight line-clamp-2"
          title={title}
        >
          {title}
        </h2>

        {autoriList.length > 0 && (
          <p className="text-sm text-gray-700 mt-1 font-medium line-clamp-1">
            {autoriList.join(" • ")}
          </p>
        )}
      </div>

      {/* CONTENUTO */}
      <div className="p-4 flex flex-col justify-between grow">
        {/* Editore */}
        {editore && (
          <p className="text-xs text-gray-500 italic mb-1">
            Editore: {editore}
          </p>
        )}

        {/* Anno */}
        {anno && (
          <p className="text-xs text-gray-500 mb-2">Pubblicazione: {anno}</p>
        )}

        {/* Generi */}
        {generiList.length > 0 && (
          <p className="text-sm font-semibold text-indigo-600 mb-2 line-clamp-1">
            {generiList.join(" • ")}
          </p>
        )}

        {/* Tipo + Stato */}
        {(tipo || stato_opera) && (
          <p className="text-xs uppercase tracking-wider text-gray-600 mb-2">
            {tipo}
            {tipo && stato_opera && " • "}
            {stato_opera && (
              <span
                className={
                  stato_opera === "finito"
                    ? "text-gray-500"
                    : "text-green-600 font-semibold"
                }
              >
                {stato_opera}
              </span>
            )}
          </p>
        )}

        {/* Serie */}
        <p className="text-xs italic text-gray-500 mt-auto min-h-6">
          {serie ? `Serie: ${serie}` : ""}
        </p>
      </div>
    </div>
  );
}

export default Book;
