import { SearchX } from 'lucide-react';

interface NoResultsProps {
  query?: string;
  onClearFilters?: () => void;
}

export default function NoResults({ query, onClearFilters }: NoResultsProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-white rounded-2xl border border-slate-100 shadow-sm max-w-lg mx-auto my-8">
      {/* Icon Wrapper */}
      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-6">
        <SearchX size={40} strokeWidth={1.5} />
      </div>

      {/* Content */}
      <h3 className="text-2xl font-bold text-slate-900 mb-2">No Products Found</h3>
      <p className="text-slate-500 max-w-sm mb-8">
        {query ? (
          <>We couldn't find any results matching <span className="font-semibold text-slate-900">"{query}"</span>.</>
        ) : (
          "We couldn't find any items matching your selected filters."
        )}
        {" Try adjusting your search query or removing filters."}
      </p>

      {/* Action Button */}
      {onClearFilters && (
        <button
          onClick={onClearFilters}
          type="button"
          className="inline-flex items-center justify-center px-6 h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-all shadow-md active:scale-95 cursor-pointer"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );
}
