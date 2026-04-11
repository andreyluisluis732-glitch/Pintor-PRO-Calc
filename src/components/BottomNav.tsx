import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Play, Calculator, ClipboardList, BookOpen, Settings } from 'lucide-react';

const navItems = [
  { name: 'Início', icon: Play, href: '/' },
  { name: 'Calcular', icon: Calculator, href: '/calculate' },
  { name: 'Catálogo', icon: BookOpen, href: '/catalog' },
  { name: 'Histórico', icon: ClipboardList, href: '/history' },
  { name: 'Ajustes', icon: Settings, href: '/settings' },
];

export default function BottomNav() {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-md flex justify-between items-center px-1.5 py-1.5 bg-slate-900/95 backdrop-blur-xl z-50 rounded-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const shortName = item.name === 'Início' ? 'Início' : 
                         item.name === 'Calcular' ? 'Calc' : 
                         item.name === 'Catálogo' ? 'Cat' :
                         item.name === 'Histórico' ? 'Hist' : 'Ajustes';

        return (
          <Link
            key={item.name}
            to={item.href}
            className={`flex flex-col items-center justify-center transition-all active:scale-90 duration-200 flex-1 min-w-0 py-2.5 rounded-xl ${
              isActive 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <item.icon size={20} className={isActive ? 'scale-110' : 'opacity-70'} />
            <span className={`font-sans text-[9px] font-black tracking-tighter uppercase mt-1 truncate w-full text-center px-0.5 ${isActive ? 'text-white' : 'text-slate-500'}`}>
              {shortName}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
