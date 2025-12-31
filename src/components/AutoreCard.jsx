import { Link } from "react-router-dom";

const AutoreCard = ({ autore }) => (
  <Link
    to={`/autore/${autore.id_autore}`}
    className="group bg-white p-6 rounded-4xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all flex items-center justify-between"
  >
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
        {autore.nome_autore?.charAt(0).toUpperCase()}
      </div>
      <div>
        <h2 className="text-lg font-black text-gray-800 group-hover:text-blue-600 transition-colors">
          {autore.nome_autore}
        </h2>
        
      </div>
    </div>
    <span className="text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all font-black">
      →
    </span>
  </Link>
);

export default AutoreCard; 