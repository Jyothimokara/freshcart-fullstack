import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import DevPanel from '../ui/DevPanel';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <DevPanel />
    </div>
  );
}
