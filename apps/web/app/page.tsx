"use client";

import Image from "next/image";
import Link from "next/link";
import { Loader2, TrendingUp, Calendar, ChevronRight, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Match } from '@/src/types';

export const dynamic = 'force-dynamic';

export default function Home() {
  const [liveEvents, setLiveEvents] = useState<Match[]>([]);
  const [isLoadingLive, setIsLoadingLive] = useState(true);
  const [selectedSport, setSelectedSport] = useState('all');

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await fetch('/api/matches');
        const data = await response.json();
        setLiveEvents(data.matches || []);
      } catch (error) {
        console.error('Error fetching matches:', error);
        setLiveEvents([]);
      } finally {
        setIsLoadingLive(false);
      }
    };
    fetchMatches();
  }, []);

  if (isLoadingLive) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-white animate-spin" />
        <p className="text-white/60 text-sm font-medium">Chargement des cotes...</p>
      </div>
    );
  }

  const filteredMatches = selectedSport === 'all'
    ? liveEvents
    : liveEvents.filter(match => match.sport_type === selectedSport);

  const matchesByLeague = filteredMatches.reduce((acc: Record<string, Match[]>, match: Match) => {
    const league = match.name || 'Autres';
    if (!acc[league]) acc[league] = [];
    acc[league].push(match);
    return acc;
  }, {});

  const sportsTabs = [
    { id: 'all', label: 'Tous', icon: '🏆' },
    { id: 'football', label: 'Football', icon: '⚽' },
    { id: 'basketball', label: 'Basketball', icon: '🏀' },
    { id: 'baseball', label: 'Baseball', icon: '⚾' },
    { id: 'tennis', label: 'Tennis', icon: '🎾' },
    { id: 'racing', label: 'Auto-Moto', icon: '🏎️' },
  ];

  return (
    <div className="w-full max-w-[1600px] mx-auto p-6 min-h-screen">

      {/* Brand Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
            <TrendingUp className="w-6 h-6 text-[#0f172a]" />
          </div>
          <h1 className="text-2xl font-black italic tracking-tighter text-gradient">CRYPTOBET <span className="text-orange-500">v2</span></h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="glass px-4 py-2 rounded-full flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-xs font-bold text-white/60">LIVE NETWORK</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 mb-8 border-b border-white/5 pb-1 overflow-x-auto no-scrollbar">
        {sportsTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedSport(tab.id)}
            className={`flex items-center gap-2 px-8 py-4 rounded-t-2xl text-xs font-black tracking-widest transition-all duration-300 whitespace-nowrap ${selectedSport === tab.id
              ? 'bg-gradient-to-t from-green-500/10 to-transparent text-green-400 border-b-2 border-green-500'
              : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
          >
            <span>{tab.icon}</span>
            {tab.label.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="flex flex-col xl:flex-row gap-8">

        <div className="flex-1 space-y-8">

          {Object.keys(matchesByLeague).length === 0 && (
            <div className="text-center py-24 glass rounded-3xl">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-white/20" />
              </div>
              <p className="text-white/40 font-medium">Aucun match disponible pour ce sport actuellement.</p>
            </div>
          )}

          {Object.entries(matchesByLeague).map(([leagueName, matches]: [string, Match[]]) => (
            <div key={leagueName} className="glass rounded-3xl overflow-hidden group/league transition-all duration-500 border-white/[0.02]">

              <div className="px-6 py-4 bg-white/[0.02] flex justify-between items-center border-b border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-orange-500 rounded-full"></div>
                  <h3 className="text-white font-black text-sm uppercase tracking-widest opacity-80">{leagueName}</h3>
                </div>
                <Link href="#" className="text-xs font-bold text-orange-500 hover:text-orange-400 transition-colors uppercase tracking-wider">Explorer &gt;</Link>
              </div>

              <div className="divide-y divide-white/[0.03]">
                {matches.map((match, idx) => {
                  const date = new Date(match.start_time);
                  const hours = date.getHours().toString().padStart(2, '0');
                  const minutes = date.getMinutes().toString().padStart(2, '0');
                  const isLive = new Date() > date;

                  return (
                    <Link
                      key={idx}
                      href={`/match/${match.external_id}`}
                      className="group/match p-6 hover:bg-white/[0.02] transition-all duration-500 flex flex-col md:flex-row md:items-center gap-6 relative"
                    >

                      <div className="w-20 shrink-0 flex flex-col items-center justify-center text-xs">
                        {isLive ? (
                          <div className="flex flex-col items-center gap-1">
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                            <span className="text-red-500 font-black tracking-tighter">LIVE</span>
                          </div>
                        ) : (
                          <div className="bg-white/5 px-3 py-2 rounded-xl flex flex-col items-center border border-white/5">
                            <span className="font-black text-white text-sm">{hours}:{minutes}</span>
                            <span className="text-[10px] text-white/30 font-bold uppercase">{date.getDate()}/{date.getMonth() + 1}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 flex flex-col justify-center gap-3">
                        <div className="flex items-center gap-4 group/team">
                          <div className="w-8 h-8 glass rounded-full flex items-center justify-center p-1.5 group-hover/team:border-green-500/50 transition-colors">
                            <Image src={match.team1_logo} alt={match.team1_name} width={24} height={24} className="object-contain" />
                          </div>
                          <span className="text-white font-bold text-sm md:text-base group-hover/team:text-green-400 transition-colors">{match.team1_name}</span>
                        </div>
                        <div className="flex items-center gap-4 group/team">
                          <div className="w-8 h-8 glass rounded-full flex items-center justify-center p-1.5 group-hover/team:border-green-500/50 transition-colors">
                            <Image src={match.team2_logo} alt={match.team2_name} width={24} height={24} className="object-contain" />
                          </div>
                          <span className="text-white font-bold text-sm md:text-base group-hover/team:text-green-400 transition-colors">{match.team2_name}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 w-full md:w-auto">
                        <OddsButton label="1" odd={match.odds_team1} />
                        <OddsButton label="N" odd={match.odds_draw || 0} />
                        <OddsButton label="2" odd={match.odds_team2} />
                      </div>

                      <div
                        className="glass px-8 py-4 rounded-2xl text-[10px] font-black text-orange-500 group-hover/match:bg-orange-500 group-hover/match:text-[#0f172a] transition-all duration-300 tracking-widest uppercase border border-orange-500/20 group-hover/match:border-orange-400 shadow-lg shadow-orange-500/5"
                      >
                        PARIER
                      </div>

                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="w-full xl:w-96 space-y-8">
          <div className="bg-gradient-to-br from-green-500 to-emerald-700 rounded-[2rem] p-8 text-[#0f172a] relative overflow-hidden group shadow-2xl shadow-green-500/10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
            <h3 className="font-black text-2xl mb-2 tracking-tighter uppercase italic">Bonus de Bienvenue</h3>
            <p className="text-sm font-bold opacity-80 mb-6 leading-relaxed">Doublez votre premier dépôt crypto jusqu&apos;à <span className="bg-[#0f172a] text-green-400 px-2 py-0.5 rounded">0.5 ETH</span> !</p>
            <button className="w-full bg-[#0f172a] text-green-400 font-black py-4 rounded-2xl shadow-xl hover:translate-y-[-2px] transition-all duration-300 uppercase tracking-widest text-xs">Profiter du Bonus</button>
          </div>

          <div className="glass rounded-[2.5rem] p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-black text-sm uppercase tracking-widest">Mes Paris</h3>
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            </div>
            <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-3xl">
              <p className="text-white/20 text-[10px] font-black uppercase tracking-widest">Aucun pari actif</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function OddsButton({ label, odd }: { label: string, odd: number }) {
  const hasOdds = odd > 0;
  const formattedOdd = hasOdds ? Number(odd).toFixed(2) : 'N/A';

  return (
    <div
      className={`flex-1 md:w-28 transition-all duration-300 rounded-2xl px-4 py-4 flex flex-col items-center justify-center gap-1 border border-white/[0.03] group-bet ${hasOdds
        ? 'glass hover:bg-green-500 hover:border-green-400 hover:translate-y-[-2px] hover:shadow-lg hover:shadow-green-500/20'
        : 'bg-white/[0.02] opacity-30 cursor-not-allowed'
        }`}
    >
      <span className={`text-[10px] font-black tracking-widest uppercase mb-1 ${hasOdds ? 'text-white/40 group-bet-hover:text-[#0f172a]' : 'text-white/20'}`}
      >
        {label}
      </span>
      <span className={`${hasOdds ? 'text-green-500 font-black group-hover:text-[#0f172a]' : 'text-white/20'} font-mono text-lg transition-colors`}
      >
        {formattedOdd}
      </span>
    </div>
  );
}
