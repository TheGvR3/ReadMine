import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion'; // Usa framer-motion o motion/react a seconda della tua versione

const AnimatedItem = ({ children, delay = 0, index, onMouseEnter, onClick }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.5, triggerOnce: false });
  
  return (
    <motion.div
      ref={ref}
      data-index={index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      initial={{ scale: 0.9, opacity: 0, y: 10 }} // Modificato per un'entrata più morbida
      animate={inView ? { scale: 1, opacity: 1, y: 0 } : { scale: 0.9, opacity: 0, y: 10 }}
      transition={{ duration: 0.3, delay, type: "spring", stiffness: 300, damping: 24 }}
      className="mb-3 cursor-pointer outline-none" // outline-none per quando navighi con tab
    >
      {children}
    </motion.div>
  );
};

const AnimatedList = ({
  items = [],
  renderItem, // ✨ NUOVA PROP: permette di passare un componente custom (es. DiarioListItem)
  onItemSelect,
  showGradients = true,
  enableArrowNavigation = true,
  className = '',
  displayScrollbar = false, // Disattivata di default per un look più pulito su mobile
  initialSelectedIndex = -1
}) => {
  const listRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(initialSelectedIndex);
  const [keyboardNav, setKeyboardNav] = useState(false);
  const [topGradientOpacity, setTopGradientOpacity] = useState(0);
  const [bottomGradientOpacity, setBottomGradientOpacity] = useState(1);

  const handleItemMouseEnter = useCallback(index => {
    setSelectedIndex(index);
  }, []);

  const handleItemClick = useCallback((item, index) => {
    setSelectedIndex(index);
    if (onItemSelect) onItemSelect(item, index);
  }, [onItemSelect]);

  const handleScroll = useCallback(e => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    setTopGradientOpacity(Math.min(scrollTop / 50, 1));
    const bottomDistance = scrollHeight - (scrollTop + clientHeight);
    setBottomGradientOpacity(scrollHeight <= clientHeight ? 0 : Math.min(bottomDistance / 50, 1));
  }, []);

  useEffect(() => {
    if (!enableArrowNavigation || items.length === 0) return;
    const handleKeyDown = e => {
      if (e.key === 'ArrowDown' || (e.key === 'Tab' && !e.shiftKey)) {
        e.preventDefault();
        setKeyboardNav(true);
        setSelectedIndex(prev => Math.min(prev + 1, items.length - 1));
      } else if (e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey)) {
        e.preventDefault();
        setKeyboardNav(true);
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        if (selectedIndex >= 0 && selectedIndex < items.length) {
          e.preventDefault();
          if (onItemSelect) onItemSelect(items[selectedIndex], selectedIndex);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items, selectedIndex, onItemSelect, enableArrowNavigation]);

  useEffect(() => {
    if (!keyboardNav || selectedIndex < 0 || !listRef.current) return;
    const container = listRef.current;
    const selectedItem = container.querySelector(`[data-index="${selectedIndex}"]`);
    if (selectedItem) {
      const extraMargin = 20;
      const containerScrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;
      const itemTop = selectedItem.offsetTop;
      const itemBottom = itemTop + selectedItem.offsetHeight;
      
      if (itemTop < containerScrollTop + extraMargin) {
        container.scrollTo({ top: itemTop - extraMargin, behavior: 'smooth' });
      } else if (itemBottom > containerScrollTop + containerHeight - extraMargin) {
        container.scrollTo({
          top: itemBottom - containerHeight + extraMargin,
          behavior: 'smooth'
        });
      }
    }
    setKeyboardNav(false);
  }, [selectedIndex, keyboardNav]);

  return (
    // Larghezza w-full (adatta al mobile) invece di w-[500px]
    <div className={`relative w-full ${className}`}>
      <div
        ref={listRef}
        // max-h su misura per mostrare circa 3-4 card prima di dover scrollare
        className={`max-h-[420px] overflow-y-auto px-1 pt-2 pb-6 ${
          displayScrollbar
            ? '[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full'
            : 'scrollbar-hide'
        }`}
        onScroll={handleScroll}
      >
        {items.map((item, index) => (
          <AnimatedItem
            key={item.id_lettura || index} // Usa l'id reale se disponibile
            delay={index * 0.05} // Effetto a cascata (stagger) più rapido
            index={index}
            onMouseEnter={() => handleItemMouseEnter(index)}
            onClick={() => handleItemClick(item, index)}
          >
            {/* Se passiamo renderItem, lo usa. Altrimenti usa un fallback testuale */}
            {renderItem ? (
              renderItem(item, selectedIndex === index)
            ) : (
              <div className={`p-4 rounded-xl transition-colors ${selectedIndex === index ? 'bg-gray-200' : 'bg-white'}`}>
                {String(item)}
              </div>
            )}
          </AnimatedItem>
        ))}
      </div>

      {showGradients && (
        <>
          {/* Sfumature adattate al nostro sfondo bg-gray-50 */}
          <div
            className="absolute top-0 left-0 right-0 h-8 bg-linear-to-b from-gray-50 to-transparent pointer-events-none transition-opacity duration-300"
            style={{ opacity: topGradientOpacity }}
          ></div>
          <div
            className="absolute bottom-0 left-0 right-0 h-12 bg-linear-to-t from-gray-50 to-transparent pointer-events-none transition-opacity duration-300"
            style={{ opacity: bottomGradientOpacity }}
          ></div>
        </>
      )}
    </div>
  );
};

export default AnimatedList;