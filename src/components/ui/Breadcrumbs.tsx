import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-500 py-2 sm:py-4 select-none">
      <Link to="/" className="hover:text-emerald-600 transition-colors">
        Home
      </Link>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight size={14} className="text-slate-300 shrink-0" />
          {item.path && index < items.length - 1 ? (
            <Link to={item.path} className="hover:text-emerald-600 transition-colors truncate">
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-800 truncate">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
