import React, { useEffect, useState, useRef } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Order } from '../types';
import { Bell, Truck, X } from 'lucide-react';

interface Toast {
  id: string;
  title: string;
  message: string;
  type: 'status_change' | 'new_order';
  timestamp: Date;
}

export const ToastContainer: React.FC = () => {
  const { user, userProfile } = useAuth();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const previousStatusesRef = useRef<Map<string, string>>(new Map());
  const initialLoadRef = useRef<boolean>(true);

  useEffect(() => {
    if (!user) {
      previousStatusesRef.current.clear();
      initialLoadRef.current = true;
      return;
    }

    const ordersRef = collection(db, 'orders');
    const qBuyer = query(ordersRef, where('buyerId', '==', user.uid));
    const qSeller = query(ordersRef, where('sellerId', '==', user.uid));

    const handleSnapshot = (snapshot: any, isBuyer: boolean) => {
      snapshot.docChanges().forEach((change: any) => {
        const orderData = { id: change.doc.id, ...change.doc.data() } as Order;
        const orderId = orderData.id;
        const currentStatus = orderData.status;

        if (change.type === 'added') {
          // Store initial status without triggering toast on first load
          previousStatusesRef.current.set(orderId, currentStatus);
          if (!isBuyer && !initialLoadRef.current) {
            addToast({
              id: `new_ord_${orderId}_${Date.now()}`,
              title: 'New Customer Order!',
              message: `Order ${orderId} received for KES ${orderData.totalAmount?.toLocaleString()}`,
              type: 'new_order',
              timestamp: new Date()
            });
          }
        } else if (change.type === 'modified') {
          const prevStatus = previousStatusesRef.current.get(orderId);
          if (prevStatus && prevStatus !== currentStatus) {
            const title = isBuyer ? 'Order Status Updated!' : 'Order Status Changed';
            const message = isBuyer
              ? `Your order ${orderId} is now: ${currentStatus}`
              : `Order ${orderId} status changed to ${currentStatus}`;

            addToast({
              id: `${orderId}_${Date.now()}`,
              title,
              message,
              type: 'status_change',
              timestamp: new Date()
            });
          }
          previousStatusesRef.current.set(orderId, currentStatus);
        }
      });
      initialLoadRef.current = false;
    };

    const unsubBuyer = onSnapshot(qBuyer, (snap) => handleSnapshot(snap, true), (err) => {
      handleFirestoreError(err, OperationType.GET, 'orders');
    });

    const unsubSeller = onSnapshot(qSeller, (snap) => handleSnapshot(snap, false), (err) => {
      handleFirestoreError(err, OperationType.GET, 'orders');
    });

    return () => {
      unsubBuyer();
      unsubSeller();
    };
  }, [user, userProfile]);

  const addToast = (toast: Toast) => {
    setToasts(prev => [toast, ...prev.slice(0, 4)]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== toast.id));
    }, 6000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full px-4 sm:px-0">
      {toasts.map(toast => (
        <div 
          key={toast.id}
          className="bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-emerald-500/30 flex items-start gap-3 animate-in slide-in-from-bottom-5 duration-300 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-emerald-500 to-orange-500"></div>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
            {toast.type === 'status_change' ? <Truck className="w-5 h-5 animate-bounce" /> : <Bell className="w-5 h-5" />}
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold text-white">
              <span>{toast.title}</span>
            </h4>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">{toast.message}</p>
            <span className="text-[9px] text-slate-500 mt-1 block">{toast.timestamp.toLocaleTimeString()}</span>
          </div>
          <button 
            onClick={() => removeToast(toast.id)}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
