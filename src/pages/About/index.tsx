import { Award, Compass, Heart, CheckCircle, ArrowUpRight } from 'lucide-react';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import SafeImage from '../../components/ui/SafeImage';

export default function About() {
  const stats = [
    { value: '10k+', label: 'Happy Customers', desc: 'Active subscribers ordering monthly.' },
    { value: '100+', label: 'Local Organic Farms', desc: 'Direct sourcing to cut out Middlemen.' },
    { value: '500+', label: 'Premium Products', desc: 'Hand-picked fruits, dairy, and spices.' },
    { value: '24/7', label: 'Help Desk Support', desc: 'Always available customer success team.' }
  ];

  const team = [
    {
      name: 'Elena Rostova',
      role: 'Founder & CEO',
      comment: 'Elena started FreshCart in her home kitchen to help local farmers connect directly with families.',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80'
    },
    {
      name: 'Marcus Vance',
      role: 'Head of Quality Sourcing',
      comment: 'Marcus audits every single partner farm to ensure compliance with strict organic practices.',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&auto=format&fit=crop&q=80'
    },
    {
      name: 'Sarah Jenkins',
      role: 'Lead Dietitian & Nutritionist',
      comment: 'Sarah guides our recipe collections and verifies nutritional profiles across our catalog.',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'Home', path: '/' }, { label: 'About Us' }]} />

      {/* Hero Header */}
      <div className="mt-6 mb-12 text-center max-w-2xl mx-auto">
        <span className="text-emerald-600 font-extrabold text-sm uppercase tracking-wider">Our Story</span>
        <h1 className="text-4xl font-black text-slate-900 mt-1">Healthy Living Made Effortless</h1>
        <p className="text-slate-500 text-sm mt-3 leading-relaxed">
          FreshCart is dedicated to bringing organic, sustainable, and local food items directly into your home kitchen. We believe high-quality nutrition should be accessible to all.
        </p>
      </div>

      {/* === COMPANY STORY ROW === */}
      <section className="grid lg:grid-cols-12 gap-12 items-center mb-16">
        <div className="lg:col-span-6 flex flex-col gap-5">
          <h2 className="text-3xl font-black text-slate-900 leading-tight">
            Sourcing Directly From <br />
            <span className="text-emerald-600">Local Family Orchards</span>
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            FreshCart began with a simple observation: supermarkets contain heavily processed goods, while organic sustainable produce remains expensive and complex to source.
          </p>
          <p className="text-slate-600 text-sm leading-relaxed">
            By building direct logistics bridges with local family-owned farms, we bypass the warehouse middlemen. This ensures crops are harvested at peak ripeness, arriving at your doorstep within 24 hours of harvest.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 mt-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="text-emerald-600 shrink-0" size={16} />
              <span className="text-xs font-bold text-slate-700">100% Certified USDA Organic</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="text-emerald-600 shrink-0" size={16} />
              <span className="text-xs font-bold text-slate-700">Zero Single-use Plastic Bags</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="text-emerald-600 shrink-0" size={16} />
              <span className="text-xs font-bold text-slate-700">Fair Trade Sourcing Support</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="text-emerald-600 shrink-0" size={16} />
              <span className="text-xs font-bold text-slate-700">Carbon Neutral Transport</span>
            </div>
          </div>
        </div>

        {/* Story Image container */}
        <div className="lg:col-span-6 relative">
          <div className="w-full h-[360px] rounded-3xl bg-slate-900 border border-slate-100 overflow-hidden shadow-xl">
            <SafeImage
              src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=80"
              alt="Harvested Fresh Vegetable Field Farm"
              className="w-full h-full object-cover opacity-95 scale-102 hover:scale-100 transition-transform duration-700"
            />
          </div>
          {/* Accent small badge */}
          <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-lg border border-slate-100 flex items-center gap-3 hidden sm:flex">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Award size={20} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase leading-none mb-1">Established</p>
              <p className="text-sm font-black leading-none">Since 2024</p>
            </div>
          </div>
        </div>
      </section>

      {/* === MISSION & VISION CARD GRID === */}
      <section className="grid md:grid-cols-2 gap-8 mb-16">
        <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100/50 flex gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <Compass size={24} />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-800 text-lg mb-2">Our Mission</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              To nourish communities by connecting them directly to eco-conscious local farmers. We aim to decrease carbon footprints, support sustainable farming families, and secure premium fresh vegetables at reasonable, transparent prices.
            </p>
          </div>
        </div>

        <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100/50 flex gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <Heart size={24} />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-800 text-lg mb-2">Our Vision</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              We envision a future where food logistics are direct, waste is zero, and sustainable farming is the global standard. We build tools and services to enable a seamless farm-to-table shopping routine for everyone.
            </p>
          </div>
        </div>
      </section>

      {/* === STATISTICS COUNTERS === */}
      <section className="bg-gradient-to-br from-emerald-950 to-teal-950 text-white rounded-3xl p-8 md:p-12 shadow-xl mb-16 border border-emerald-900/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]"></div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center relative z-10">
          {stats.map((stat, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="text-4xl md:text-5xl font-black text-emerald-400 mb-1">{stat.value}</span>
              <h4 className="font-extrabold text-white text-sm uppercase tracking-wider mb-2">{stat.label}</h4>
              <p className="text-slate-350 text-xs leading-normal max-w-[180px]">{stat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* === TEAM SECTION === */}
      <section className="mb-8">
        <div className="text-center mb-12">
          <span className="text-emerald-600 font-extrabold text-sm uppercase tracking-wider">Meet the Crew</span>
          <h2 className="text-3xl font-black text-slate-900 mt-1">Our Leadership Team</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {team.map((member, index) => (
            <div key={index} className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 group">
              <div className="w-full h-64 bg-slate-50 rounded-2xl overflow-hidden mb-5">
                <SafeImage
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                  fallbackSrc="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2310b981' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'/><circle cx='12' cy='7' r='4'/></svg>"
                />
              </div>
              <span className="text-xs font-black uppercase text-emerald-600 tracking-wider">
                {member.role}
              </span>
              <h3 className="font-extrabold text-slate-800 text-lg mt-1 flex items-center justify-between">
                <span>{member.name}</span>
                <ArrowUpRight size={16} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed mt-2.5">
                {member.comment}
              </p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
