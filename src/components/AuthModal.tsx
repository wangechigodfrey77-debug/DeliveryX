import React, { useState } from 'react';
import { X, Mail, Lock, User, Phone, MapPin, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DeliveryLocation } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState<DeliveryLocation>('Karatina');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        if (!name.trim() || !phone.trim()) {
          throw new Error('Please fill in your name and phone number.');
        }
        await signUpWithEmail(email, password, name, phone, location);
      } else {
        await signInWithEmail(email, password);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Google Sign-In failed.');
    } finally {
      setLoading(false);
    }
  };

  const locations: DeliveryLocation[] = ['Karatina', 'Mathira', 'Tumutumu'];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 relative animate-in fade-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-black text-2xl mx-auto flex items-center justify-center shadow-lg shadow-emerald-600/30 mb-3">
              DX
            </div>
            <h3 className="text-xl font-black text-slate-900">
              {isRegister ? 'Join DeliveryX Marketplace' : 'Welcome Back to DeliveryX'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {isRegister ? 'Shop or sell across Mathira, Karatina & Tumutumu' : 'Sign in to manage your orders and cart'}
            </p>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-xl font-medium">
              {error}
            </div>
          )}

          {/* Google Sign In */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full mb-5 flex items-center justify-center gap-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold py-3 px-4 rounded-2xl text-xs shadow-sm transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.13 0-5.78-2.11-6.73-4.96H1.18v3.15C3.15 21.32 7.23 24 12 24z"/>
              <path fill="#FBBC05" d="M5.27 14.24c-.25-.72-.38-1.5-.38-2.24s.13-1.52.38-2.24V6.6H1.18C.43 8.1 0 9.79 0 12s.43 3.9 1.18 5.4l4.09-3.16z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.23 0 3.15 2.68 1.18 6.6l4.09 3.15c.95-2.85 3.6-4.96 6.73-4.96z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="flex items-center my-4">
            <div className="flex-1 border-t border-slate-200"></div>
            <span className="px-3 text-[11px] font-bold text-slate-400 uppercase">or with email</span>
            <div className="flex-1 border-t border-slate-200"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {isRegister && (
              <>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Full Name</label>
                  <div className="relative flex items-center">
                    <input 
                      type="text" 
                      required 
                      placeholder="John Kamau"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Phone Number (M-PESA)</label>
                  <div className="relative flex items-center">
                    <input 
                      type="text" 
                      required 
                      placeholder="+254 712 345 678"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Primary Zone</label>
                  <div className="relative flex items-center">
                    <select
                      value={location}
                      onChange={e => setLocation(e.target.value as DeliveryLocation)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
                    >
                      {locations.map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3" />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Email Address</label>
              <div className="relative flex items-center">
                <input 
                  type="email" 
                  required 
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Password</label>
              <div className="relative flex items-center">
                <input 
                  type="password" 
                  required 
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3" />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold py-3 px-4 rounded-xl text-xs shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all"
            >
              <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={() => setIsRegister(!isRegister)}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
            >
              {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Create one"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
