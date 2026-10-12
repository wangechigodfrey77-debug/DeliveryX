import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, MapPin, CheckCircle2, Zap } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  return (
    <Link 
      to={`/product/${product.id}`}
      className="group bg-white rounded-2xl border border-slate-100 hover:border-emerald-300 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative"
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
        <span className="bg-white/90 backdrop-blur-md text-slate-800 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1 border border-slate-100">
          <MapPin className="w-3 h-3 text-orange-600" />
          {product.location}
        </span>
        {product.freeDelivery && (
          <span className="bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
            <Zap className="w-3 h-3 fill-white" />
            Free Delivery
          </span>
        )}
      </div>

      {/* Image Container */}
      <div className="w-full h-48 bg-slate-100 relative overflow-hidden">
        <img 
          src={product.images[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'} 
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </div>

      {/* Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wide">{product.category}</span>
          <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 mt-0.5">
            {product.title}
          </h3>
          <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1 truncate">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{product.sellerName}</span>
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-medium">Price</span>
            <span className="text-base font-black text-slate-900">
              KES {product.price.toLocaleString()}
            </span>
          </div>

          <button 
            onClick={handleAddToCart}
            className="bg-orange-600 hover:bg-orange-700 text-white p-2.5 rounded-xl shadow-md shadow-orange-600/20 group-hover:scale-105 transition-transform flex items-center justify-center"
            title="Add to Cart"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Link>
  );
};
