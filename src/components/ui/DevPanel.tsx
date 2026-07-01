import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Settings, X, Terminal, RefreshCw } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useDemo } from '../../context/DemoContext';

export default function DevPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { cart } = useCart();
  const { wishlistIds } = useWishlist();
  const { latency, setLatency, logs, clearLogs } = useDemo();

  const cartCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 w-12 h-12 rounded-full bg-slate-900 hover:bg-slate-800 text-emerald-400 flex items-center justify-center shadow-lg cursor-pointer transition-transform hover:scale-105 active:scale-95 border border-slate-800 focus:outline-none"
        aria-label="Developer Control Panel"
      >
        {isOpen ? <X size={20} /> : <Settings size={20} className="animate-spin-slow" />}
      </button>

      {/* Slide-out Panel */}
      {isOpen && (
        <div className="fixed bottom-36 right-4 md:bottom-20 md:right-6 z-50 w-[calc(100vw-32px)] sm:w-[340px] max-h-[480px] bg-slate-950 border border-slate-800 text-slate-300 rounded-2xl shadow-2xl flex flex-col overflow-hidden font-mono text-xs">
          {/* Header */}
          <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <Terminal size={14} />
              <span>FreshCart DevTools</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-500 hover:text-slate-300 cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>

          {/* Panel Body */}
          <div className="p-4 flex flex-col gap-4 overflow-y-auto flex-1">
            {/* Live Stats */}
            <div>
              <p className="text-slate-500 mb-2 font-bold uppercase tracking-wider text-[10px]">
                Live Application State
              </p>
              <div className="grid grid-cols-2 gap-2 bg-slate-900/50 p-2.5 rounded-xl border border-slate-900">
                <div>
                  <span className="text-slate-500">Route:</span>
                  <p className="font-bold text-white truncate">{location.pathname}</p>
                </div>
                <div>
                  <span className="text-slate-500">Theme:</span>
                  <p className="font-bold text-white">Light Mode</p>
                </div>
                <div>
                  <span className="text-slate-500">Cart Qty:</span>
                  <p className="font-bold text-emerald-400">{cartCount} items</p>
                </div>
                <div>
                  <span className="text-slate-500">Wishlist:</span>
                  <p className="font-bold text-rose-400">{wishlistIds.length} items</p>
                </div>
              </div>
            </div>

            {/* Network Latency Simulator */}
            <div>
              <p className="text-slate-500 mb-2 font-bold uppercase tracking-wider text-[10px]">
                API Latency Simulator
              </p>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Latency:</span>
                  <span className="text-emerald-400 font-bold">{latency} ms</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => setLatency(0)}
                    className={`py-1.5 rounded-lg border text-center font-bold transition-all cursor-pointer ${
                      latency === 0
                        ? 'bg-emerald-600/10 border-emerald-500 text-emerald-400'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    0ms (Instant)
                  </button>
                  <button
                    onClick={() => setLatency(800)}
                    className={`py-1.5 rounded-lg border text-center font-bold transition-all cursor-pointer ${
                      latency === 800
                        ? 'bg-emerald-600/10 border-emerald-500 text-emerald-400'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    800ms (3G Fast)
                  </button>
                  <button
                    onClick={() => setLatency(1500)}
                    className={`py-1.5 rounded-lg border text-center font-bold transition-all cursor-pointer ${
                      latency === 1500
                        ? 'bg-emerald-600/10 border-emerald-500 text-emerald-400'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    1.5s (3G Slow)
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 italic mt-1 leading-normal">
                  Skeletons show up automatically when latency is &gt; 0ms.
                </p>
              </div>
            </div>

            {/* Event Logs Terminal */}
            <div className="flex-1 flex flex-col min-h-[140px]">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="font-bold uppercase tracking-wider text-[10px]">
                  State Event Logger
                </span>
                {logs.length > 0 && (
                  <button
                    onClick={clearLogs}
                    className="text-[9px] hover:text-red-400 flex items-center gap-0.5 cursor-pointer"
                  >
                    <RefreshCw size={8} /> Clear
                  </button>
                )}
              </div>
              <div className="flex-1 bg-slate-950 border border-slate-900 p-2 rounded-xl h-[140px] overflow-y-auto flex flex-col gap-1.5">
                {logs.length === 0 ? (
                  <p className="text-slate-600 italic text-[10px]">No events recorded.</p>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="text-[10px] border-b border-slate-900 pb-1 last:border-b-0 leading-normal">
                      <div className="flex justify-between items-center text-slate-500">
                        <span className="text-[9px]">{log.timestamp}</span>
                        <span className="text-[9px] text-slate-600 font-bold">{log.id.split('-')[1]}</span>
                      </div>
                      <p className="text-emerald-400 font-bold">{log.action}</p>
                      {log.payload && (
                        <pre className="text-[9px] text-slate-500 truncate max-w-full">
                          {JSON.stringify(log.payload)}
                        </pre>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
