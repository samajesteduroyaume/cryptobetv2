import { NextResponse } from 'next/server';
import { addBet, getMatch } from '@/lib/db';
import { randomBytes } from 'crypto';
import QRCode from 'qrcode';
import { isValidEthereumAddress, isValidBetAmount, isValidPrediction, isValidMatchId } from '@/lib/utils/validation';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { matchId, userAddress, prediction, amount, currency } = body;

        // Validation des paramètres
        if (!matchId || !userAddress || !prediction || !amount) {
            return NextResponse.json(
                { error: 'Paramètres manquants' },
                { status: 400 }
            );
        }

        // Validation de l'adresse Ethereum
        if (!isValidEthereumAddress(userAddress)) {
            return NextResponse.json(
                { error: 'Adresse Ethereum invalide' },
                { status: 400 }
            );
        }

        // Validation du montant
        const amountValidation = isValidBetAmount(parseFloat(amount));
        if (!amountValidation.valid) {
            return NextResponse.json(
                { error: amountValidation.error },
                { status: 400 }
            );
        }

        // Validation de la prédiction
        if (!isValidPrediction(prediction)) {
            return NextResponse.json(
                { error: 'Prédiction invalide (doit être 1, 2 ou 3)' },
                { status: 400 }
            );
        }

        // Validation de l'ID du match
        if (!isValidMatchId(matchId)) {
            return NextResponse.json(
                { error: 'ID de match invalide' },
                { status: 400 }
            );
        }

        // Récupérer le match
        const match = await getMatch(parseInt(matchId));
        if (!match) {
            return NextResponse.json({ error: 'Match non trouvé' }, { status: 404 });
        }

        // Générer ID de pari
        const betId = randomBytes(16).toString('hex');

        // Adresse de paiement (wallet master)
        const paymentAddress = process.env.NEXT_PUBLIC_MASTER_WALLET_ADDRESS || '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';

        // Calculer les cotes et gains potentiels
        let odds: number;
        if (prediction === 1) odds = match.odds_team1;
        else if (prediction === 2) odds = match.odds_team2;
        else if (prediction === 3) odds = match.odds_draw;
        else return NextResponse.json({ error: 'Prédiction invalide' }, { status: 400 });

        const potentialWin = parseFloat(amount) * odds;

        const bet = {
            id: betId,
            match_id: parseInt(matchId),
            user_address: userAddress,
            prediction,
            amount: parseFloat(amount),
            currency: currency || 'ETH',
            odds,
            potential_win: potentialWin,
            status: 'pending' as const,
            payment_address: paymentAddress,
            payment_status: 'waiting' as const,
        };

        await addBet(bet);

        // Générer QR code
        const paymentUri = `ethereum:${paymentAddress}?value=${amount}`;
        const qrCode = await QRCode.toDataURL(paymentUri);

        return NextResponse.json({
            betId: bet.id,
            ...bet,
            qrCode,
        });
    } catch (error: unknown) {
        console.error('Error in /api/bets:', error);
        const errorMessage = error instanceof Error ? error.message : 'Erreur interne du serveur';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
