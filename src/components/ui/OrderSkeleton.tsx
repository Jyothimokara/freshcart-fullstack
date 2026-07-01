export default function OrderSkeleton() {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm animate-pulse flex flex-col gap-4 mb-4">
      {/* Order Header Placeholder */}
      <div className="flex flex-wrap justify-between items-center border-b border-slate-100 pb-4 gap-2">
        <div className="flex gap-4">
          <div>
            <div className="w-16 h-3 bg-slate-200 rounded mb-2"></div>
            <div className="w-24 h-5 bg-slate-200 rounded"></div>
          </div>
          <div>
            <div className="w-20 h-3 bg-slate-200 rounded mb-2"></div>
            <div className="w-28 h-5 bg-slate-200 rounded"></div>
          </div>
        </div>
        <div className="w-24 h-8 bg-slate-200 rounded-full"></div>
      </div>

      {/* Order Items Placeholder */}
      <div className="flex flex-col gap-4 py-2">
        <div className="flex gap-4 items-center">
          <div className="w-16 h-16 bg-slate-200 rounded-xl"></div>
          <div className="flex-1">
            <div className="w-1/3 h-5 bg-slate-200 rounded mb-2"></div>
            <div className="w-20 h-4 bg-slate-200 rounded"></div>
          </div>
          <div className="w-16 h-5 bg-slate-200 rounded"></div>
        </div>
      </div>

      {/* Order Footer Placeholder */}
      <div className="flex flex-wrap justify-between items-center border-t border-slate-100 pt-4 gap-2">
        <div className="flex gap-2 items-center">
          <div className="w-20 h-4 bg-slate-200 rounded"></div>
          <div className="w-16 h-5 bg-slate-200 rounded"></div>
        </div>
        <div className="flex gap-3">
          <div className="w-24 h-9 bg-slate-200 rounded-lg"></div>
          <div className="w-28 h-9 bg-slate-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}
