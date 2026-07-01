export default function ProductSkeleton() {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm animate-pulse flex flex-col justify-between h-[360px]">
      <div>
        {/* Wishlist Button Placeholder */}
        <div className="flex justify-end mb-2">
          <div className="w-8 h-8 rounded-full bg-slate-200"></div>
        </div>

        {/* Product Image Placeholder */}
        <div className="w-full h-40 bg-slate-200 rounded-xl mb-4"></div>

        {/* Category Badge Placeholder */}
        <div className="w-16 h-4 bg-slate-200 rounded mb-2"></div>

        {/* Title Placeholder */}
        <div className="w-3/4 h-5 bg-slate-200 rounded mb-2"></div>
        <div className="w-1/2 h-5 bg-slate-200 rounded mb-3"></div>

        {/* Rating Placeholder */}
        <div className="w-20 h-4 bg-slate-200 rounded mb-4"></div>
      </div>

      {/* Footer Price & Add Button Placeholder */}
      <div className="flex items-center justify-between mt-auto">
        <div className="flex flex-col gap-1">
          <div className="w-16 h-5 bg-slate-200 rounded"></div>
        </div>
        <div className="w-24 h-9 bg-slate-200 rounded-lg"></div>
      </div>
    </div>
  );
}
