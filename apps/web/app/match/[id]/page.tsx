"use client";

import Image from 'next/image'
import Link from 'next/link'
import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useAccount } from 'wagmi'
import { ChevronLeft, Loader2, TrendingUp, Users, PieChart, CheckCircle2, Clock, Calendar } from 'lucide-react'
import type { Match, BetWithQR } from '@/src/types'

export const dynamic = 'force-dynamic';

const Match = () => {
  const params = useParams();
  const id = params.id as string;
  const { address } = useAccount();

  const [match, setMatch] = useState<Match | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<number>(0);
  const [ethAmount, setEthAmount] = useState<string>("");
  const [betData, setBetData] = useState<BetWithQR | null>(null);
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string>('');

  // Récupérer le match depuis les API Routes Next.js
  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const response = await fetch('/api/matches');
        const data = await response.json();
        const foundMatch = data.matches?.find((m: Match) => String(m.external_id) === id);
        setMatch(foundMatch || null);
      } catch (error) {
        console.error('Error fetching match:', error);
        setMatch(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatch();
  }, [id]);

  // Polling du statut de paiement
  useEffect(() => {
    if (!betData?.betId) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/bets/${betData.betId}/status`);
        const data = await response.json();

        if (data.status === 'confirmed') {
          setPaymentStatus('confirmed');
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
      }
    }, 10000); // Vérifier toutes les 10 secondes

    return () => clearInterval(interval);
  }, [betData]);

  const calculatePotentialWin = () => {
    if (!ethAmount || !selectedTeam || !match) return 0;
    const amount = parseFloat(ethAmount);

    if (selectedTeam === 1) return amount * match.odds_team1;
    if (selectedTeam === 2) return amount * match.odds_team2;
    if (selectedTeam === 3) return amount * match.odds_draw;
    return 0;
  };

  const handlePlaceBet = async () => {
    if (!selectedTeam || !ethAmount || !address) {
      alert('Veuillez sélectionner une équipe, un montant et connecter votre wallet');
      return;
    }

    setIsPlacingBet(true);
    try {
      const response = await fetch('/api/bets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: id,
          userAddress: address,
          prediction: selectedTeam,
          amount: parseFloat(ethAmount),
          currency: 'ETH',
        }),
      });

      const data = await response.json();
      if (data.error) {
        alert(`Erreur: ${data.error}`);
      } else {
        setBetData(data);
        setPaymentStatus('waiting');
      }
    } catch (error) {
      console.error('Error placing bet:', error);
      alert('Erreur lors de la création du pari');
    } finally {
      setIsPlacingBet(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-green-500 animate-spin" />
        <p className="text-white/60 font-black tracking-widest uppercase text-xs">Chargement du match...</p>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-white text-2xl font-black italic uppercase">Match non trouvé</p>
        <Link href="/" className="text-orange-500 hover:text-orange-400 font-bold uppercase tracking-widest text-xs">
          Retour à l&apos;accueil
        </Link>
      </div>
    );
  }

  const potentialWin = calculatePotentialWin();

  // Affichage du QR code de paiement
  if (betData && paymentStatus !== 'confirmed') {
    return (
      <div className='w-full max-w-4xl mx-auto py-12 px-6'>
        <div className='glass rounded-[3rem] p-12 relative overflow-hidden'>
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 blur-[120px] rounded-full -mr-32 -mt-32" />

          <h1 className="text-4xl font-black text-white mb-12 text-center italic tracking-tighter">
            {paymentStatus === 'waiting' ? <span className="text-orange-500 uppercase">En attente de paiement</span> : 'CONFIRMÉ !'}
          </h1>

          {paymentStatus === 'waiting' && (
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="glass bg-white p-8 rounded-[2.5rem] shadow-2xl flex justify-center">
                {betData.qrCode && <Image src={betData.qrCode} alt="QR Code" width={256} height={256} className="w-64 h-64" unoptimized />}
              </div>

              <div className="space-y-6">
                <div className="glass p-6 rounded-3xl">
                  <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2">Adresse de paiement</p>
                  <p className="text-white font-mono text-sm break-all bg-black/40 p-4 rounded-xl border border-white/5">{betData.paymentAddress}</p>
                </div>

                <div className="glass p-6 rounded-3xl">
                  <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2">Montant à envoyer</p>
                  <p className="text-green-400 font-mono text-4xl font-black">{betData.amount} ETH</p>
                </div>

                <div className="flex items-center gap-4 text-orange-400 bg-orange-500/10 p-4 rounded-2xl border border-orange-500/20">
                  <Clock className="w-6 h-6 animate-spin" />
                  <p className="text-xs font-bold uppercase tracking-wider">Vérification en cours...</p>
                </div>
              </div>
            </div>
          )}

          <Link href="/" className="block text-center text-white/30 hover:text-white mt-12 font-bold uppercase tracking-[0.2em] text-[10px] transition-colors">
            Annuler et retourner aux matchs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full max-w-7xl mx-auto py-12 px-6'>
      <div className='glass rounded-[3rem] p-12 relative overflow-hidden'>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/5 blur-[150px] rounded-full -mr-64 -mt-64" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-green-500/5 blur-[150px] rounded-full -ml-64 -mb-64" />

        <Link
          href={'/'}
          className={'flex items-center gap-2 text-white/40 hover:text-green-500 transition-all mb-12 w-fit group font-black uppercase tracking-widest text-xs'}
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Retour au Dashboard</span>
        </Link>

        <div className="text-center mb-16 relative">
          <div className="inline-block px-4 py-1.5 glass rounded-full mb-6 border-white/10">
            <span className="text-orange-500 font-black text-[10px] uppercase tracking-[0.3em]">{match.name}</span>
          </div>
          <h1 className="text-6xl font-black text-white mb-6 italic tracking-tighter uppercase">{match.team1_name} <span className="text-white/20 not-italic">vs</span> {match.team2_name}</h1>
          <div className="flex items-center justify-center gap-6">
            <div className="flex items-center gap-2 px-6 py-3 glass rounded-2xl border-white/5">
              <Calendar className="w-4 h-4 text-green-500" />
              <span className="text-white/60 font-bold">{new Date(match.start_time).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
            </div>
          </div>
        </div>

        <div className='flex flex-col items-center'>
          <div className='grid md:grid-cols-3 gap-8 w-full max-w-6xl mb-16'>
            {/* Team 1 */}
            <button
              onClick={() => setSelectedTeam(1)}
              className={`relative group rounded-[2.5rem] p-10 flex flex-col items-center transition-all duration-500 border border-white/5 ${selectedTeam === 1
                ? 'bg-gradient-to-br from-green-500/20 to-emerald-600/10 border-green-500/50 shadow-2xl shadow-green-500/20 scale-105'
                : 'glass hover:bg-white/[0.05] hover:scale-[1.02]'
                }`}
            >
              <div className="relative w-40 h-40 mb-8 filter drop-shadow-[0_0_30px_rgba(34,197,94,0.1)] group-hover:scale-110 transition-transform duration-500">
                <Image src={match.team1_logo} alt={match.team1_name} fill className='object-contain' />
              </div>
              <p className={`text-xl font-black mb-6 uppercase tracking-widest ${selectedTeam === 1 ? 'text-green-400' : 'text-white'}`}>
                {match.team1_name}
              </p>
              <div className={`rounded-2xl px-10 py-5 transition-all duration-500 ${selectedTeam === 1 ? 'bg-green-500 text-[#0f172a]' : 'bg-white/5 text-white'}`}>
                <p className="text-6xl font-black font-mono tracking-tighter">{match.odds_team1.toFixed(2)}</p>
              </div>
            </button>

            {/* Draw */}
            <button
              onClick={() => setSelectedTeam(3)}
              className={`relative group rounded-[2.5rem] p-10 flex flex-col items-center justify-center transition-all duration-500 border border-white/5 ${selectedTeam === 3
                ? 'bg-gradient-to-br from-orange-500/20 to-amber-600/10 border-orange-500/50 shadow-2xl shadow-orange-500/20 scale-105'
                : 'glass hover:bg-white/[0.05] hover:scale-[1.02]'
                }`}
            >
              <div className="w-40 h-40 bg-white/[0.03] rounded-full flex items-center justify-center mb-8 border border-white/5 group-hover:rotate-12 transition-transform duration-500">
                <Users className="w-20 h-20 text-orange-500" />
              </div>
              <p className={`text-xl font-black mb-6 uppercase tracking-widest ${selectedTeam === 3 ? 'text-orange-400' : 'text-white'}`}>
                MATCH NUL
              </p>
              <div className={`rounded-2xl px-10 py-5 transition-all duration-500 ${selectedTeam === 3 ? 'bg-orange-500 text-[#0f172a]' : 'bg-white/5 text-white'}`}>
                <p className="text-6xl font-black font-mono tracking-tighter">{match.odds_draw.toFixed(2)}</p>
              </div>
            </button>

            {/* Team 2 */}
            <button
              onClick={() => setSelectedTeam(2)}
              className={`relative group rounded-[2.5rem] p-10 flex flex-col items-center transition-all duration-500 border border-white/5 ${selectedTeam === 2
                ? 'bg-gradient-to-br from-green-500/20 to-emerald-600/10 border-green-500/50 shadow-2xl shadow-green-500/20 scale-105'
                : 'glass hover:bg-white/[0.05] hover:scale-[1.02]'
                }`}
            >
              <div className="relative w-40 h-40 mb-8 filter drop-shadow-[0_0_30px_rgba(34,197,94,0.1)] group-hover:scale-110 transition-transform duration-500">
                <Image src={match.team2_logo} alt={match.team2_name} fill className='object-contain' />
              </div>
              <p className={`text-xl font-black mb-6 uppercase tracking-widest ${selectedTeam === 2 ? 'text-green-400' : 'text-white'}`}>
                {match.team2_name}
              </p>
              <div className={`rounded-2xl px-10 py-5 transition-all duration-500 ${selectedTeam === 2 ? 'bg-green-500 text-[#0f172a]' : 'bg-white/5 text-white'}`}>
                <p className="text-6xl font-black font-mono tracking-tighter">{match.odds_team2.toFixed(2)}</p>
              </div>
            </button>
          </div>

          <div className='flex flex-col items-center gap-10 w-full max-w-xl'>
            <div className='relative w-full group'>
              <input
                type="number"
                step="0.01"
                value={ethAmount}
                onChange={(e) => setEthAmount(e.target.value)}
                placeholder="Montant du pari"
                className='w-full glass border border-white/10 focus:border-green-500/50 focus:ring-[15px] focus:ring-green-500/5 rounded-[2.5rem] p-10 text-4xl text-white placeholder:text-white/10 outline-none transition-all font-black'
              />
              <span className="absolute right-10 top-1/2 -translate-y-1/2 text-white/20 font-black text-2xl uppercase italic tracking-widest">ETH</span>
            </div>

            {selectedTeam > 0 && ethAmount && (
              <div className="w-full bg-gradient-to-br from-green-500 to-emerald-700 rounded-[2.5rem] p-10 shadow-2xl shadow-green-500/10 flex justify-between items-center group overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                <div>
                  <p className="text-[#0f172a]/60 text-xs font-black uppercase tracking-widest mb-2">Gain potentiel</p>
                  <p className="text-[#0f172a] text-5xl font-black tracking-tighter">{potentialWin.toFixed(4)} ETH</p>
                </div>
                <div className="text-right">
                  <p className="text-[#0f172a]/40 text-[10px] font-black uppercase tracking-widest mb-1">Cote appliquée</p>
                  <p className="text-[#0f172a] text-2xl font-black italic">
                    {selectedTeam === 1 ? match.odds_team1 : selectedTeam === 2 ? match.odds_team2 : match.odds_draw}x
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={handlePlaceBet}
              disabled={!selectedTeam || !ethAmount || !address || isPlacingBet}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white p-8 rounded-[2rem] font-black text-2xl hover:translate-y-[-4px] active:translate-y-[1px] transition-all shadow-2xl shadow-orange-500/20 disabled:opacity-30 disabled:translate-y-0 disabled:shadow-none flex items-center justify-center gap-4 uppercase italic tracking-tighter"
            >
              {isPlacingBet ? (
                <>
                  <Loader2 className="w-8 h-8 animate-spin" />
                  Traitement...
                </>
              ) : !address ? (
                'Connect Wallet'
              ) : (
                'Confirmer le Paris'
              )}
            </button>

            {!address && (
              <div className="glass border-orange-500/20 rounded-3xl p-8 text-center w-full">
                <p className="text-orange-500 font-black uppercase tracking-widest text-[10px] mb-2">Attention</p>
                <p className="text-white/60 text-xs font-bold">
                  Veuillez connecter votre wallet pour accéder aux fonctionnalités de pari.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Match