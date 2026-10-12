import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Truck, CheckCircle2 } from 'lucide-react';
import { CheckoutModal } from '../components/CheckoutModal';
import AuthModal from '../components/AuthModal';

export const CartPage: React.FC = () => {
  const { items, updateQuantity, removeFromCart, totalAmount, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const handleProceedToCheckout = () => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    setIsCheckoutOpen(true);
  };

  const handleOrderSuccess = (orderId: string) => {
    navigate(`/orders?success=${orderId}`);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 py-20">
        <div className="max-w-md mx-auto px-4 text-center bg-white rounded-3xl p-10 border border-slate-100 shadow-sm">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-2">Your Cart is Empty</h2>
          <p className="text-xs text-slate-500 mb-6">Explore our marketplace for hardware, groceries, and construction supplies in Mathira, Karatina & Tumutumu.</p>
          <Link 
            to="/browse"
            className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 text-white font-bold py-3 px-6 rounded-xl text-xs shadow-md inline-flex items-center gap-2"
          >
            <span>Start Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-black text-slate-900 mb-8">Shopping Cart ({items.length} items)</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => (
              <div 
                key={item.productId}
                className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <img 
                    src={item.product.images[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80'} 
                    alt={item.product.title}
                    className="w-20 h-20 rounded-xl object-cover bg-slate-100 shrink-0"
                  />
                  <div className="flex-1">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase">{item.product.category}</span>
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{item.product.title}</h3>
                    <p className="text-xs text-slate-500">Vendor: {item.product.sellerName}</p>
                    <p className="text-xs font-black text-slate-900 mt-1">KES {item.product.price.toLocaleString()} each</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6">
                  {/* Quantity Controls */}
                  <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                    <button 
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="p-2 hover:bg-slate-200 rounded-l-xl text-slate-700"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-black text-slate-900">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="p-2 hover:bg-slate-200 rounded-r-xl text-slate-700"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="text-sm font-black text-emerald-700">
                    KES {(item.product.price * item.quantity).toLocaleString()}
                  </span>

                  <button 
                    onClick={() => removeFromCart(item.productId)}
                    className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                    title="Remove Item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            <div className="flex justify-between items-center pt-2">
              <button 
                onClick={() => clearCart()}
                className="text-xs font-bold text-red-600 hover:text-red-700"
              >
                Clear Cart
              </button>
              <Link to="/browse" className="text-xs font-bold text-emerald-700 hover:text-emerald-800">
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* Cart Summary */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm h-max space-y-6">
            <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-4">Order Summary</h3>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>KES {totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Hyper-Local Delivery</span>
                <span className="text-emerald-600 font-bold">FREE</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Time</span>
                <span className="font-bold text-slate-900">30 - 45 mins</span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
              <span className="text-sm font-black text-slate-900">Total</span>
              <span className="text-lg font-black text-emerald-700">KES {totalAmount.toLocaleString()}</span>
            </div>

            <button 
              onClick={handleProceedToCheckout}
              className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-bold py-3.5 px-4 rounded-2xl text-xs shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 transition-all"
            >
              <Truck className="w-4 h-4" />
              <span>Proceed to Checkout</span>
            </button>

            <div className="space-y-2 pt-4 border-t border-slate-100 text-[11px] text-slate-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Secure real-time Firebase sync</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>M-PESA / Cash on Delivery accepted</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
        onSuccess={handleOrderSuccess} 
      />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
};
