import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { CartItem, LocationState } from '../types';
import { MERCHANT_FULL } from '../constants';

interface CartProps {
  cart: CartItem[];
  changeQty: (id: string, delta: number) => void;
  clearCart: () => void;
  isOpen: boolean;
  onClose: () => void;
  isMobile?: boolean;
}

// Helper hook to get the previous value of a prop or state
const usePrevious = <T,>(value: T): T | undefined => {
    // FIX: Provide an initial value of `undefined` to `useRef` to fix "Expected 1 arguments, but got 0" error.
    // The type argument is also updated to `T | undefined` to accommodate the initial `undefined` value.
    const ref = useRef<T | undefined>(undefined);
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
};


const Cart: React.FC<CartProps> = ({ cart, changeQty, clearCart, isOpen, onClose, isMobile = false }) => {
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [location, setLocation] = useState<LocationState>({ lat: null, lng: null, mapsUrl: null });
  const [locStatus, setLocStatus] = useState('Share your location for delivery.');
  const [orderMsg, setOrderMsg] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(null);

  const prevCart = usePrevious(cart);

  useEffect(() => {
    if (!prevCart) return; // Don't run on initial render

    let changedId: string | null = null;

    // Case 1: An item was added to the cart
    if (cart.length > prevCart.length) {
        const newItem = cart.find(item => !prevCart.some(p => p.id === item.id));
        changedId = newItem?.id || null;
    } else { // Case 2: Quantity of an existing item changed
        for (const currentItem of cart) {
            const previousItem = prevCart.find(p => p.id === currentItem.id);
            if (previousItem && currentItem.qty !== previousItem.qty) {
                changedId = currentItem.id;
                break;
            }
        }
    }
    
    if (changedId) {
        setHighlightedItemId(changedId);
        const timer = setTimeout(() => {
            setHighlightedItemId(null);
        }, 500); // Highlight duration in milliseconds
        return () => clearTimeout(timer); // Cleanup timer on unmount or re-run
    }
  }, [cart, prevCart]);

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  }, [cart]);

  const captureLocation = useCallback(() => {
    return new Promise<LocationState>((resolve, reject) => {
      if (!navigator.geolocation) {
        setLocStatus('Geolocation is not supported by your browser.');
        reject(new Error('Geolocation not supported'));
        return;
      }
      setIsLocating(true);
      setLocStatus('Getting your location...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            mapsUrl: `https://maps.google.com/?q=${position.coords.latitude},${position.coords.longitude}`,
          };
          setLocation(newLocation);
          setLocStatus('Location ready!');
          setIsLocating(false);
          resolve(newLocation);
        },
        (error) => {
          let msg = 'Could not get location. ';
          if (error.code === 1) msg += 'Permission denied.';
          else if (error.code === 2) msg += 'Position unavailable.';
          else if (error.code === 3) msg += 'Request timed out.';
          setLocStatus(msg);
          setIsLocating(false);
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    });
  }, []);

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and limit to 10 digits
    if (/^\d*$/.test(value) && value.length <= 10) {
      setCustomerMobile(value);
    }
  };

  const sendOrder = async () => {
    if (!customerName || !customerMobile) {
      setOrderMsg('Please enter your name and mobile number.');
      return;
    }
    if (cart.length === 0) {
      setOrderMsg('Your cart is empty. Please add items first.');
      return;
    }

    setIsSending(true);
    setOrderMsg('Processing your order...');
    
    let finalLocation = location;
    try {
        if (!location.lat) {
            finalLocation = await captureLocation();
        }
    } catch (e) {
        if (!customerAddress) {
            setOrderMsg('Could not get GPS. Allow location or enter a fallback address.');
            setIsSending(false);
            return;
        }
    }

    setOrderMsg('Building order message...');
    const lines = [
        '*📦 New Order — BHOJAN*',
        `*Customer:* ${customerName}`,
        `*Mobile:* ${customerMobile}`,
        customerAddress ? `*Address:* ${customerAddress}` : '',
        finalLocation.mapsUrl ? `*Location:* ${finalLocation.mapsUrl}` : '',
        '',
        '*Items:*',
        ...cart.map(it => `${it.name} × ${it.qty} — ₹${Math.round(it.price * it.qty)}`),
        '',
        `*Total:* ₹${Math.round(cartTotal)}`,
        '',
        'Please confirm and prepare for delivery. Thank you!'
    ];

    const text = encodeURIComponent(lines.filter(Boolean).join('\n'));
    const waUrl = `https://wa.me/${MERCHANT_FULL}?text=${text}`;

    window.open(waUrl, '_blank');
    
    setOrderMsg('Order sent! Opening WhatsApp...');
    clearCart();
    setCustomerName('');
    setCustomerMobile('');
    setCustomerAddress('');
    setLocation({ lat: null, lng: null, mapsUrl: null });
    setLocStatus('Share your location for delivery.');
    setTimeout(() => {
      onClose();
      setOrderMsg('');
    }, 2000);

    setIsSending(false);
  };
  
  const cartInnerContent = (
    <>
      <div className="flex-grow overflow-y-auto pr-2 flex flex-col gap-3 md:max-h-[300px]">
        {cart.length === 0 ? (
          <p className="text-gray-400">Cart is empty — add items from menu.</p>
        ) : (
          cart.map(item => (
            <div 
              key={item.id} 
              className={`flex justify-between items-center p-3 rounded-lg transition-colors duration-500 ease-out ${highlightedItemId === item.id ? 'bg-red-500/20' : 'bg-black/20'}`}
            >
              <div>
                <div className="font-bold text-white">{item.name}</div>
                <div className="text-sm text-gray-400">₹{Math.round(item.price)} × {item.qty}</div>
              </div>
              <div className="flex gap-2 items-center">
                <button onClick={() => changeQty(item.id, -1)} className="bg-white/10 text-white w-8 h-8 rounded-md cursor-pointer hover:bg-white/20">-</button>
                <button onClick={() => changeQty(item.id, 1)} className="bg-white/10 text-white w-8 h-8 rounded-md cursor-pointer hover:bg-white/20">+</button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-auto pt-4 border-t border-white/10">
        <div className="flex justify-between mt-2.5 font-extrabold text-lg text-white">
          <span>Total</span>
          <span>₹{Math.round(cartTotal)}</span>
        </div>
        
        <div className="mt-4 flex flex-col gap-4">
          <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full py-3 bg-transparent border-b-2 border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors" placeholder="Your name" />
          <input value={customerMobile} onChange={handleMobileChange} className="w-full py-3 bg-transparent border-b-2 border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors" placeholder="Your mobile (for merchant)" />
          <input value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} className="w-full py-3 bg-transparent border-b-2 border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors" placeholder="Address (optional fallback)" />
        </div>

        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <button onClick={captureLocation} disabled={isLocating || !!location.lat} className="flex-1 bg-transparent border-2 border-gray-700 text-gray-300 p-3 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors font-bold">
            {isLocating ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-location-dot"></i>}
            {location.lat ? ' Shared' : ' Location'}
          </button>
          <button onClick={sendOrder} disabled={isSending} className="flex-[2] btn-gradient text-white p-3 rounded-lg border-none cursor-pointer font-extrabold disabled:opacity-50">
            {isSending ? <i className="fas fa-spinner fa-spin"></i> : <i className="fab fa-whatsapp"></i>} Send Order
          </button>
        </div>
        
        <div className="mt-2 text-gray-400 text-xs text-center">
          {location.mapsUrl ? (
             <>Location Ready <a href={location.mapsUrl} target="_blank" rel="noopener noreferrer" className="text-red-500 font-bold">Open Map</a></>
          ) : locStatus}
        </div>
        {orderMsg && <div className="mt-2 text-sm text-center text-amber-500">{orderMsg}</div>}
      </div>
    </>
  );

  const desktopCart = (
    <div className="glass-panel rounded-xl p-5 shadow-lg h-full flex flex-col">
       <h2 className="font-extrabold text-xl mb-4 text-white">Your Cart</h2>
       {cartInnerContent}
    </div>
  );

  if (isMobile) {
    return (
      <div className={`lg:hidden fixed inset-0 z-[100] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/80" onClick={onClose}></div>
        <aside className={`fixed top-0 right-0 h-full w-full max-w-md bg-black/90 backdrop-blur-lg border-l border-white/10 flex flex-col transition-transform duration-300 ease-in-out z-[120] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <header className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
                 <h2 className="font-extrabold text-xl text-white">Your Cart</h2>
                 <button onClick={onClose} className="text-gray-400 hover:text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors">
                    <i className="fas fa-times text-xl"></i>
                 </button>
            </header>
            <div className="p-4 flex flex-col flex-grow overflow-y-auto">
              {cartInnerContent}
            </div>
        </aside>
      </div>
    );
  }

  return desktopCart;
};

export default Cart;