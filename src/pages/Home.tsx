import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Product } from '../types';
import { CATEGORIES, INITIAL_PRODUCTS } from '../data/seedData';
import { ProductCard } from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import { 
  Zap, 
  ShieldCheck, 
  Truck, 
  MapPin, 
  ArrowRight, 
  Wrench, 
  Hammer, 
  ShoppingBag, 
  Package, 
  Smartphone, 
  Home as HomeIcon, 
  HeartPulse
} from 'lucide-react';

export const Home: React.FC = () => {
  const { selectedLocation } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper to map icon names
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Wrench': return <Wrench className="w-5 h-5 text-emerald-600" />;
      case 'Hammer': return <Hammer className="w-5 h-5 text-emerald-600" />;
      case 'ShoppingBag': return <ShoppingBag className="w-5 h-5 text-emerald-600" />;
      case 'Package': return <Package className="w-5 h-5 text-emerald-600" />;
      case 'Smartphone': return <Smartphone className="w-5 h-5 text-emerald-600" />;
      case 'Truck': return <Truck className="w-5 h-5 text-emerald-600" />;
      case 'Home': return <HomeIcon className="w-5 h-5 text-emerald-600" />;
      default: return <HeartPulse className="w-5 h-5 text-emerald-600" />;
    }
  };

  useEffect(() => {
    const productsRef = collection(db, 'products');
    const q = query(productsRef, orderBy('createdAt', 'desc'), limit(20));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: Product[] = [];
      snapshot.forEach(docSnap => {
        items.push({ id: docSnap.id, ...docSnap.data() } as Product);
      });

      if (items.length === 0) {
        // Fallback to seed data if firestore is empty
        const seeded = INITIAL_PRODUCTS.map((p, idx) => ({
          ...p,
          id: `seed_${idx + 1}`,
          createdAt: new Date().toISOString()
        })) as Product[];
        setProducts(seeded);
      } else {
        setProducts(items);
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'products');
      // Fallback
      const seeded = INITIAL_PRODUCTS.map((p, idx) => ({
        ...p,
        id: `seed_${idx + 1}`,
        createdAt: new Date().toISOString()
      })) as Product[];
      setProducts(seeded);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredProducts = selectedLocation === 'All' 
    ? products 
    : products.filter(p => p.location === selectedLocation || p.location === 'All');

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-emerald-900 via-emerald-800 to-slate-900 text-white overflow-hidden py-16 lg:py-24">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-orange-600/90 text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-md shadow-orange-600/30">
                <span>Mathira • Karatina • Tumutumu Hyper-Local Marketplace</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none">
                Everything Delivered <span className="text-orange-500">Instantly</span> in Nyeri.
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
                Order hardware, construction cement, timber, fresh Karatina market produce, wholesale stock, and electronics delivered right to your door with real-time tracking.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <Link 
                  to="/browse"
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 px-7 rounded-2xl text-xs shadow-xl shadow-orange-600/30 flex items-center gap-2.5 transition-all transform hover:scale-105"
                >
                  <span>Explore Marketplace</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link 
                  to="/seller/register"
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 font-bold py-3.5 px-7 rounded-2xl text-xs transition-all"
                >
                  Become a Seller
                </Link>
              </div>

              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-emerald-700/50 text-xs">
                <div>
                  <span className="block font-black text-white text-lg">3 Zones</span>
                  <span className="text-slate-400">Mathira, Karatina & Tumutumu</span>
                </div>
                <div>
                  <span className="block font-black text-white text-lg">100% Live</span>
                  <span className="text-slate-400">Real-Time Firestore Sync</span>
                </div>
                <div>
                  <span className="block font-black text-white text-lg">M-PESA</span>
                  <span className="text-slate-400">Fast & Secure Payments</span>
                </div>
              </div>
            </div>

            {/* Hero Image Card */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10 aspect-[4/3] bg-slate-800">
                <img 
                  src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80" 
                  alt="DeliveryX Marketplace"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent flex flex-col justify-end p-6">
                  <span className="bg-emerald-600 text-white font-bold text-[10px] uppercase px-3 py-1 rounded-full w-max mb-2">Featured Hub</span>
                  <h3 className="text-lg font-black text-white">Karatina & Mathira Express Dispatch</h3>
                  <p className="text-xs text-slate-300">Connecting local hardware stores and markets directly to your home.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-black text-slate-900">Browse Categories</h2>
              <p className="text-xs text-slate-500">Everything you need across Mathira, Karatina, and Tumutumu</p>
            </div>
            <Link to="/browse" className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {CATEGORIES.map(cat => (
              <Link
                key={cat.id}
                to={`/browse?category=${encodeURIComponent(cat.name)}`}
                className="group bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 p-4 rounded-2xl flex flex-col items-center text-center transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  {getCategoryIcon(cat.iconName)}
                </div>
                <h3 className="text-xs font-bold text-slate-800 group-hover:text-emerald-800 line-clamp-1">{cat.name}</h3>
                <span className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{cat.description}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-slate-900">Popular Deliveries</h2>
              {selectedLocation !== 'All' && (
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-orange-600" />
                  {selectedLocation}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">Real-time inventory from verified local vendors</p>
          </div>

          <Link 
            to="/browse" 
            className="bg-slate-100 hover:bg-emerald-50 text-slate-800 hover:text-emerald-800 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors"
          >
            Browse All Catalog
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="bg-white rounded-2xl p-4 border border-slate-100 h-72 animate-pulse">
                <div className="w-full h-40 bg-slate-200 rounded-xl mb-4"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No products found in {selectedLocation}</h3>
            <p className="text-xs text-slate-500 mt-1">Try selecting "All Areas" or browse other categories.</p>
            <button 
              onClick={() => navigate('/browse')}
              className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md"
            >
              Browse All Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* Why DeliveryX Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-900 rounded-3xl p-8 lg:p-12 text-white shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-600 flex items-center justify-center shrink-0 shadow-lg">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold mb-1">Hyper-Local Speed</h3>
                <p className="text-xs text-slate-300 leading-relaxed">Dedicated riders stationed in Karatina, Mathira, and Tumutumu for instant dispatch.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-600 flex items-center justify-center shrink-0 shadow-lg">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold mb-1">Verified Vendors</h3>
                <p className="text-xs text-slate-300 leading-relaxed">Genuine hardware shops, wholesalers, and Karatina market farmers with guaranteed quality.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-600 flex items-center justify-center shrink-0 shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold mb-1">Real-Time Firebase Sync</h3>
                <p className="text-xs text-slate-300 leading-relaxed">Live inventory and instant order tracking with zero local storage constraints.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
