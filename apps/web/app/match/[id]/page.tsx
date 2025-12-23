"use client";

import Image from 'next/image'
import Link from 'next/link'
import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useAccount } from 'wagmi'
import { ChevronLeft, Loader2, TrendingUp, Users, PieChart, CheckCircle2, Clock } from 'lucide-react'
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
        const foundMatch = data.matches?.[parseInt(id) - 1]; // Index basé sur l'ID
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
        <Loader2 className="w-12 h-12 text-buttonOrange animate-spin" />
        <p className="text-white">Chargement du match...</p>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-white text-2xl font-bold">Match non trouvé</p>
        <Link href="/" className="text-buttonOrange hover:underline">
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
        <div className='bg-lightGray/10 backdrop-blur-xl border border-white/5 rounded-3xl p-10'>
          <h1 className="text-4xl font-black text-white mb-8 text-center">
            {paymentStatus === 'waiting' ? '⏳ En attente de paiement' : '✅ Pari confirmé !'}
          </h1>

          {paymentStatus === 'waiting' && (
            <>
              <div className="bg-white p-8 rounded-3xl mb-8 flex justify-center">
                {betData.qrCode && <Image src={betData.qrCode} alt="QR Code" width={256} height={256} className="w-64 h-64" unoptimized />}
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6 mb-6">
                <p className="text-white font-bold mb-4">📱 Scannez le QR code ou envoyez manuellement :</p>
                <div className="bg-black/30 rounded-xl p-4 mb-4">
                  <p className="text-white/60 text-sm mb-2">Adresse :</p>
                  <p className="text-white font-mono text-sm break-all">{betData.paymentAddress}</p>
                </div>
                <div className="bg-black/30 rounded-xl p-4">
                  <p className="text-white/60 text-sm mb-2">Montant :</p>
                  <p className="text-white font-mono text-2xl">{betData.amount} ETH</p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 text-yellow-400">
                <Clock className="w-6 h-6 animate-pulse" />
                <p>Vérification automatique toutes les 10 secondes...</p>
              </div>
            </>
          )}

          {paymentStatus === 'confirmed' && (
            <div className="text-center">
              <CheckCircle2 className="w-24 h-24 text-green-400 mx-auto mb-6" />
              <p className="text-white text-xl mb-8">Votre pari a été confirmé avec succès !</p>
              <Link href="/my-bets" className="bg-buttonOrange text-white px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-transform inline-block">
                Voir mes paris
              </Link>
            </div>
          )}

          <Link href="/" className="block text-center text-white/60 hover:text-white mt-8">
            ← Retour aux matchs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full max-w-7xl mx-auto py-12 px-6'>
      <div className='bg-lightGray/10 backdrop-blur-xl border border-white/5 rounded-3xl p-10 relative overflow-hidden'>
        <div className="absolute top-0 right-0 w-64 h-64 bg-buttonOrange/10 blur-[100px] rounded-full -mr-32 -mt-32" />

        <Link
          href={'/'}
          className={'flex items-center gap-2 text-white/60 hover:text-buttonOrange transition-colors mb-12 w-fit group'}
        >
          <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xl">Retour aux matchs</span>
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-white mb-4">{match.name}</h1>
          <div className="flex items-center justify-center gap-4">
            <div className="px-6 py-3 bg-white/5 rounded-full">
              <span className="text-white/60 text-lg">{new Date(match.start_time).toLocaleDateString('fr-FR')}</span>
            </div>
            <div className="flex items-center gap-2 px-6 py-3 bg-green-500/20 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-400 font-bold">DISPONIBLE</span>
            </div>
          </div>
        </div>

        <div className='flex flex-col items-center'>
          <div className='grid grid-cols-3 gap-6 w-full max-w-4xl mb-12'>
            {/* Team 1 */}
            <button
              onClick={() => setSelectedTeam(1)}
              className={`relative group rounded-3xl p-8 flex flex-col items-center transition-all duration-300 ${selectedTeam === 1
                ? 'bg-gradient-to-br from-blue-500/30 to-blue-600/20 ring-4 ring-blue-500/50 scale-105'
                : 'bg-white/5 hover:bg-white/10 hover:scale-102'
                }`}
            >
              <div className="relative w-32 h-32 mb-4">
                <Image
                  src={match.team1_logo}
                  alt={match.team1_name}
                  width={128}
                  height={128}
                  className='drop-shadow-2xl object-contain'
                />
              </div>
              <p className={`text-lg font-bold mb-4 ${selectedTeam === 1 ? 'text-white' : 'text-white/80'}`}>
                {match.team1_name}
              </p>
              <div className="bg-black/30 rounded-2xl px-8 py-4">
                <p className="text-5xl font-black text-white font-mono">{match.odds_team1.toFixed(2)}</p>
              </div>
            </button>

            {/* Draw */}
            <button
              onClick={() => setSelectedTeam(3)}
              className={`relative group rounded-3xl p-8 flex flex-col items-center justify-center transition-all duration-300 ${selectedTeam === 3
                ? 'bg-gradient-to-br from-yellow-500/30 to-yellow-600/20 ring-4 ring-yellow-500/50 scale-105'
                : 'bg-white/5 hover:bg-white/10 hover:scale-102'
                }`}
            >
              <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-6xl">🤝</span>
              </div>
              <p className={`text-lg font-bold mb-4 ${selectedTeam === 3 ? 'text-white' : 'text-white/80'}`}>
                Match Nul
              </p>
              <div className="bg-black/30 rounded-2xl px-8 py-4">
                <p className="text-5xl font-black text-white font-mono">{match.odds_draw.toFixed(2)}</p>
              </div>
            </button>

            {/* Team 2 */}
            <button
              onClick={() => setSelectedTeam(2)}
              className={`relative group rounded-3xl p-8 flex flex-col items-center transition-all duration-300 ${selectedTeam === 2
                ? 'bg-gradient-to-br from-red-500/30 to-red-600/20 ring-4 ring-red-500/50 scale-105'
                : 'bg-white/5 hover:bg-white/10 hover:scale-102'
                }`}
            >
              <div className="relative w-32 h-32 mb-4">
                <Image
                  src={match.team2_logo}
                  alt={match.team2_name}
                  width={128}
                  height={128}
                  className='drop-shadow-2xl object-contain'
                />
              </div>
              <p className={`text-lg font-bold mb-4 ${selectedTeam === 2 ? 'text-white' : 'text-white/80'}`}>
                {match.team2_name}
              </p>
              <div className="bg-black/30 rounded-2xl px-8 py-4">
                <p className="text-5xl font-black text-white font-mono">{match.odds_team2.toFixed(2)}</p>
              </div>
            </button>
          </div>

          <div className='mt-8 flex flex-col items-center gap-8 w-full max-w-md'>
            <div className='relative w-full'>
              <input
                type="number"
                step="0.01"
                value={ethAmount}
                onChange={(e) => setEthAmount(e.target.value)}
                placeholder="Montant en ETH"
                className='w-full bg-white/5 border border-white/10 focus:border-buttonOrange/50 focus:ring-4 focus:ring-buttonOrange/10 rounded-2xl p-6 text-2xl text-white placeholder:text-white/20 outline-none transition-all'
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-white/40 font-bold uppercase">ETH</span>
            </div>

            {selectedTeam > 0 && ethAmount && (
              <div className="w-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl p-6">
                <p className="text-white/60 text-sm mb-2">Gain potentiel</p>
                <p className="text-green-400 text-4xl font-black">{potentialWin.toFixed(4)} ETH</p>
                <p className="text-white/40 text-sm mt-2">
                  Cote: {selectedTeam === 1 ? match.odds_team1 : selectedTeam === 2 ? match.odds_team2 : match.odds_draw}x
                </p>
              </div>
            )}

            <button
              onClick={handlePlaceBet}
              disabled={!selectedTeam || !ethAmount || !address || isPlacingBet}
              className="w-full bg-gradient-to-r from-buttonOrange to-orange-600 text-white px-8 py-6 rounded-2xl font-black text-xl hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
            >
              {isPlacingBet ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Création du pari...
                </>
              ) : !address ? (
                'Connectez votre wallet'
              ) : (
                'Placer le pari'
              )}
            </button>

            {!address && (
              <div className="w-full bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6 text-center">
                <p className="text-yellow-400 font-bold mb-2">⚠️ Wallet non connecté</p>
                <p className="text-white/60 text-sm">
                  Connectez votre wallet en haut à droite pour placer un pari.
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