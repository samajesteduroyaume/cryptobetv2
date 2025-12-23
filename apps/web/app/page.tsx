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
  const [selectedSport, setSelectedSport] = useState('football');

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
    : liveEvents.filter(match => match.sport_type === selectedSport || (selectedSport === 'football' && !match.sport_type));

  const matchesByLeague = filteredMatches.reduce((acc: Record<string, Match[]>, match: Match) => {
    const league = match.name || 'Autres';
    if (!acc[league]) acc[league] = [];
    acc[league].push(match);
    return acc;
  }, {});

  const sportsTabs = [
    { id: 'football', label: 'Football', icon: '⚽' },
    { id: 'basketball', label: 'Basketball', icon: '🏀' },
    { id: 'tennis', label: 'Tennis', icon: '🎾' },
    { id: 'racing', label: 'Auto-Moto', icon: '🏎️' },
  ];

  return (
    <div className="w-full max-w-[1600px] mx-auto p-6 min-h-screen bg-[#0f172a]">

      <div className="flex items-center gap-1 mb-6 border-b border-white/10 pb-1 overflow-x-auto no-scrollbar">
        {sportsTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedSport(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-t-lg text-sm font-bold transition-all whitespace-nowrap ${selectedSport === tab.id
              ? 'bg-white text-[#0f172a] border-t-2 border-green-500'
              : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
          >
            <span>{tab.icon}</span>
            {tab.label.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="flex gap-6">

        <div className="flex-1 space-y-6">

          {Object.keys(matchesByLeague).length === 0 && (
            <div className="text-center py-20 bg-[#1e293b] rounded-xl border border-white/5">
              <p className="text-white/40">Aucun match disponible pour ce sport actuellement.</p>
            </div>
          )}

          {Object.entries(matchesByLeague).map(([leagueName, matches]: [string, Match[]]) => (
            <div key={leagueName} className="bg-[#1e293b] rounded-xl overflow-hidden shadow-lg border border-white/5">

              <div className="px-4 py-3 bg-[#334155]/50 flex justify-between items-center border-b border-white/5">
                <div className="flex items-center gap-3">
                  <Star className="w-4 h-4 text-white/20 hover:text-yellow-400 cursor-pointer" />
                  <h3 className="text-white font-bold text-sm uppercase tracking-wide">{leagueName}</h3>
                </div>
                <Link href="#" className="text-xs text-green-400 hover:underline font-medium">Voir tout &gt;</Link>
              </div>

              <div className="divide-y divide-white/5">
                {matches.map((match, idx) => {
                  const date = new Date(match.start_time);
                  const hours = date.getHours().toString().padStart(2, '0');
                  const minutes = date.getMinutes().toString().padStart(2, '0');
                  const isLive = new Date() > date;

                  return (
                    <div key={idx} className="group p-4 hover:bg-white/[0.02] transition-colors flex flex-col md:flex-row md:items-center gap-4">

                      <div className="w-16 shrink-0 flex flex-col items-center justify-center text-xs text-white/40">
                        {isLive ? (
                          <span className="text-red-500 font-bold animate-pulse">LIVE</span>
                        ) : (
                          <>
                            <span className="font-bold text-white">{hours}:{minutes}</span>
                            <span className="text-[10px]">{date.getDate()}/{date.getMonth() + 1}</span>
                          </>
                        )}
                      </div>

                      <div className="flex-1 flex flex-col justify-center gap-2">
                        <div className="flex items-center gap-3">
                          <Image src={match.team1_logo} alt={match.team1_name} width={20} height={20} className="object-contain" />
                          <span className="text-white font-medium text-sm group-hover:text-green-400 transition-colors cursor-pointer">{match.team1_name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Image src={match.team2_logo} alt={match.team2_name} width={20} height={20} className="object-contain" />
                          <span className="text-white font-medium text-sm group-hover:text-green-400 transition-colors cursor-pointer">{match.team2_name}</span>
                        </div>
                      </div>

                      <div className="hidden lg:flex items-center gap-2 mr-4">
                        <div className="text-xs text-white/20 hover:text-white cursor-pointer transition-colors">
                          <TrendingUp className="w-4 h-4" />
                        </div>
                      </div>

                      <div className="flex gap-1 w-full md:w-auto">
                        <OddsButton label="1" odd={match.odds_team1} team={match.team1_name} />
                        <OddsButton label="N" odd={match.odds_draw || 3.50} team="Match Nul" />
                        <OddsButton label="2" odd={match.odds_team2} team={match.team2_name} />
                      </div>

                      <div className="w-12 text-center text-xs text-white/30 hover:text-white cursor-pointer hidden md:block">
                        +142
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="w-80 hidden xl:block space-y-6">
          <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-6 text-white shadow-lg">
            <h3 className="font-bold text-lg mb-2">Bonus de Bienvenue</h3>
            <p className="text-sm opacity-90 mb-4">Doublez votre premier dépôt crypto jusqu&apos;à 0.5 ETH !</p>
            <button className="w-full bg-white text-green-800 font-bold py-2 rounded shadow hover:bg-gray-100 transition-colors">Profiter</button>
          </div>

          <div className="bg-[#1e293b] rounded-xl border border-white/5 p-4">
            <h3 className="text-white font-bold text-sm mb-4">Mes Paris en cours</h3>
            <div className="text-center py-8 text-white/20 text-xs">
              Aucun pari actif
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function OddsButton({ label, odd, team }: { label: string, odd: number, team: string }) {
  const formattedOdd = Number(odd).toFixed(2);

  return (
    <button className="flex-1 md:w-24 bg-[#334155]/30 hover:bg-green-500 hover:text-[#0f172a] transition-all duration-200 rounded px-2 py-3 flex flex-col items-center justify-center gap-0.5 border border-white/5 group-bet">
      <span className="text-[10px] text-white/40 group-bet-hover:text-[#0f172a]/70 font-bold">{label}</span>
      <span className="text-green-400 group-hover:text-[#0f172a] font-bold font-mono text-sm">{formattedOdd}</span>
    </button>
  );
}
