import React, { useState, useEffect, useCallback } from 'react';
import { MenuItem, CartItem } from './types';
import { SANITY_URL, sampleMenu } from './constants';
import Header from './components/Header';
import Menu from './components/Menu';
import Cart from './components/Cart';

const SplashScreen: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => (
  <div className="min-h-screen w-full flex flex-col justify-center items-center p-6 text-center bg-black overflow-hidden relative">
    <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#1a0c0c] via-[#0d0d0d] to-[#0d0d0d]"></div>
    <div className="relative z-10 flex flex-col items-center justify-center flex-grow">
      <div className="flex flex-col items-center gap-6 animate-fade-in">
        <div className="w-24 h-24 rounded-2xl bg-red-600/10 flex items-center justify-center border-2 border-red-500/30 animate-icon-glow">
          <i className="fas fa-utensils text-5xl text-red-500"></i>
        </div>
        <div className="flex flex-col items-center gap-2">
            <h1 className="text-6xl font-extrabold tracking-widest text-white animate-text-reveal" style={{ '--stagger': 1 } as React.CSSProperties}>
              BHOJAN
            </h1>
            <p className="text-gray-400 max-w-sm mx-auto animate-text-reveal" style={{ '--stagger': 2 } as React.CSSProperties}>
              Delicious Indian food, delivered fast.
            </p>
        </div>
      </div>
    </div>
    <div className="relative z-10 w-full max-w-sm p-4 animate-button-slide-up">
      <button onClick={onGetStarted} className="w-full btn-gradient text-white font-bold py-4 px-6 rounded-full text-lg">
        Get Started
      </button>
    </div>
  </div>
);


const App: React.FC = () => {
  const [appState, setAppState] = useState<'splash' | 'main'>('splash');
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);

  const totalCartItems = cart.reduce((sum, item) => sum + item.qty, 0);

  useEffect(() => {
    const fetchMenu = async () => {
      setIsLoadingMenu(true);
      try {
        const response = await fetch(SANITY_URL);
        if (!response.ok) throw new Error('Sanity fetch failed');
        const data = await response.json();
        const menuItems = (data.result && data.result.length) ? data.result : sampleMenu();
        // Simulate loading time for skeleton
        setTimeout(() => {
          setMenu(menuItems);
          setIsLoadingMenu(false);
        }, 1500);
      } catch (error) {
        console.warn('Could not fetch menu from Sanity — using fallback', error);
        setMenu(sampleMenu());
        setIsLoadingMenu(false);
      }
    };
    fetchMenu();
  }, []);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('foodie_cart');
      if (savedCart) setCart(JSON.parse(savedCart));
    } catch (e) { console.error('Failed to load cart from localStorage', e); }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('foodie_cart', JSON.stringify(cart));
    } catch (e) { console.error('Failed to save cart to localStorage', e); }
  }, [cart]);

  const addToCart = useCallback((item: MenuItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(ci => ci.id === item.id);
      if (existingItem) {
        return prevCart.map(ci => ci.id === item.id ? { ...ci, qty: ci.qty + 1 } : ci);
      }
      return [...prevCart, { id: item.id, name: item.name, price: item.price, qty: 1 }];
    });
  }, []);

  const changeQty = useCallback((id: string, delta: number) => {
    setCart(prevCart => {
      const item = prevCart.find(ci => ci.id === id);
      if (!item) return prevCart;
      const newQty = item.qty + delta;
      if (newQty <= 0) return prevCart.filter(ci => ci.id !== id);
      return prevCart.map(ci => ci.id === id ? { ...ci, qty: newQty } : ci);
    });
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  if (appState === 'splash') {
    return <SplashScreen onGetStarted={() => setAppState('main')} />;
  }
  
  return (
    <div className="min-h-screen">
      <Header cartItemCount={totalCartItems} onCartClick={() => setIsCartOpen(true)} />
      
      <div className="max-w-[1200px] mx-auto my-6 px-4">
        <div className="glass-panel rounded-xl p-5 shadow-lg mb-8">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="font-extrabold text-lg text-white">Order Hot & Fresh — Delivered to your Door Step</div>
              <div className="text-sm text-gray-400">Open now • Delivery in 30–45 min</div>
            </div>
            <div className="text-gray-400">Select items, share live location and send order directly to merchant's WhatsApp.</div>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
        <main>
          <Menu menu={menu} isLoading={isLoadingMenu} addToCart={addToCart} changeQty={changeQty} cart={cart} />
        </main>
        <aside className="hidden lg:block lg:sticky lg:top-24">
           <Cart cart={cart} changeQty={changeQty} clearCart={clearCart} isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </aside>
      </div>

      <Cart cart={cart} changeQty={changeQty} clearCart={clearCart} isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} isMobile />

      {totalCartItems > 0 && !isCartOpen && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="lg:hidden fixed right-4 bottom-4 btn-gradient text-white rounded-full h-14 w-14 font-extrabold flex items-center justify-center z-50 cursor-pointer shadow-lg animate-pulse-red"
        >
          <i className="fas fa-shopping-cart text-lg"></i>
          <span className="absolute -top-1 -right-1 bg-white text-red-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">{totalCartItems}</span>
        </button>
      )}
    </div>
  );
};

export default App;