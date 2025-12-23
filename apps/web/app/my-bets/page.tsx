"use client";

import { useAccount, useReadContract } from 'wagmi';
import BetsABI from '@/src/abi/Bets.json';
import { Loader2, Trophy, XCircle, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { formatEther } from 'viem';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

export const dynamic = 'force-dynamic';

export default function MyBetsPage() {
    const { address } = useAccount();

    const { data: userBets, isLoading, error } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: BetsABI.abi as any, // Type assertion for ABI compatibility
        functionName: 'getUserBets',
        args: address ? [address] : undefined,
    });

    const { data: allEvents } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: BetsABI.abi as any, // Type assertion for ABI compatibility
        functionName: 'getActiveEvents',
    });

    if (!address) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <p className="text-white text-2xl font-bold">Connectez votre wallet</p>
                <p className="text-white/60">Pour voir vos paris, veuillez connecter votre portefeuille</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-12 h-12 text-green-500 animate-spin" />
                <p className="text-white/40 font-black tracking-widest uppercase text-xs">Chargement de vos paris...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center p-10">
                <p className="text-red-500 text-2xl font-black uppercase italic tracking-tighter">Erreur de connexion</p>
                <p className="text-white/40 font-bold">Impossible de récupérer vos données sur la blockchain.</p>
            </div>
        );
    }

    const bets = (userBets as any[]) || [];
    const events = (allEvents as any[]) || [];

    const getEventById = (eventId: bigint) => {
        return events.find(e => e.id === eventId);
    };

    const getBetStatus = (bet: any) => {
        const event = getEventById(bet.eventId);
        if (!event) return { status: 'unknown', label: 'INCONNU', color: 'text-white/20' };

        if (event.isActive) {
            return { status: 'pending', label: 'EN COURS', color: 'text-orange-500', icon: Clock };
        }

        if (event.result === 0) {
            return { status: 'waiting', label: 'EN ATTENTE', color: 'text-orange-400', icon: Clock };
        }

        if (bet.paid) {
            return { status: 'won', label: 'GAGNÉ', color: 'text-green-500', icon: Trophy };
        }

        if (event.result !== bet.predictedResult) {
            return { status: 'lost', label: 'PERDU', color: 'text-red-500', icon: XCircle };
        }

        return { status: 'won', label: 'GAGNÉ', color: 'text-green-500', icon: Trophy };
    };

    const calculateStats = () => {
        let totalStaked = 0;
        let totalWon = 0;
        let wins = 0;
        let losses = 0;
        let pending = 0;

        bets.forEach((bet: any) => {
            const amount = Number(formatEther(bet.amount));
            totalStaked += amount;

            const status = getBetStatus(bet);
            if (status.status === 'won') {
                wins++;
                const payout = amount * (Number(bet.odds) / 100);
                totalWon += payout;
            } else if (status.status === 'lost') {
                losses++;
            } else {
                pending++;
            }
        });

        return {
            totalStaked,
            totalWon,
            netProfit: totalWon - totalStaked,
            wins,
            losses,
            pending,
            winRate: bets.length > 0 ? ((wins / (wins + losses)) * 100).toFixed(1) : '0',
        };
    };

    const stats = calculateStats();

    return (
        <div className="w-full max-w-7xl mx-auto p-6 md:p-12">
            {/* Header */}
            <div className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-1 bg-green-500 rounded-full"></div>
                    <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase italic">Mes Paris</h1>
                </div>
                <p className="text-white/40 text-sm font-bold tracking-widest uppercase">Gestion de portefeuille et historique des enjeux</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                <div className="glass rounded-[2rem] p-8 border-white/5">
                    <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Total misé</p>
                    <p className="text-white text-4xl font-black font-mono">{stats.totalStaked.toFixed(4)} <span className="text-sm font-bold opacity-30">ETH</span></p>
                </div>
                <div className="glass rounded-[2rem] p-8 border-green-500/10 shadow-lg shadow-green-500/5">
                    <p className="text-green-500/40 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Total gagné</p>
                    <p className="text-green-500 text-4xl font-black font-mono">{stats.totalWon.toFixed(4)} <span className="text-sm font-bold opacity-30">ETH</span></p>
                </div>
                <div className="glass rounded-[2rem] p-8 border-white/5">
                    <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Profit net</p>
                    <div className="flex items-end gap-2">
                        <p className={`text-4xl font-black font-mono ${stats.netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {stats.netProfit >= 0 ? '+' : ''}{stats.netProfit.toFixed(4)}
                        </p>
                        <span className="text-sm font-bold opacity-30 mb-1">ETH</span>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-emerald-700 rounded-[2rem] p-8 text-[#0f172a] shadow-2xl shadow-green-500/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full blur-2xl -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
                    <p className="text-[#0f172a]/60 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Win Rate</p>
                    <p className="text-4xl font-black italic">{stats.winRate}%</p>
                    <p className="text-[#0f172a]/40 text-[10px] font-black mt-2 uppercase">{stats.wins}V / {stats.losses}D / {stats.pending}P</p>
                </div>
            </div>

            {/* Bets List */}
            <div className="space-y-6">
                {bets.length === 0 ? (
                    <div className="text-center py-32 glass rounded-[3rem] border-white/5">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                            <TrendingUp className="w-10 h-10 text-white/10" />
                        </div>
                        <p className="text-white/40 text-xl font-black uppercase italic tracking-tighter">Aucun pari pour le moment</p>
                        <p className="text-white/10 text-[10px] font-black mt-4 uppercase tracking-[0.3em]">Scannez le dashboard pour trouver des opportunités</p>
                    </div>
                ) : (
                    bets.map((bet: any, index: number) => {
                        const event = getEventById(bet.eventId);
                        const status = getBetStatus(bet);
                        const StatusIcon = status.icon;
                        const amount = Number(formatEther(bet.amount));
                        const odds = Number(bet.odds) / 100;
                        const potentialWin = amount * odds;

                        return (
                            <div
                                key={index}
                                className="glass rounded-[2.5rem] p-8 hover:bg-white/[0.04] transition-all duration-300 border border-white/5 group"
                            >
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                                    <div className="flex-1">
                                        <p className="text-orange-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2">{event?.name || 'LIGUE INCONNUE'}</p>
                                        <div className="flex items-center gap-4">
                                            <div className="w-1.5 h-8 bg-white/10 rounded-full group-hover:bg-green-500 transition-colors"></div>
                                            <h2 className="text-white text-3xl font-black italic uppercase tracking-tighter">
                                                {bet.predictedResult === 1 ? event?.team1name :
                                                    bet.predictedResult === 2 ? event?.team2name :
                                                        'Match Nul'}
                                            </h2>
                                        </div>
                                    </div>
                                    <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl border border-white/5 glass ${status.status === 'won' ? 'text-green-500 shadow-lg shadow-green-500/10' :
                                        status.status === 'lost' ? 'text-red-500 shadow-lg shadow-red-500/10' :
                                            'text-orange-500 shadow-lg shadow-orange-500/10'
                                        }`}>
                                        {StatusIcon && <StatusIcon className="w-5 h-5 shrink-0" />}
                                        <span className="font-black text-xs uppercase tracking-widest tracking-[0.2em]">{status.label}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-black/30 rounded-2xl p-6 border border-white/[0.02]">
                                        <p className="text-white/20 text-[10px] font-black uppercase tracking-widest mb-2">Mise</p>
                                        <p className="text-white text-2xl font-black font-mono">{amount.toFixed(4)} <span className="text-sm opacity-20">ETH</span></p>
                                    </div>
                                    <div className="bg-black/30 rounded-2xl p-6 border border-white/[0.02]">
                                        <p className="text-white/20 text-[10px] font-black uppercase tracking-widest mb-2">Cote</p>
                                        <p className="text-white text-2xl font-black font-mono">{odds.toFixed(2)}x</p>
                                    </div>
                                    <div className={`rounded-2xl p-6 border ${status.status === 'won' ? 'bg-green-500 text-[#0f172a] shadow-xl shadow-green-500/5 border-none' : 'bg-black/30 border-white/[0.02] text-white'}`}>
                                        <p className={`${status.status === 'won' ? 'text-[#0f172a]/60' : 'text-white/20'} text-[10px] font-black uppercase tracking-widest mb-2`}>
                                            {status.status === 'won' ? 'Profit Réalisé' : 'Gain Potentiel'}
                                        </p>
                                        <p className="text-2xl font-black font-mono">
                                            {potentialWin.toFixed(4)} <span className={`${status.status === 'won' ? 'opacity-40' : 'opacity-20'} text-sm font-bold`}>ETH</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
