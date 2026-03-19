import { Link } from "react-router-dom";

function Button({ 
  children, 
  variant = "primary", 
  size = "md", 
  to, 
  onClick, 
  className = "", 
  type = "button",
  disabled = false,
  ...props 
}) {
  
  // 1. Stili base che tutti i bottoni condividono
  const baseStyle = "inline-flex items-center justify-center font-black uppercase tracking-widest transition-all duration-200 active:scale-95 rounded-xl shadow-sm text-center";
  
  // 2. Grandezze (Sizes)
  const sizes = {
    sm: "px-3 py-2 text-[10px] min-w-[80px]",
    md: "px-4 sm:px-6 py-2.5 sm:py-3 text-[10px] sm:text-xs min-w-[100px]",
    lg: "px-6 py-3.5 text-xs sm:text-sm",
  };

  // 3. Colori e Stili (Variants)
  const variants = {
    // Il bottone principale (es. Salva)
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100",
    
    // Bottone di successo (es. + Diario, + Nuova Opera)
    success: "bg-green-600 text-white hover:bg-green-700 shadow-green-100",
    
    // Bottone outline azzurro (es. Modifica)
    outlineBlue: "bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-600 hover:text-white",
    
    // Bottone outline verde (es. + Nuovo Genere nella barra in alto)
    outlineGreen: "bg-green-50 text-green-700 border-2 border-green-200 hover:bg-green-100",
    
    // Bottone di pericolo (es. Elimina)
    danger: "bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white",
    
    // Bottone disabilitato o neutro
    disabled: "bg-gray-100 text-gray-400 cursor-not-allowed active:scale-100 shadow-none",
  };

  // Assembliamo la stringa finale delle classi
  const buttonClass = `${baseStyle} ${sizes[size]} ${disabled ? variants.disabled : variants[variant]} ${className}`;

  // Se passiamo la prop "to", renderizza un <Link> di React Router
  if (to && !disabled) {
    return (
      <Link to={to} className={buttonClass} {...props}>
        {children}
      </Link>
    );
  }

  // Altrimenti, renderizza un normale <button>
  return (
    <button 
      type={type} 
      onClick={onClick} 
      disabled={disabled} 
      className={buttonClass} 
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;