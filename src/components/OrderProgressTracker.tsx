import React from 'react';
import { Clock, CheckCircle2, Truck, PackageCheck, AlertCircle } from 'lucide-react';
import { OrderStatus } from '../types';

interface OrderProgressTrackerProps {
  status: OrderStatus;
}

export const OrderProgressTracker: React.FC<OrderProgressTrackerProps> = ({ status }) => {
  const steps: { key: OrderStatus; label: string; description: string; icon: any }[] = [
    { key: 'Pending', label: 'Pending', description: 'Order placed & awaiting confirmation', icon: Clock },
    { key: 'Confirmed', label: 'Confirmed', description: 'Vendor verified & preparing', icon: CheckCircle2 },
    { key: 'Out for Delivery', label: 'Out for Delivery', description: 'Rider dispatched to your zone', icon: Truck },
    { key: 'Delivered', label: 'Delivered', description: 'Delivered successfully', icon: PackageCheck },
  ];

  if (status === 'Cancelled') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3 text-red-700">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <div>
          <h4 className="text-xs font-bold uppercase">Order Cancelled</h4>
          <p className="text-[11px] text-red-600">This order has been cancelled.</p>
        </div>
      </div>
    );
  }

  const getStepIndex = (s: OrderStatus) => {
    switch (s) {
      case 'Pending': return 0;
      case 'Confirmed': return 1;
      case 'Out for Delivery': return 2;
      case 'Delivered': return 3;
      default: return 0;
    }
  };

  const currentIndex = getStepIndex(status);

  return (
    <div className="py-6 px-4 bg-slate-50 rounded-2xl border border-slate-100">
      <div className="relative flex items-center justify-between max-w-xl mx-auto">
        {/* Progress Bar Line */}
        <div className="absolute left-6 right-6 top-5 -translate-y-1/2 h-1 bg-slate-200 z-0">
          <div 
            className="h-full bg-emerald-600 transition-all duration-700 ease-out"
            style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
          ></div>
        </div>

        {steps.map((step, idx) => {
          const isCompleted = idx <= currentIndex;
          const isCurrent = idx === currentIndex;
          const IconComponent = step.icon;

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center text-center">
              <div 
                className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold transition-all duration-500 shadow-sm ${
                  isCompleted 
                    ? 'bg-emerald-600 text-white shadow-emerald-600/30 scale-105' 
                    : 'bg-white border-2 border-slate-200 text-slate-400'
                } ${isCurrent ? 'ring-4 ring-emerald-100 animate-pulse' : ''}`}
              >
                <IconComponent className="w-5 h-5" />
              </div>
              <span className={`text-xs font-bold mt-2 ${isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>
                {step.label}
              </span>
              <span className="text-[10px] text-slate-500 max-w-[90px] mt-0.5 hidden sm:block leading-tight">
                {step.description}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderProgressTracker;
