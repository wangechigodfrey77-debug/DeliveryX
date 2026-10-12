import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Product, DeliveryLocation } from '../types';
import { CATEGORIES, INITIAL_PRODUCTS } from '../data/seedData';
import { ProductCard } from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import { Search, Filter, MapPin, X, Package } from 'lucide-react';

export const ProductList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedLocation } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const categoryFilter = searchParams.get('category') || 'All';
  const searchQuery = searchParams.get('search') || '';
  const locationFilter = searchParams.get('location') || selectedLocation;
  const freeDeliveryOnly = searchParams.get('freeDelivery') === 'true';

  useEffect(() => {
    const productsRef = collection(db, 'products');
    const q = query(productsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: Product[] = [];
      snapshot.forEach(docSnap => {
        items.push({ id: docSnap.id, ...docSnap.data() } as Product);
      });

      if (items.length === 0) {
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

  const handleCategoryChange = (catName: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (catName === 'All') {
      newParams.delete('category');
    } else {
      newParams.set('category', catName);
    }
    setSearchParams(newParams);
  };

  const handleLocationChange = (loc: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (loc === 'All') {
      newParams.delete('location');
    } else {
      newParams.set('location', loc);
    }
    setSearchParams(newParams);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const newParams = new URLSearchParams(searchParams);
    if (val) {
      newParams.set('search', val);
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  };

  // Filter logic
  const filteredProducts = products.filter(p => {
    if (categoryFilter !== 'All' && p.category !== categoryFilter) return false;
    if (locationFilter !== 'All' && p.location !== locationFilter && p.location !== 'All') return false;
    if (freeDeliveryOnly && !p.freeDelivery) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      const matchCat = p.category.toLowerCase().includes(q);
      const matchSeller = p.sellerName.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchCat && !matchSeller) return false;
    }
    return true;
  });

  const locations: DeliveryLocation[] = ['All', 'Karatina', 'Mathira', 'Tumutumu'];

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header & Search */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-black text-slate-900">Marketplace Catalog</h1>
              <p className="text-xs text-slate-500 mt-1">Browse verified vendors across Mathira, Karatina & Tumutumu</p>
            </div>

            <div className="w-full md:w-auto flex items-center gap-3">
              <div className="relative flex-1 md:w-80">
                <input 
                  type="text" 
                  placeholder="Search products or vendors..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl py-2.5 pl-9 pr-4 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                {searchQuery && (
                  <button 
                    onClick={() => {
                      const p = new URLSearchParams(searchParams);
                      p.delete('search');
                      setSearchParams(p);
                    }}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5 mr-2">
              <Filter className="w-3.5 h-3.5 text-emerald-600" />
              Zone:
            </span>
            {locations.map(loc => (
              <button
                key={loc}
                onClick={() => handleLocationChange(loc)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${locationFilter === loc ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                {loc === 'All' ? 'All Zones' : loc}
              </button>
            ))}

            <div className="h-6 w-px bg-slate-200 mx-2 hidden sm:block"></div>

            <label className="flex items-center gap-2 cursor-pointer bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700">
              <input 
                type="checkbox" 
                checked={freeDeliveryOnly}
                onChange={(e) => {
                  const p = new URLSearchParams(searchParams);
                  if (e.target.checked) p.set('freeDelivery', 'true');
                  else p.delete('freeDelivery');
                  setSearchParams(p);
                }}
                className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
              />
              <span>Free Delivery</span>
            </label>
          </div>
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          <button
            onClick={() => handleCategoryChange('All')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${categoryFilter === 'All' ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'}`}
          >
            All Categories
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.name)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${categoryFilter === cat.name ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
              <div key={n} className="bg-white rounded-2xl p-4 border border-slate-100 h-72 animate-pulse">
                <div className="w-full h-40 bg-slate-200 rounded-xl mb-4"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 shadow-sm">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No products found matching your criteria</h3>
            <p className="text-xs text-slate-500 mt-1">Try resetting filters or search query.</p>
            <button 
              onClick={() => setSearchParams({})}
              className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md"
            >
              Reset Filters
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
    </div>
  );
};
