import { Category, Product } from '../types';

export const CATEGORIES: Category[] = [
  { id: '1', name: 'Hardware & Tools', slug: 'hardware', iconName: 'Wrench', description: 'Building tools, locks, plumbing & electrical supplies' },
  { id: '2', name: 'Construction Materials', slug: 'construction', iconName: 'Hammer', description: 'Cement, timber, roofing sheets, ballast & sand' },
  { id: '3', name: 'Food & Groceries', slug: 'groceries', iconName: 'ShoppingBag', description: 'Fresh vegetables from Karatina, maize flour, milk & sugar' },
  { id: '4', name: 'Wholesale & Bulk', slug: 'wholesale', iconName: 'Package', description: 'Bulk supplies for shops, hotels & schools' },
  { id: '5', name: 'Electronics & Phones', slug: 'electronics', iconName: 'Smartphone', description: 'Phones, chargers, radios & solar panels' },
  { id: '6', name: 'Parcels & Documents', slug: 'parcels', iconName: 'Truck', description: 'Fast secure courier between Mathira, Karatina & Tumutumu' },
  { id: '7', name: 'Household & Kitchen', slug: 'household', iconName: 'Home', description: 'Cookware, gas cylinders, bedsheets & utensils' },
  { id: '8', name: 'Pharmacy & Health', slug: 'pharmacy', iconName: 'HeartPulse', description: 'OTC medicine, first aid, baby care & toiletries' },
];

export const INITIAL_PRODUCTS: Omit<Product, 'id' | 'createdAt'>[] = [
  {
    title: 'Simba Cement 50kg Bag',
    description: 'High strength Portland composite cement for all heavy construction and slab casting in Mathira and Karatina.',
    price: 780,
    stock: 120,
    category: 'Construction Materials',
    location: 'Karatina',
    images: ['https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80'],
    sellerId: 'demo_seller_1',
    sellerName: 'Karatina Hardware & Builders',
    freeDelivery: false,
    tags: ['cement', 'building', 'karatina']
  },
  {
    title: 'Fresh Karatina Market Sukuma Wiki & Cabbages (Bundle)',
    description: 'Fresh farm-grade sukuma wiki, cabbages, tomatoes and onions harvested directly from Karatina farms. Delivered fresh to Tumutumu & Mathira.',
    price: 250,
    stock: 50,
    category: 'Food & Groceries',
    location: 'Karatina',
    images: ['https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80'],
    sellerId: 'demo_seller_2',
    sellerName: 'Mama Wambui Fresh Produce',
    freeDelivery: true,
    tags: ['vegetables', 'fresh', 'organic']
  },
  {
    title: 'Sokoro Timber 2x4 (10ft Treated Cypress)',
    description: 'Quality treated cypress timber for roofing and framing. Sourced locally in Mathira.',
    price: 450,
    stock: 80,
    category: 'Construction Materials',
    location: 'Mathira',
    images: ['https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=800&q=80'],
    sellerId: 'demo_seller_1',
    sellerName: 'Mathira Timber Millers',
    freeDelivery: false,
    tags: ['timber', 'roofing', 'mathira']
  },
  {
    title: 'Unga wa Sima 2kg (Jogoo Maize Meal)',
    description: 'Fine white maize flour for perfect ugali. Essential Kenyan family meal staple.',
    price: 155,
    stock: 200,
    category: 'Food & Groceries',
    location: 'Tumutumu',
    images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80'],
    sellerId: 'demo_seller_3',
    sellerName: 'Tumutumu General Store',
    freeDelivery: true,
    tags: ['unga', 'maize', 'food']
  },
  {
    title: 'Total 6kg Gas Cylinder (Filled)',
    description: 'Clean cooking gas cylinder fully filled with regulator and hose pipe. Fast delivery across Karatina & Mathira.',
    price: 2200,
    stock: 25,
    category: 'Household & Kitchen',
    location: 'Karatina',
    images: ['https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=80'],
    sellerId: 'demo_seller_4',
    sellerName: 'Karatina Gas & Energy',
    freeDelivery: true,
    tags: ['gas', 'cooking', 'energy']
  },
  {
    title: 'Samsung Galaxy A15 (4GB/128GB - Brand New)',
    description: 'Original smartphone with 1-year warranty. Crystal clear display and long-lasting battery.',
    price: 18500,
    stock: 10,
    category: 'Electronics & Phones',
    location: 'Karatina',
    images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80'],
    sellerId: 'demo_seller_5',
    sellerName: 'Karatina Tech Hub',
    freeDelivery: true,
    tags: ['phone', 'samsung', 'electronics']
  },
  {
    title: 'Express Parcel Delivery (Mathira <> Karatina)',
    description: 'Secure, same-hour door-to-door courier service for envelopes, parcels and packages between Mathira, Karatina, and Tumutumu.',
    price: 300,
    stock: 999,
    category: 'Parcels & Documents',
    location: 'Mathira',
    images: ['https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80'],
    sellerId: 'deliveryx_express',
    sellerName: 'DeliveryX Express Courier',
    freeDelivery: false,
    tags: ['courier', 'parcel', 'delivery']
  },
  {
    title: 'Wholesale Bale of Kabras Sugar (24kg)',
    description: 'Pure white crystal sugar in bulk for shops, tea rooms and hotels. Wholesale pricing.',
    price: 3400,
    stock: 35,
    category: 'Wholesale & Bulk',
    location: 'Karatina',
    images: ['https://images.unsplash.com/photo-1581441363689-1f3c3c3b5315?auto=format&fit=crop&w=800&q=80'],
    sellerId: 'demo_seller_3',
    sellerName: 'Karatina Wholesale Hub',
    freeDelivery: true,
    tags: ['sugar', 'wholesale', 'bulk']
  }
];
