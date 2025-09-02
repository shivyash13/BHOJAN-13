import React from 'react';
import { MenuItem, CartItem } from '../types';

interface MenuItemCardProps {
  item: MenuItem;
  cartItem: CartItem | undefined;
  addToCart: (item: MenuItem) => void;
  changeQty: (id: string, delta: number) => void;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, cartItem, addToCart, changeQty }) => {
  const handleAddToCart = () => {
    addToCart(item);
  };
  
  return (
    <div className="relative flex flex-col rounded-xl overflow-hidden glass-panel card-hover-glow shadow-lg transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-[var(--red-glow)]">
      <div className="w-full h-40 sm:h-44 overflow-hidden">
        <img src={item.img} alt={item.name} className="w-full h-full object-cover block" />
      </div>
      <div className="p-3 sm:p-4 flex flex-col gap-2 flex-grow">
        <h3 className="m-0 text-base sm:text-lg font-bold text-white">{item.name}</h3>
        <p className="m-0 text-gray-400 text-sm leading-tight min-h-[40px] flex-grow">{item.desc}</p>
        <div className="flex items-center justify-between mt-auto pt-2">
          <div className="font-extrabold text-base sm:text-lg text-white">₹{Math.round(item.price)}</div>
          {cartItem && cartItem.qty > 0 ? (
            <div className="flex gap-2 items-center bg-black/20 rounded-full border border-white/10 p-1">
              <button onClick={() => changeQty(item.id, -1)} className="bg-red-600 text-white w-6 h-6 sm:w-7 sm:h-7 rounded-full cursor-pointer text-lg font-bold flex items-center justify-center hover:bg-red-700 transition-colors">-</button>
              <span className="min-w-[20px] text-center font-bold text-white px-1">{cartItem.qty}</span>
              <button onClick={() => changeQty(item.id, 1)} className="bg-red-600 text-white w-6 h-6 sm:w-7 sm:h-7 rounded-full cursor-pointer text-lg font-bold flex items-center justify-center hover:bg-red-700 transition-colors">+</button>
            </div>
          ) : (
            <button onClick={handleAddToCart} className="btn-gradient border-none text-white py-1.5 px-3 sm:py-2 sm:px-4 rounded-lg cursor-pointer font-bold text-sm sm:text-base">
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const SkeletonCard: React.FC = () => (
  <div className="rounded-xl glass-panel p-4 animate-pulse">
    <div className="bg-gray-700/50 h-36 rounded-lg"></div>
    <div className="space-y-3 mt-4">
      <div className="h-4 bg-gray-700/50 rounded w-3/4"></div>
      <div className="h-3 bg-gray-700/50 rounded w-full"></div>
      <div className="h-3 bg-gray-700/50 rounded w-1/2"></div>
      <div className="flex justify-between items-center pt-2">
        <div className="h-6 bg-gray-700/50 rounded w-1/4"></div>
        <div className="h-10 bg-gray-700/50 rounded-lg w-1/3"></div>
      </div>
    </div>
  </div>
);


interface MenuProps {
  menu: MenuItem[];
  isLoading: boolean;
  addToCart: (item: MenuItem) => void;
  changeQty: (id: string, delta: number) => void;
  cart: CartItem[];
}

const Menu: React.FC<MenuProps> = ({ menu, isLoading, addToCart, changeQty, cart }) => {
  return (
    <>
      <div className="glass-panel rounded-xl p-5 shadow-lg flex justify-between items-center mb-6">
        <div>
          <h1 className="m-0 mb-1.5 text-2xl font-extrabold text-white">Our Menu</h1>
          <div className="text-gray-400">Tap add to include an item in the cart.</div>
        </div>
      </div>
      <section id="menu">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            menu.map(item => {
              const cartItem = cart.find(ci => ci.id === item.id);
              return <MenuItemCard key={item.id} item={item} cartItem={cartItem} addToCart={addToCart} changeQty={changeQty} />;
            })
          )}
        </div>
      </section>
    </>
  );
};

export default Menu;