import React from 'react';
import { MapPin, Phone, Mail, ShieldCheck, Zap, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-orange-500 flex items-center justify-center text-white font-black text-xl shadow-lg">
                DX
              </div>
              <span className="text-xl font-black text-white tracking-tight">Delivery<span className="text-orange-500">X</span></span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              The premier hyper-local multi-vendor delivery marketplace for Mathira, Karatina, and Tumutumu. From hardware and construction materials to fresh farm produce and groceries.
            </p>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Local Vendors & Secure Delivery</span>
            </div>
          </div>

          {/* Delivery Zones */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-500" />
              Delivery Zones
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Karatina Town & Suburbs</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Mathira Constituency (Kirimukuyu, Magutu, Iriaini)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Tumutumu Mission & Higher Ridge</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Express Courier Hubs</span>
              </li>
            </ul>
          </div>

          {/* Popular Categories */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange-500" />
              Top Categories
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><a href="/browse?category=Hardware+%26+Tools" className="hover:text-emerald-400 transition-colors">Hardware & Tools</a></li>
              <li><a href="/browse?category=Construction+Materials" className="hover:text-emerald-400 transition-colors">Construction Materials (Cement, Timber)</a></li>
              <li><a href="/browse?category=Food+%26+Groceries" className="hover:text-emerald-400 transition-colors">Fresh Food & Karatina Groceries</a></li>
              <li><a href="/browse?category=Wholesale+%26+Bulk" className="hover:text-emerald-400 transition-colors">Wholesale & Bulk Supplies</a></li>
              <li><a href="/browse?category=Electronics+%26+Phones" className="hover:text-emerald-400 transition-colors">Electronics & Mobile Phones</a></li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Customer Support</h4>
            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>+254 700 DELIVERY (0700 335 483)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400" />
                <span>support@deliveryx.co.ke</span>
              </li>
              <li className="pt-2">
                <p className="text-[11px] text-slate-500">Operating Hours: Mon - Sat (7:00 AM - 8:00 PM)</p>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} DeliveryX Kenya. All rights reserved. Proudly serving Mathira, Karatina & Tumutumu.</p>
          <div className="flex items-center gap-1">
            <span>Built with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 mx-0.5" />
            <span>for Nyeri County communities.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
