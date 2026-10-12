import React, { useState } from 'react';
import { X, MapPin, Phone, CheckCircle2, ShieldCheck, CreditCard } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { DeliveryLocation, Order } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (orderId: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user, userProfile } = useAuth();
  const { items, totalAmount, clearCart } = useCart();

  const [deliveryLocation, setDeliveryLocation] = useState<DeliveryLocation>(userProfile?.location || 'Karatina');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'cash'>('mpesa');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || items.length === 0) return;
    if (!address.trim() || !phone.trim()) {
      setError('Please provide delivery address and phone number.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const orderId = 'ORD_' + Math.random().toString(36).substring(2, 9).toUpperCase();
      // Group items by seller or create order per seller (for simplicity, we assign to first item's seller or primary)
      const sellerId = items[0]?.product.sellerId || 'demo_seller_1';

      const newOrder: Order = {
        id: orderId,
        buyerId: user.uid,
        buyerName: userProfile?.name || user.email || 'Customer',
        buyerPhone: phone,
        sellerId,
        items,
        totalAmount,
        status: 'Pending',
        deliveryLocation,
        deliveryAddress: address,
        createdAt: new Date().toISOString(),
      };

      const orderRef = doc(db, 'orders', orderId);
      await setDoc(orderRef, newOrder);

      await clearCart();
      setLoading(false);
      onSuccess(orderId);
      onClose();
    } catch (err: any) {
      setLoading(false);
      handleFirestoreError(err, OperationType.WRITE, 'orders');
    }
  };

  const locations: DeliveryLocation[] = ['Karatina', 'Mathira', 'Tumutumu'];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 relative animate-in fade-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Secure Checkout</h3>
              <p className="text-xs text-slate-500">DeliveryX Hyper-Local Dispatch</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-xl font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleCheckout} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Delivery Zone</label>
              <div className="relative flex items-center">
                <select
                  value={deliveryLocation}
                  onChange={e => setDeliveryLocation(e.target.value as DeliveryLocation)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
                >
                  {locations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
                <MapPin className="w-4 h-4 text-orange-600 absolute left-3" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Detailed Delivery Address / Landmark</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. Karatina Town near Equity Bank / Tumutumu High"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">M-PESA / Contact Phone Number</label>
              <div className="relative flex items-center">
                <input 
                  type="text" 
                  required 
                  placeholder="+254 712 345 678"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <Phone className="w-4 h-4 text-emerald-600 absolute left-3" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-2">Payment Method</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('mpesa')}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${paymentMethod === 'mpesa' ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold' : 'border-slate-200 bg-slate-50 text-slate-700'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase">M-PESA Express</span>
                    {paymentMethod === 'mpesa' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </div>
                  <span className="text-[10px] text-slate-500">STK Push on delivery</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${paymentMethod === 'cash' ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold' : 'border-slate-200 bg-slate-50 text-slate-700'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase">Cash on Delivery</span>
                    {paymentMethod === 'cash' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </div>
                  <span className="text-[10px] text-slate-500">Pay when order arrives</span>
                </button>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mt-4">
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span>Items Subtotal ({items.length}):</span>
                <span>KES {totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600 mb-2">
                <span>Hyper-Local Delivery Fee:</span>
                <span className="text-emerald-600 font-bold">FREE</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-black text-slate-900">
                <span>Total Amount:</span>
                <span className="text-emerald-700">KES {totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-bold py-3.5 px-4 rounded-2xl text-xs shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 transition-all"
            >
              <CreditCard className="w-4 h-4" />
              <span>{loading ? 'Placing Order...' : `Confirm Order (KES ${totalAmount.toLocaleString()})`}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
