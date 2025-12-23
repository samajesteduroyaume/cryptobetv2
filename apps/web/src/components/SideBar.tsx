"use client";

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Trophy, History, TrendingUp, Home, ChevronRight, Wallet } from 'lucide-react'

const MENU_ITEMS = [
  { name: 'Accueil', href: '/', icon: <Home className="w-5 h-5" /> },
  { name: 'Mes Paris', href: '/my-bets', icon: <TrendingUp className="w-5 h-5" /> },
  { name: 'Historique', href: '/history', icon: <History className="w-5 h-5" /> },
]

const SideBar = () => {
  const pathname = usePathname();

  return (
    <div className='z-50 w-80 h-screen fixed left-0 top-0 flex flex-col border-r border-white/5 bg-[#0f172a]/95 backdrop-blur-3xl'>
      {/* Logo Area */}
      <div className='p-10'>
        <Link href="/" className="flex items-center gap-4 group">
          <div className='w-12 h-12 bg-gradient-to-br from-green-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-green-500/20 group-hover:rotate-6 transition-all duration-500'>
            <TrendingUp className="w-7 h-7 text-[#0f172a]" />
          </div>
          <div className="flex flex-col">
            <span className='text-white text-2xl font-black italic tracking-tighter group-hover:text-green-400 transition-colors uppercase'>
              CRYPTOBET
            </span>
            <span className="text-[10px] text-orange-500 font-black tracking-[0.4em]">VERSION 2.0</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <div className='px-6 flex-1 overflow-y-auto py-8'>
        <p className='text-white/20 text-[10px] font-black uppercase tracking-[0.3em] mb-8 px-4'>Plateforme</p>
        <ul className='space-y-3'>
          {MENU_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`
                    relative flex items-center justify-between px-6 py-4 rounded-2xl transition-all duration-500 group overflow-hidden
                    ${isActive
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-[#0f172a] shadow-xl shadow-green-500/10'
                      : 'text-white/40 hover:bg-white/[0.03] hover:text-white'
                    }
                  `}
                >
                  <div className='flex items-center gap-4 z-10'>
                    <div className={`transition-all duration-500 ${isActive ? 'scale-110 rotate-3' : 'group-hover:scale-110'}`}>
                      {item.icon}
                    </div>
                    <span className='font-black text-xs uppercase tracking-widest'>{item.name}</span>
                  </div>

                  {isActive && (
                    <div className="absolute left-0 top-0 h-full w-full bg-white/10 opacity-50 skew-x-12 translate-x-32" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Action / Help Section */}
        <div className="mt-12 px-4">
          <div className="glass rounded-3xl p-6 border-white/[0.02]">
            <p className="text-white/20 text-[10px] font-black uppercase tracking-widest mb-4">Support</p>
            <button className="w-full text-left flex items-center gap-3 text-white/60 hover:text-orange-500 transition-colors py-2">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></span>
              <span className="text-xs font-bold uppercase tracking-widest">Aide Directe</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer / Wallet Info */}
      <div className='p-8 mt-auto border-t border-white/5 bg-black/40'>
        <div className='bg-gradient-to-br from-green-500/20 to-orange-500/5 border border-white/5 rounded-[1.5rem] p-6 text-center ring-1 ring-white/5'>
          <p className='text-white font-black text-[10px] uppercase tracking-widest mb-1 italic'>Powered by</p>
          <p className='text-green-500 text-sm font-black tracking-tighter'>OPTIMISM NETWORK</p>
        </div>
      </div>
    </div>
  )
}

export default SideBar