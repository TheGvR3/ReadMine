import { Link } from "react-router-dom";

const AutoreCard = ({ autore }) => {
  const displayNome = autore?.nome_autore || "Autore Sconosciuto";

  return (
    <Link
      to={`/autore/${autore.id_autore}`} // Corretto da /autori/ a /autore/ per matchare App.js
      className="group flex flex-col items-center justify-center h-full w-full p-4 sm:p-5 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:border-blue-500 transition-all duration-200 active:scale-[0.97]"
    >
      <span className="text-[13px] sm:text-sm font-bold text-gray-700 group-hover:text-blue-600 text-center uppercase tracking-wide leading-snug wrap-break-words line-clamp-2 px-1">
        {displayNome}
      </span>
    </Link>
  );
};

export default AutoreCard;