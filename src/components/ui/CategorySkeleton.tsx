export default function CategorySkeleton() {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm animate-pulse flex flex-col items-center justify-center text-center h-[280px]">
      {/* Category Circle/Image Placeholder */}
      <div className="w-24 h-24 rounded-full bg-slate-200 mb-4"></div>

      {/* Category Name Placeholder */}
      <div className="w-28 h-5 bg-slate-200 rounded mb-2"></div>

      {/* Category Count Placeholder */}
      <div className="w-16 h-3 bg-slate-200 rounded"></div>
    </div>
  );
}
