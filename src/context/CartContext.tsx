import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from './AuthContext';
import { CartItem, Product } from '../types';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  totalAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    if (!user) {
      setItems([]);
      return;
    }

    const cartRef = doc(db, 'carts', user.uid);
    const unsubscribe = onSnapshot(cartRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setItems(data.items || []);
      } else {
        setItems([]);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `carts/${user.uid}`);
    });

    return () => unsubscribe();
  }, [user]);

  const saveCartToFirestore = async (newItems: CartItem[]) => {
    if (!user) return;
    try {
      const cartRef = doc(db, 'carts', user.uid);
      await setDoc(cartRef, {
        uid: user.uid,
        items: newItems,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `carts/${user.uid}`);
    }
  };

  const addToCart = async (product: Product, quantity = 1) => {
    const existingIndex = items.findIndex(item => item.productId === product.id);
    let updated: CartItem[];
    if (existingIndex > -1) {
      updated = [...items];
      updated[existingIndex].quantity += quantity;
    } else {
      updated = [...items, { productId: product.id, product, quantity }];
    }
    setItems(updated);
    await saveCartToFirestore(updated);
  };

  const removeFromCart = async (productId: string) => {
    const updated = items.filter(item => item.productId !== productId);
    setItems(updated);
    await saveCartToFirestore(updated);
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }
    const updated = items.map(item => 
      item.productId === productId ? { ...item, quantity } : item
    );
    setItems(updated);
    await saveCartToFirestore(updated);
  };

  const clearCart = async () => {
    setItems([]);
    await saveCartToFirestore([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      totalAmount
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
