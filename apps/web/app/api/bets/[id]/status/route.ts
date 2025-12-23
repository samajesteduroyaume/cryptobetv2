import { NextResponse } from 'next/server';
import { getBet, updateBet } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const bet = await getBet(params.id);

        if (!bet) {
            return NextResponse.json({ error: 'Pari non trouvé' }, { status: 404 });
        }

        // Si déjà confirmé, retourner directement
        if (bet.payment_status === 'confirmed') {
            return NextResponse.json({ status: 'confirmed', bet });
        }

        // TODO: Implémenter la vérification réelle du paiement blockchain
        // Pour une vraie implémentation, utiliser Etherscan API ou un provider Web3:
        // - Vérifier les transactions vers payment_address
        // - Confirmer que le montant correspond
        // - Vérifier que la transaction a suffisamment de confirmations

        // Simulation temporaire pour le développement
        const betAge = bet.created_at ? Date.now() - new Date(bet.created_at).getTime() : 0;
        if (betAge > 30000 && Math.random() > 0.5) {
            const updatedBet = await updateBet(params.id, {
                payment_status: 'confirmed',
                confirmed_at: new Date().toISOString(),
            });
            return NextResponse.json({ status: 'confirmed', bet: updatedBet });
        }

        return NextResponse.json({ status: 'waiting', bet });
    } catch (error: unknown) {
        console.error('Error in /api/bets/[id]/status:', error);
        const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la vérification du statut';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
