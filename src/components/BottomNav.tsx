import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Play, Calculator, ClipboardList, BookOpen, Settings, HelpCircle } from 'lucide-react';

const navItems = [
  { name: 'Início', icon: Play, href: '/' },
  { name: 'Calcular', icon: Calculator, href: '/calculate' },
  { name: 'Catálogo', icon: BookOpen, href: '/catalog' },
  { name: 'Ajuda', icon: HelpCircle, href: '/help' },
  { name: 'Histórico', icon: ClipboardList, href: '/history', professionalOnly: true },
  { name: 'Ajustes', icon: Settings, href: '/settings', professionalOnly: true },
];

export default function BottomNav() {
  const location = useLocation();
  const pathname = location.pathname;

  const visibleItems = navItems;

  return (
    <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 py-3 pb-safe bg-[#3e5f92]/90 backdrop-blur-md z-50 rounded-t-xl border-t border-white/10 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
      {visibleItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            to={item.href}
            className={`flex flex-col items-center justify-center transition-all active:scale-90 duration-200 px-3 py-1.5 rounded-lg ${
              isActive 
                ? 'bg-[#2b1300] text-white' 
                : 'text-blue-100/70 hover:text-white'
            }`}
          >
            <item.icon size={20} fill={isActive ? 'currentColor' : 'none'} />
            <span className="font-sans text-[10px] font-bold tracking-widest uppercase mt-1">
              {item.name === 'Início' ? 'Início' : 
               item.name === 'Calcular' ? 'Calc' : 
               item.name === 'Catálogo' ? 'Catálogo' :
               item.name === 'Ajuda' ? 'Ajuda' :
               item.name === 'Histórico' ? 'Histórico' : 'Ajustes'}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
