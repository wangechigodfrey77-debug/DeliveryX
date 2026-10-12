/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { ProductList } from './pages/ProductList';
import { ProductDetail } from './pages/ProductDetail';
import { CartPage } from './pages/CartPage';
import { OrdersPage } from './pages/OrdersPage';
import { SellerDashboard } from './pages/SellerDashboard';
import { RegisterSeller } from './pages/RegisterSeller';
import ToastContainer from './components/ToastContainer';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased selection:bg-emerald-500 selection:text-white">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/browse" element={<ProductList />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/seller" element={<SellerDashboard />} />
                <Route path="/seller/register" element={<RegisterSeller />} />
              </Routes>
            </main>
            <Footer />
            <ToastContainer />
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

