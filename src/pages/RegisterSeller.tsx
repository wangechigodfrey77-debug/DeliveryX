import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DeliveryLocation } from '../types';
import { Store, MapPin, Phone, FileText, CheckCircle2, ArrowRight } from 'lucide-react';

export const RegisterSeller: React.FC = () => {
  const { user, userProfile, upgradeToSeller } = useAuth();
  const navigate = useNavigate();

  const [businessName, setBusinessName] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [location, setLocation] = useState<DeliveryLocation>(userProfile?.location || 'Karatina');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800">Please Sign In First</h2>
        <p className="text-xs text-slate-500 mt-1">You must be signed in to register a seller account.</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !phone.trim()) {
      setError('Please provide your business name and phone number.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await upgradeToSeller(businessName, description, phone, location);
      navigate('/seller');
    } catch (err: any) {
      setError(err.message || 'Failed to register seller profile.');
      setLoading(false);
    }
  };

  const locations: DeliveryLocation[] = ['Karatina', 'Mathira', 'Tumutumu'];

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-xl mx-auto px-4">
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-slate-100">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-orange-600 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-orange-600/30">
              <Store className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black text-slate-900">Become a DeliveryX Seller</h1>
            <p className="text-xs text-slate-500 mt-1">List hardware, construction materials, groceries, or wholesale products across Mathira, Karatina & Tumutumu.</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 text-xs p-3.5 rounded-xl font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Business / Shop Name</label>
              <div className="relative flex items-center">
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Karatina Hardware & Builders Ltd"
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <Store className="w-4 h-4 text-slate-400 absolute left-3" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Business Location / Zone</label>
              <div className="relative flex items-center">
                <select
                  value={location}
                  onChange={e => setLocation(e.target.value as DeliveryLocation)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
                >
                  {locations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
                <MapPin className="w-4 h-4 text-orange-600 absolute left-3" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Business Phone Number</label>
              <div className="relative flex items-center">
                <input 
                  type="text" 
                  required 
                  placeholder="+254 712 345 678"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <Phone className="w-4 h-4 text-emerald-600 absolute left-3" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Business Description</label>
              <div className="relative">
                <textarea 
                  rows={3}
                  placeholder="Describe what you sell (e.g. wholesale maize flour, cement, hardware tools)..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center gap-3 text-xs text-emerald-900">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
              <span>Sellers get instant access to product uploading, inventory control, and real-time order dispatch.</span>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 text-white font-bold py-3.5 px-4 rounded-2xl text-xs shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 transition-all"
            >
              <span>{loading ? 'Activating Account...' : 'Complete Seller Registration'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
