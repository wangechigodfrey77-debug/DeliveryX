import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  Search, 
  MapPin, 
  User as UserIcon, 
  Store, 
  Package, 
  LogOut, 
  Menu, 
  X,
  Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { DeliveryLocation } from '../types';
import AuthModal from './AuthModal';

export const Navbar: React.FC = () => {
  const { user, userProfile, signOut, selectedLocation, updateLocationPreference } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const locations: DeliveryLocation[] = ['All', 'Karatina', 'Mathira', 'Tumutumu'];

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-emerald-100">
      {/* Top Banner */}
      <div className="bg-emerald-800 text-emerald-50 text-xs py-1 px-4 text-center font-medium flex items-center justify-center gap-2">
        <Zap className="w-3.5 h-3.5 text-orange-400 fill-orange-400 animate-pulse" />
        <span>Lightning Fast Delivery across Mathira • Karatina • Tumutumu</span>
        <span className="hidden md:inline bg-orange-600 text-white px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ml-2">Zero Local Storage</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center shadow-md shadow-emerald-600/20 text-white font-black text-xl group-hover:scale-105 transition-transform">
            DX
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-slate-900">Delivery<span className="text-orange-600">X</span></span>
            <span className="block text-[10px] text-slate-500 font-semibold tracking-wider uppercase">Hyper-Local Marketplace</span>
          </div>
        </Link>

        {/* Location Selector */}
        <div className="relative hidden md:block">
          <button 
            onClick={() => setLocationDropdownOpen(!locationDropdownOpen)}
            className="flex items-center gap-2 bg-slate-100 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
          >
            <MapPin className="w-4 h-4 text-orange-600" />
            <div className="text-left">
              <span className="block text-[9px] text-slate-400 uppercase">Delivery Area</span>
              <span className="text-slate-800 font-bold">{selectedLocation}</span>
            </div>
          </button>

          {locationDropdownOpen && (
            <div className="absolute top-full mt-2 w-44 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50">
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase">Select Target Zone</div>
              {locations.map(loc => (
                <button
                  key={loc}
                  onClick={() => {
                    updateLocationPreference(loc);
                    setLocationDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs font-medium hover:bg-emerald-50 flex items-center justify-between ${selectedLocation === loc ? 'text-emerald-700 bg-emerald-50 font-bold' : 'text-slate-700'}`}
                >
                  <span>{loc === 'All' ? 'All Areas' : loc}</span>
                  {selectedLocation === loc && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-lg hidden lg:flex items-center relative">
          <input 
            type="text" 
            placeholder="Search hardware, groceries, construction materials, wholesale..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-100 border border-slate-200 rounded-full py-2.5 pl-10 pr-24 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
          <button 
            type="submit" 
            className="absolute right-1.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-sm transition-all"
          >
            Search
          </button>
        </form>

        {/* Action Nav Links */}
        <div className="flex items-center gap-3">
          {/* Cart */}
          <Link 
            to="/cart" 
            className="relative p-2.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 transition-colors flex items-center gap-2"
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="hidden sm:inline text-xs font-bold">Cart</span>
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-orange-600 text-white font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-sm animate-bounce">
                {totalItems}
              </span>
            )}
          </Link>

          {/* User / Auth */}
          {user && userProfile ? (
            <div className="flex items-center gap-2">
              {userProfile.role === 'seller' ? (
                <Link 
                  to="/seller" 
                  className="hidden sm:flex items-center gap-1.5 bg-orange-600 hover:bg-orange-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm shadow-orange-600/20 transition-all"
                >
                  <Store className="w-4 h-4" />
                  <span>Seller Dashboard</span>
                </Link>
              ) : (
                <Link 
                  to="/orders" 
                  className="hidden sm:flex items-center gap-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors"
                >
                  <Package className="w-4 h-4 text-emerald-600" />
                  <span>Orders</span>
                </Link>
              )}

              <div className="relative group">
                <button className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center border border-emerald-200">
                    {userProfile.name.charAt(0).toUpperCase()}
                  </div>
                </button>
                
                <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 hidden group-hover:block z-50">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 truncate">{userProfile.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{userProfile.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                      {userProfile.role} • {userProfile.location}
                    </span>
                  </div>

                  <Link to="/orders" className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                    <Package className="w-4 h-4 text-slate-400" /> My Orders
                  </Link>

                  {userProfile.role === 'seller' ? (
                    <Link to="/seller" className="w-full text-left px-4 py-2 text-xs font-medium text-orange-600 hover:bg-orange-50 flex items-center gap-2">
                      <Store className="w-4 h-4" /> Seller Dashboard
                    </Link>
                  ) : (
                    <Link to="/seller/register" className="w-full text-left px-4 py-2 text-xs font-medium text-orange-600 hover:bg-orange-50 flex items-center gap-2">
                      <Store className="w-4 h-4" /> Become a Seller
                    </Link>
                  )}

                  <button 
                    onClick={() => signOut()}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-slate-100 mt-1"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setIsAuthOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
            >
              <UserIcon className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-xl"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-3">
          <form onSubmit={handleSearch} className="flex items-center relative">
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-sm text-slate-800 focus:outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3" />
          </form>

          <div className="py-2 border-y border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Delivery Area:</p>
            <div className="grid grid-cols-2 gap-2">
              {locations.map(loc => (
                <button
                  key={loc}
                  onClick={() => {
                    updateLocationPreference(loc);
                    setMobileMenuOpen(false);
                  }}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border text-center ${selectedLocation === loc ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-700 border-slate-200'}`}
                >
                  {loc === 'All' ? 'All Areas' : loc}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-xs font-semibold text-slate-700">Home</Link>
            <Link to="/browse" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-xs font-semibold text-slate-700">Browse All Products</Link>
            {user && (
              <>
                <Link to="/orders" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-xs font-semibold text-slate-700">My Orders</Link>
                {userProfile?.role === 'seller' ? (
                  <Link to="/seller" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-xs font-semibold text-orange-600">Seller Dashboard</Link>
                ) : (
                  <Link to="/seller/register" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-xs font-semibold text-orange-600">Register as Seller</Link>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </header>
  );
};
