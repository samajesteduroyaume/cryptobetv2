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
    <div className='z-50 w-72 h-screen fixed left-0 top-0 flex flex-col border-r border-white/5 bg-[#0f172a]/80 backdrop-blur-xl'>
      {/* Logo Area */}
      <div className='p-8'>
        <Link href="/" className="flex items-center gap-3 group">
          <div className='w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300'>
            <span className='text-white font-black text-xl'>C</span>
          </div>
          <span className='text-white text-2xl font-bold tracking-tight group-hover:text-blue-400 transition-colors'>
            CryptoBet
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <div className='px-4 flex-1 overflow-y-auto py-6'>
        <p className='text-white/40 text-xs font-bold uppercase tracking-wider mb-4 px-4'>Menu Principal</p>
        <ul className='space-y-1'>
          {MENU_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`
                    relative flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group
                    ${isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                    }
                  `}
                >
                  <div className='flex items-center gap-3'>
                    <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                      {item.icon}
                    </div>
                    <span className='font-medium text-sm'>{item.name}</span>
                  </div>

                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-300 rounded-r-full shadow-[0_0_10px_rgba(147,197,253,0.5)]" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Categories Section (Visual only for now) */}
        <p className='text-white/40 text-xs font-bold uppercase tracking-wider mt-8 mb-4 px-4'>Sports Populaires</p>
        <ul className='space-y-1'>
          {['Football', 'Basketball', 'Tennis', 'Esports'].map((sport) => (
            <li key={sport}>
              <button className='w-full text-left px-4 py-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-all text-sm font-medium'>
                {sport}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer / Wallet Info */}
      <div className='p-4 mt-auto border-t border-white/5 bg-black/20'>
        <div className='bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/20 rounded-xl p-4'>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Trophy className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className='text-white font-bold text-sm'>Paris Décentralisés</p>
              <p className='text-white/40 text-xs'>Sécurisé par Smart Contract</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SideBar