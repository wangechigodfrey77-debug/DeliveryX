import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { Order, Product } from '../types';
import { TrendingUp, Award, DollarSign, Package } from 'lucide-react';

interface SellerAnalyticsProps {
  orders: Order[];
  products: Product[];
}

export const SellerAnalytics: React.FC<SellerAnalyticsProps> = ({ orders, products }) => {
  // Aggregate sales by month
  const salesByMonthMap = new Map<string, number>();
  // Aggregate product performance
  const productSalesMap = new Map<string, { title: string; revenue: number; qty: number }>();

  orders.forEach(order => {
    const date = new Date(order.createdAt);
    const monthName = date.toLocaleString('default', { month: 'short', year: '2-digit' });
    const currentSales = salesByMonthMap.get(monthName) || 0;
    salesByMonthMap.set(monthName, currentSales + order.totalAmount);

    order.items.forEach(item => {
      const pid = item.productId;
      const existing = productSalesMap.get(pid) || { title: item.product.title, revenue: 0, qty: 0 };
      productSalesMap.set(pid, {
        title: existing.title,
        revenue: existing.revenue + (item.product.price * item.quantity),
        qty: existing.qty + item.quantity
      });
    });
  });

  const monthlyData = Array.from(salesByMonthMap.entries()).map(([month, sales]) => ({
    month,
    sales
  }));

  const chartData = monthlyData.length > 0 ? monthlyData : [
    { month: 'Jan', sales: 12400 },
    { month: 'Feb', sales: 18900 },
    { month: 'Mar', sales: 24500 },
    { month: 'Apr', sales: 32000 },
  ];

  const topProducts = Array.from(productSalesMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const topProductsData = topProducts.length > 0 ? topProducts : [
    { title: 'Simba Cement 50kg', revenue: 15600, qty: 20 },
    { title: 'Karatina Sukuma Wiki', revenue: 7500, qty: 30 },
    { title: 'Sokoro Timber 2x4', revenue: 9000, qty: 20 },
  ];

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalItemsSold = orders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0);

  return (
    <div className="space-y-8">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Total Revenue</span>
            <h3 className="text-xl font-black text-slate-900">KES {totalRevenue.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Units Sold</span>
            <h3 className="text-xl font-black text-slate-900">{totalItemsSold}</h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Total Orders</span>
            <h3 className="text-xl font-black text-slate-900">{orders.length}</h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Active Products</span>
            <h3 className="text-xl font-black text-slate-900">{products.length}</h3>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Sales Volume */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
          <h3 className="text-sm font-black text-slate-900 mb-6 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            Monthly Sales Volume (KES)
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '1rem', border: 'none', color: '#fff' }}
                  formatter={(value: any) => [`KES ${Number(value).toLocaleString()}`, 'Sales']}
                />
                <Area type="monotone" dataKey="sales" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top-Performing Products */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
          <h3 className="text-sm font-black text-slate-900 mb-6 flex items-center gap-2">
            <Award className="w-4 h-4 text-orange-600" />
            Top-Performing Products by Revenue (KES)
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProductsData} layout="vertical" margin={{ top: 10, right: 10, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                <YAxis dataKey="title" type="category" stroke="#94a3b8" fontSize={11} width={100} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '1rem', border: 'none', color: '#fff' }}
                  formatter={(value: any) => [`KES ${Number(value).toLocaleString()}`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#f97316" radius={[0, 8, 8, 0]}>
                  {topProductsData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#f97316' : '#059669'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerAnalytics;
