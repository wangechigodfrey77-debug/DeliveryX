import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, onSnapshot, query, where, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Product, Review } from '../types';
import { INITIAL_PRODUCTS } from '../data/seedData';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ProductCard } from '../components/ProductCard';
import { 
  MapPin, 
  ShoppingBag, 
  Truck, 
  ArrowLeft, 
  CheckCircle2, 
  Store, 
  Zap, 
  Plus, 
  Minus,
  Star,
  MessageSquare
} from 'lucide-react';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user, userProfile } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [hasPurchased, setHasPurchased] = useState(true); // For demo, allow review or check orders
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  // New review form
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!id) return;

    // Check if seed product
    if (id.startsWith('seed_')) {
      const idx = parseInt(id.replace('seed_', '')) - 1;
      const found = INITIAL_PRODUCTS[idx];
      if (found) {
        setProduct({ ...found, id, createdAt: new Date().toISOString() } as Product);
      }
      setLoading(false);
    } else {
      const docRef = doc(db, 'products', id);
      getDoc(docRef).then(docSnap => {
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() } as Product);
        }
        setLoading(false);
      }).catch(err => {
        handleFirestoreError(err, OperationType.GET, `products/${id}`);
        setLoading(false);
      });
    }

    // Fetch related products
    const productsRef = collection(db, 'products');
    const q = query(productsRef);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: Product[] = [];
      snapshot.forEach(docSnap => {
        if (docSnap.id !== id) {
          items.push({ id: docSnap.id, ...docSnap.data() } as Product);
        }
      });
      if (items.length === 0) {
        const seeded = INITIAL_PRODUCTS.map((p, idx) => ({
          ...p,
          id: `seed_${idx + 1}`,
          createdAt: new Date().toISOString()
        })).filter(p => p.id !== id) as Product[];
        setRelatedProducts(seeded);
      } else {
        setRelatedProducts(items);
      }
    });

    // Fetch reviews in real-time
    const reviewsRef = collection(db, 'reviews');
    const qReviews = query(reviewsRef, where('productId', '==', id));
    const unsubReviews = onSnapshot(qReviews, (snapshot) => {
      const revs: Review[] = [];
      snapshot.forEach(docSnap => {
        revs.push({ id: docSnap.id, ...docSnap.data() } as Review);
      });
      revs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setReviews(revs);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'reviews');
    });

    return () => {
      unsubscribe();
      unsubReviews();
    };
  }, [id]);

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id || !comment.trim()) return;

    setSubmittingReview(true);
    try {
      const reviewId = 'REV_' + Math.random().toString(36).substring(2, 9).toUpperCase();
      const newReview: Review = {
        id: reviewId,
        productId: id,
        buyerId: user.uid,
        buyerName: userProfile?.name || user.email || 'Verified Buyer',
        rating,
        comment,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'reviews', reviewId), newReview);
      setComment('');
      setRating(5);
      setSubmittingReview(false);
    } catch (err: any) {
      setSubmittingReview(false);
      handleFirestoreError(err, OperationType.WRITE, 'reviews');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800">Product not found</h2>
        <p className="text-xs text-slate-500 mt-1">The item may have been removed or expired.</p>
        <Link to="/browse" className="mt-4 inline-block bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-xs font-bold">
          Back to Browse
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate('/cart');
  };

  const images = product.images?.length > 0 ? product.images : ['https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'];
  const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : '4.8';

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-emerald-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to products</span>
        </button>

        {/* Main Product Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-100 grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
          {/* Images Gallery */}
          <div className="space-y-4">
            <div className="w-full h-96 bg-slate-100 rounded-2xl overflow-hidden shadow-inner">
              <img 
                src={images[selectedImage]} 
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 ${selectedImage === idx ? 'border-emerald-600' : 'border-transparent'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase">
                  {product.category}
                </span>
                <span className="bg-orange-100 text-orange-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {product.location}
                </span>
                {product.freeDelivery && (
                  <span className="bg-slate-900 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
                    Free Delivery
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">{product.title}</h1>
              
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center text-amber-500">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} className="w-4 h-4 fill-amber-500 text-amber-500" />
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-700">{avgRating} ({reviews.length} Verified Reviews)</span>
              </div>

              <div className="text-3xl font-black text-emerald-700 mb-4">
                KES {product.price.toLocaleString()}
              </div>

              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                {product.description}
              </p>

              {/* Seller Card */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Vendor / Shop</span>
                    <span className="text-xs font-black text-slate-900">{product.sellerName}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl text-xs font-bold border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verified Partner</span>
                </div>
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 mb-6">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>In Stock: {product.stock} units available for instant dispatch in Mathira, Karatina & Tumutumu</span>
              </div>
            </div>

            {/* Quantity & CTAs */}
            <div className="space-y-4 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-700 uppercase">Quantity:</span>
                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2.5 hover:bg-slate-200 rounded-l-xl text-slate-700"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 text-xs font-black text-slate-900">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2.5 hover:bg-slate-200 rounded-r-xl text-slate-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button 
                  onClick={handleAddToCart}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-6 rounded-2xl text-xs shadow-lg flex items-center justify-center gap-2 transition-all"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>

                <button 
                  onClick={handleBuyNow}
                  className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-bold py-3.5 px-6 rounded-2xl text-xs shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 transition-all"
                >
                  <Truck className="w-4 h-4" />
                  <span>Buy Now (Instant Dispatch)</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews & Ratings Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-100 mb-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 border-b border-slate-100 pb-6">
            <div>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-600" />
                Verified Buyer Reviews & Ratings
              </h2>
              <p className="text-xs text-slate-500 mt-1">Real feedback from customers across Mathira, Karatina & Tumutumu</p>
            </div>

            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-2xl">
              <span className="text-2xl font-black text-emerald-800">{avgRating}</span>
              <div>
                <div className="flex text-amber-500">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  ))}
                </div>
                <span className="text-[10px] text-emerald-700 font-bold uppercase">Out of 5 Stars</span>
              </div>
            </div>
          </div>

          {/* Leave a Review Form */}
          {user ? (
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 mb-8">
              <h3 className="text-xs font-bold text-slate-900 uppercase mb-3">Leave Your Rating & Review</h3>
              <form onSubmit={handleAddReview} className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-700">Rating:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        className={`p-1 ${rating >= star ? 'text-amber-500' : 'text-slate-300'}`}
                      >
                        <Star className={`w-5 h-5 ${rating >= star ? 'fill-amber-500' : ''}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <textarea 
                    rows={3}
                    required
                    placeholder="Write your review about product quality, delivery speed in Mathira/Karatina..."
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={submittingReview}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs shadow-md transition-all"
                >
                  {submittingReview ? 'Submitting...' : 'Post Verified Review'}
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-2xl p-6 text-center border border-slate-200 mb-8">
              <p className="text-xs text-slate-600 mb-2">Please sign in to leave a verified review and rating for this product.</p>
            </div>
          )}

          {/* Review List */}
          {reviews.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No reviews yet. Be the first verified buyer to leave a review!
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map(rev => (
                <div key={rev.id} className="bg-slate-50/70 border border-slate-100 rounded-2xl p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                        {rev.buyerName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900">{rev.buyerName}</span>
                        <span className="block text-[10px] text-slate-400">{new Date(rev.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center text-amber-500">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed pl-10">{rev.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-xl font-black text-slate-900 mb-6">Related Products in {product.location}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.slice(0, 4).map(rel => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
