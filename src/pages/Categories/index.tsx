import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { categories } from '../../data/categories';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import SafeImage from '../../components/ui/SafeImage';

export default function Categories() {
  return (
    <div className="container mx-auto px-4 py-8">
      
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'Home', path: '/' }, { label: 'Categories' }]} />

      {/* Page Header */}
      <div className="mt-6 mb-10">
        <span className="text-emerald-600 font-extrabold text-sm uppercase tracking-wider">Department Directory</span>
        <h1 className="text-4xl font-black text-slate-900 mt-1">Shop by Category</h1>
        <p className="text-slate-500 text-sm mt-2 max-w-xl">
          Explore our wide range of organic farm-fresh groceries. Filtered and hand-selected items split into premium supermarket departments.
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/products?category=${category.slug}`}
            className="group flex flex-col justify-between bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-emerald-100 transition-all duration-300 cursor-pointer h-[280px]"
          >
            {/* Category Banner Image */}
            <div className="h-44 w-full overflow-hidden relative">
              <SafeImage
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              {/* Soft overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>
              
              {/* Category tag on image */}
              <span className="absolute bottom-4 left-4 text-xs font-black uppercase tracking-wider bg-emerald-600 text-white px-3 py-1 rounded-full shadow-md">
                Organic Sourced
              </span>
            </div>

            {/* Category details bottom */}
            <div className="p-5 flex items-center justify-between bg-white border-t border-slate-50">
              <div className="flex flex-col">
                <h3 className="font-extrabold text-slate-800 text-base group-hover:text-emerald-600 transition-colors capitalize">
                  {category.name}
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Over {category.itemCount} organic items
                </p>
              </div>

              {/* Icon CTA */}
              <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 flex items-center justify-center transition-colors">
                <ChevronRight size={18} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
