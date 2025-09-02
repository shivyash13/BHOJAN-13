import React from 'react';

interface HeaderProps {
  cartItemCount: number;
  onCartClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ cartItemCount, onCartClick }) => {
  return (
    <header className="py-3.5 px-4 flex items-center justify-between sticky top-0 z-40 bg-black/50 backdrop-blur-lg border-b border-white/10">
      <div className="flex gap-3 items-center">
        <div className="w-11 h-11 rounded-lg bg-red-600/10 flex items-center justify-center border border-red-500/20">
          <i className="fas fa-utensils text-xl text-red-500"></i>
        </div>
        <div>
          <div className="font-extrabold text-lg" style={{color: 'var(--accent-red)'}}>BHOJAN</div>
          <div className="text-sm text-gray-400">Bhookh Lagi? Hum Hain Na!</div>
        </div>
      </div>
      <nav className="flex gap-2.5 items-center">
        <a href="#menu" className="hidden sm:inline text-sm text-gray-300 no-underline mr-3 font-bold hover:text-red-500 transition-colors">Menu</a>
        <button onClick={onCartClick} className="bg-white/5 text-red-400 py-2 px-3 rounded-full font-bold border border-white/10 cursor-pointer flex items-center gap-3 hover:bg-white/10 transition-colors">
          <i className="fas fa-shopping-cart"></i>
          <span className="bg-red-600 text-white w-7 h-7 flex items-center justify-center text-xs rounded-full font-extrabold">{cartItemCount}</span>
        </button>
      </nav>
    </header>
  );
};

export default Header;