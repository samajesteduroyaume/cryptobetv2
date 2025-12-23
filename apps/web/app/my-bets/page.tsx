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
                <Loader2 className="w-12 h-12 text-buttonOrange animate-spin" />
                <p className="text-white text-xl">Chargement de vos paris...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center p-10">
                <p className="text-red-500 text-2xl font-bold">Erreur de connexion</p>
                <p className="text-white/60">Impossible de récupérer vos paris</p>
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
        if (!event) return { status: 'unknown', label: 'Inconnu', color: 'text-white/40' };

        if (event.isActive) {
            return { status: 'pending', label: 'En cours', color: 'text-yellow-400', icon: Clock };
        }

        if (event.result === 0) {
            return { status: 'waiting', label: 'En attente', color: 'text-blue-400', icon: Clock };
        }

        if (bet.paid) {
            return { status: 'won', label: 'Gagné', color: 'text-green-400', icon: Trophy };
        }

        if (event.result !== bet.predictedResult) {
            return { status: 'lost', label: 'Perdu', color: 'text-red-400', icon: XCircle };
        }

        return { status: 'won', label: 'Gagné', color: 'text-green-400', icon: Trophy };
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
        <div className="w-full max-w-7xl mx-auto p-10">
            {/* Header */}
            <div className="mb-12">
                <h1 className="text-5xl font-black text-white mb-4">Mes Paris</h1>
                <p className="text-white/60 text-xl">Suivez vos paris et vos statistiques</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <div className="bg-lightGray/10 backdrop-blur-xl border border-white/5 rounded-3xl p-6">
                    <p className="text-white/40 text-sm mb-2">Total misé</p>
                    <p className="text-white text-3xl font-black">{stats.totalStaked.toFixed(4)} ETH</p>
                </div>
                <div className="bg-lightGray/10 backdrop-blur-xl border border-white/5 rounded-3xl p-6">
                    <p className="text-white/40 text-sm mb-2">Total gagné</p>
                    <p className="text-green-400 text-3xl font-black">{stats.totalWon.toFixed(4)} ETH</p>
                </div>
                <div className="bg-lightGray/10 backdrop-blur-xl border border-white/5 rounded-3xl p-6">
                    <p className="text-white/40 text-sm mb-2">Profit net</p>
                    <div className="flex items-center gap-2">
                        {stats.netProfit >= 0 ? (
                            <TrendingUp className="w-6 h-6 text-green-400" />
                        ) : (
                            <TrendingDown className="w-6 h-6 text-red-400" />
                        )}
                        <p className={`text-3xl font-black ${stats.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {stats.netProfit >= 0 ? '+' : ''}{stats.netProfit.toFixed(4)} ETH
                        </p>
                    </div>
                </div>
                <div className="bg-lightGray/10 backdrop-blur-xl border border-white/5 rounded-3xl p-6">
                    <p className="text-white/40 text-sm mb-2">Taux de réussite</p>
                    <p className="text-white text-3xl font-black">{stats.winRate}%</p>
                    <p className="text-white/40 text-xs mt-1">{stats.wins}V / {stats.losses}D / {stats.pending}P</p>
                </div>
            </div>

            {/* Bets List */}
            <div className="space-y-4">
                {bets.length === 0 ? (
                    <div className="text-center py-20 bg-lightGray/10 backdrop-blur-xl border border-white/5 rounded-3xl">
                        <p className="text-white/40 text-xl">Aucun pari pour le moment</p>
                        <p className="text-white/20 text-sm mt-2">Commencez à parier sur vos équipes favorites !</p>
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
                                className="bg-lightGray/10 backdrop-blur-xl border border-white/5 rounded-3xl p-6 hover:border-buttonOrange/30 transition-colors"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        <p className="text-white/60 text-sm mb-1">{event?.name || 'Événement inconnu'}</p>
                                        <p className="text-white text-2xl font-bold">
                                            {bet.predictedResult === 1 ? event?.team1name :
                                                bet.predictedResult === 2 ? event?.team2name :
                                                    'Match Nul'}
                                        </p>
                                    </div>
                                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${status.status === 'won' ? 'bg-green-500/20' :
                                        status.status === 'lost' ? 'bg-red-500/20' :
                                            'bg-yellow-500/20'
                                        }`}>
                                        {StatusIcon && <StatusIcon className={`w-5 h-5 ${status.color}`} />}
                                        <span className={`font-bold ${status.color}`}>{status.label}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-white/5 rounded-2xl p-4">
                                        <p className="text-white/40 text-xs mb-1">Mise</p>
                                        <p className="text-white text-xl font-bold">{amount.toFixed(4)} ETH</p>
                                    </div>
                                    <div className="bg-white/5 rounded-2xl p-4">
                                        <p className="text-white/40 text-xs mb-1">Cote</p>
                                        <p className="text-white text-xl font-bold font-mono">{odds.toFixed(2)}</p>
                                    </div>
                                    <div className="bg-white/5 rounded-2xl p-4">
                                        <p className="text-white/40 text-xs mb-1">
                                            {status.status === 'won' ? 'Gain' : 'Gain potentiel'}
                                        </p>
                                        <p className={`text-xl font-bold ${status.status === 'won' ? 'text-green-400' : 'text-white'
                                            }`}>
                                            {potentialWin.toFixed(4)} ETH
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
