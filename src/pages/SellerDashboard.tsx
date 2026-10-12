import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Product, Order, DeliveryLocation } from '../types';
import { CATEGORIES } from '../data/seedData';
import { compressImage } from '../utils/imageCompressor';
import SellerAnalytics from '../components/SellerAnalytics';
import { 
  Store, 
  Package, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Truck, 
  MapPin, 
  ArrowRight,
  Upload,
  BarChart2
} from 'lucide-react';

export const SellerDashboard: React.FC = () => {
  const { user, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'addProduct' | 'analytics'>('products');

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Product Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].name);
  const [location, setLocation] = useState<DeliveryLocation>(userProfile?.sellerInfo?.location || 'Karatina');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [compressing, setCompressing] = useState(false);
  const [freeDelivery, setFreeDelivery] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user || userProfile?.role !== 'seller') {
      setLoading(false);
      return;
    }

    // Products listener
    const productsRef = collection(db, 'products');
    const qProducts = query(productsRef, where('sellerId', '==', user.uid));
    const unsubProducts = onSnapshot(qProducts, (snapshot) => {
      const items: Product[] = [];
      snapshot.forEach(docSnap => {
        items.push({ id: docSnap.id, ...docSnap.data() } as Product);
      });
      setProducts(items);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'products');
    });

    // Orders listener
    const ordersRef = collection(db, 'orders');
    const qOrders = query(ordersRef, where('sellerId', '==', user.uid));
    const unsubOrders = onSnapshot(qOrders, (snapshot) => {
      const items: Order[] = [];
      snapshot.forEach(docSnap => {
        items.push({ id: docSnap.id, ...docSnap.data() } as Order);
      });
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'orders');
    });

    return () => {
      unsubProducts();
      unsubOrders();
    };
  }, [user, userProfile]);

  if (!user || userProfile?.role !== 'seller') {
    return (
      <div className="min-h-screen bg-slate-50 py-20 text-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <Store className="w-12 h-12 text-orange-600 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-800">Seller Access Required</h2>
          <p className="text-xs text-slate-500 mt-1 mb-6">You must register as a seller to access this dashboard.</p>
          <a href="/seller/register" className="bg-orange-600 text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-md">
            Register as Seller Now
          </a>
        </div>
      </div>
    );
  }

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCompressing(true);
    try {
      // Compress image client-side before uploading or storing
      const compressedDataUrl = await compressImage(file, 800, 800, 0.8);
      setImageUrl(compressedDataUrl);
      setImagePreview(compressedDataUrl);
    } catch (err) {
      console.error('Image compression failed:', err);
    } finally {
      setCompressing(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price || !stock) return;

    setSubmitting(true);
    try {
      const productId = 'PRD_' + Math.random().toString(36).substring(2, 9).toUpperCase();
      const newProduct: Product = {
        id: productId,
        title,
        description,
        price: parseFloat(price) || 0,
        stock: parseInt(stock) || 0,
        category,
        location,
        images: [imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'],
        sellerId: user.uid,
        sellerName: userProfile?.sellerInfo?.businessName || userProfile?.name || 'Seller',
        createdAt: new Date().toISOString(),
        freeDelivery,
        tags: [category.toLowerCase(), location.toLowerCase()]
      };

      const docRef = doc(db, 'products', productId);
      await setDoc(docRef, newProduct);

      // Reset form
      setTitle('');
      setDescription('');
      setPrice('');
      setStock('');
      setImageUrl('');
      setImagePreview('');
      setSubmitting(false);
      setActiveTab('products');
    } catch (err: any) {
      setSubmitting(false);
      handleFirestoreError(err, OperationType.WRITE, 'products');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteDoc(doc(db, 'products', productId));
    } catch (err: any) {
      handleFirestoreError(err, OperationType.DELETE, `products/${productId}`);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status });
    } catch (err: any) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  const totalSales = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 to-slate-900 rounded-3xl p-8 text-white shadow-xl mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-orange-600 flex items-center justify-center shadow-lg">
              <Store className="w-8 h-8 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">Seller Dashboard</span>
              <h1 className="text-2xl font-black">{userProfile?.sellerInfo?.businessName || userProfile?.name}</h1>
              <p className="text-xs text-slate-300 mt-0.5">Zone: {userProfile?.sellerInfo?.location || userProfile?.location}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center">
            <div>
              <span className="block text-lg font-black">{products.length}</span>
              <span className="text-[10px] text-slate-300 uppercase font-semibold">Products</span>
            </div>
            <div className="border-x border-white/10 px-4">
              <span className="block text-lg font-black">{orders.length}</span>
              <span className="text-[10px] text-slate-300 uppercase font-semibold">Orders</span>
            </div>
            <div>
              <span className="block text-lg font-black text-orange-400">KES {totalSales.toLocaleString()}</span>
              <span className="text-[10px] text-slate-300 uppercase font-semibold">Total Sales</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-3 mb-8 border-b border-slate-200 pb-4">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'products' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'}`}
          >
            My Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'orders' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'}`}
          >
            Customer Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('addProduct')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'addProduct' ? 'bg-orange-600 text-white shadow-md' : 'bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100'}`}
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'analytics' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'}`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Analytics & Sales</span>
          </button>
        </div>

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <SellerAnalytics orders={orders} products={products} />
        )}

        {/* Tab 1: Products */}
        {activeTab === 'products' && (
          <div>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(n => <div key={n} className="bg-white h-60 rounded-3xl animate-pulse"></div>)}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 shadow-sm">
                <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">No products uploaded yet</h3>
                <p className="text-xs text-slate-500 mt-1">Start listing your hardware, construction or grocery items.</p>
                <button 
                  onClick={() => setActiveTab('addProduct')}
                  className="mt-4 bg-orange-600 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md"
                >
                  Add Your First Product
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(prod => (
                  <div key={prod.id} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="w-full h-40 rounded-2xl bg-slate-100 overflow-hidden mb-4 relative">
                        <img src={prod.images[0]} alt="" className="w-full h-full object-cover" />
                        <span className="absolute top-2 right-2 bg-white/90 text-slate-900 text-[10px] font-bold px-2.5 py-1 rounded-full">
                          Stock: {prod.stock}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 uppercase">{prod.category}</span>
                      <h3 className="text-sm font-bold text-slate-900 line-clamp-1 mt-0.5">{prod.title}</h3>
                      <p className="text-xs font-black text-slate-900 mt-2">KES {prod.price.toLocaleString()}</p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-4">
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-orange-600" />
                        {prod.location}
                      </span>
                      <button 
                        onClick={() => handleDeleteProduct(prod.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Orders */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {orders.length === 0 ? (
              <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 shadow-sm">
                <Truck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">No customer orders received yet</h3>
                <p className="text-xs text-slate-500 mt-1">Orders placed by customers in Mathira, Karatina & Tumutumu will show up here.</p>
              </div>
            ) : (
              orders.map(order => (
                <div key={order.id} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Order ID: {order.id}</span>
                      <h3 className="text-sm font-black text-slate-900">Buyer: {order.buyerName} ({order.buyerPhone})</h3>
                      <p className="text-[11px] text-slate-500">Zone: {order.deliveryLocation} • {order.deliveryAddress}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as Order['status'])}
                        className="bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-800">{item.product.title} × {item.quantity}</span>
                        <span className="font-bold text-slate-900">KES {(item.product.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-slate-100 pt-4 flex justify-between items-center text-xs font-bold">
                    <span>Total Amount:</span>
                    <span className="text-emerald-700 text-sm font-black">KES {order.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Add Product Form with Image Compression */}
        {activeTab === 'addProduct' && (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <h2 className="text-lg font-black text-slate-900 mb-6">List a New Product (with Client-Side Image Compression)</h2>

            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Product Title</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Simba Cement 50kg Bag"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Price (KES)</label>
                  <input 
                    type="number" 
                    required 
                    placeholder="780"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Stock Quantity</label>
                  <input 
                    type="number" 
                    required 
                    placeholder="50"
                    value={stock}
                    onChange={e => setStock(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Delivery Zone</label>
                  <select
                    value={location}
                    onChange={e => setLocation(e.target.value as DeliveryLocation)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Karatina">Karatina</option>
                    <option value="Mathira">Mathira</option>
                    <option value="Tumutumu">Tumutumu</option>
                    <option value="All">All Zones</option>
                  </select>
                </div>
              </div>

              {/* Image Upload & Compression */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Product Image (Compressed Instantly)</label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 cursor-pointer bg-slate-50 hover:bg-emerald-50 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-4 text-center transition-all flex flex-col items-center justify-center">
                    <Upload className="w-6 h-6 text-emerald-600 mb-1" />
                    <span className="text-xs font-bold text-slate-700">
                      {compressing ? 'Compressing image...' : 'Click to select image file'}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">Automatically resized & optimized for fast loading</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageFileChange}
                      className="hidden" 
                    />
                  </label>

                  {imagePreview && (
                    <div className="w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 relative shrink-0 bg-slate-100">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <span className="absolute bottom-1 right-1 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                        Optimized
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Or Image URL</label>
                <input 
                  type="url" 
                  placeholder="https://images.unsplash.com/photo-..."
                  value={imageUrl}
                  onChange={e => {
                    setImageUrl(e.target.value);
                    setImagePreview(e.target.value);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Description</label>
                <textarea 
                  rows={3}
                  placeholder="Detailed product specifications..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="freeDel"
                  checked={freeDelivery}
                  onChange={e => setFreeDelivery(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <label htmlFor="freeDel" className="text-xs font-bold text-slate-700">Offer Free Delivery for this Item</label>
              </div>

              <button 
                type="submit"
                disabled={submitting || compressing}
                className="w-full mt-4 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 text-white font-bold py-3.5 px-4 rounded-2xl text-xs shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 transition-all"
              >
                <span>{submitting ? 'Publishing...' : 'Publish Product to Marketplace'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
