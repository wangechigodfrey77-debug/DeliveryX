import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Order, OrderStatus } from '../types';
import { Package, Clock, Truck, CheckCircle2, MapPin, Search, Filter, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import OrderProgressTracker from '../components/OrderProgressTracker';

export const OrdersPage: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('buyerId', '==', user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: Order[] = [];
      snapshot.forEach(docSnap => {
        items.push({ id: docSnap.id, ...docSnap.data() } as Order);
      });
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(items);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'orders');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800">Please Sign In</h2>
        <p className="text-xs text-slate-500 mt-1">Sign in to view your orders and track deliveries.</p>
      </div>
    );
  }

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'Pending':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1"><Clock className="w-3 h-3" /> Pending Confirmation</span>;
      case 'Confirmed':
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Order Confirmed</span>;
      case 'Out for Delivery':
        return <span className="bg-orange-100 text-orange-800 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1"><Truck className="w-3 h-3 animate-pulse" /> Out for Delivery</span>;
      case 'Delivered':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Delivered Successfully</span>;
      default:
        return <span className="bg-slate-100 text-slate-800 text-[10px] font-bold px-3 py-1 rounded-full">{status}</span>;
    }
  };

  const statuses: ('All' | OrderStatus)[] = ['All', 'Pending', 'Confirmed', 'Out for Delivery', 'Delivered'];

  const filteredOrders = orders.filter(order => {
    if (statusFilter !== 'All' && order.status !== statusFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = order.id.toLowerCase().includes(q);
      const matchProduct = order.items.some(item => item.product.title.toLowerCase().includes(q));
      if (!matchId && !matchProduct) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-900">My Orders & Live Tracking</h1>
            <p className="text-xs text-slate-500 mt-1">Real-time status updates across Mathira, Karatina & Tumutumu</p>
          </div>
          <Link to="/browse" className="bg-slate-100 hover:bg-emerald-50 text-slate-800 hover:text-emerald-800 text-xs font-bold px-4 py-2.5 rounded-xl">
            Continue Shopping
          </Link>
        </div>

        {/* Search & Filters Bar */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-8 space-y-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <input 
                type="text" 
                placeholder="Search by Order ID (e.g. ORD_...) or product name..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 border border-slate-200 rounded-xl py-2.5 pl-10 pr-10 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5 mr-2">
              <Filter className="w-3.5 h-3.5 text-emerald-600" />
              Status:
            </span>
            {statuses.map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${statusFilter === st ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(n => (
              <div key={n} className="bg-white rounded-3xl p-6 h-40 animate-pulse border border-slate-100"></div>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 shadow-sm">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No matching orders found</h3>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your search query or status filter.</p>
            <button 
              onClick={() => { setSearchQuery(''); setStatusFilter('All'); }}
              className="mt-4 bg-emerald-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map(order => (
              <div key={order.id} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Order Reference</span>
                    <h3 className="text-sm font-black text-slate-900">{order.id}</h3>
                    <span className="text-[11px] text-slate-500">Placed on {new Date(order.createdAt).toLocaleString()}</span>
                  </div>
                  <div>
                    {getStatusBadge(order.status)}
                  </div>
                </div>

                {/* Visual Step-by-Step Progress Tracker */}
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase mb-3">Live Delivery Status</h4>
                  <OrderProgressTracker status={order.status} />
                </div>

                {/* Items preview */}
                <div className="space-y-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <img src={item.product.images[0]} alt="" className="w-12 h-12 rounded-xl object-cover bg-slate-100" />
                        <div>
                          <p className="font-bold text-slate-900">{item.product.title}</p>
                          <p className="text-slate-500">Qty: {item.quantity} × KES {item.product.price.toLocaleString()}</p>
                        </div>
                      </div>
                      <span className="font-black text-slate-900">KES {(item.product.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {/* Delivery details & Total */}
                <div className="bg-slate-50 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-slate-200">
                  <div className="flex items-center gap-2 text-xs text-slate-700">
                    <MapPin className="w-4 h-4 text-orange-600 shrink-0" />
                    <span><strong>Zone:</strong> {order.deliveryLocation} • {order.deliveryAddress}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Amount</span>
                    <span className="text-base font-black text-emerald-700">KES {order.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
