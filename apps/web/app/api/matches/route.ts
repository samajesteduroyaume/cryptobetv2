import { NextResponse } from 'next/server';
import { getUpcomingMatches } from '@/lib/services/sportsApi';
import { addMatch, getAllMatches } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Récupérer les matchs existants
        let matches = await getAllMatches();

        // Si pas de matchs ou trop peu, les récupérer depuis l'API
        if (matches.length < 5) {
            const apiMatches = await getUpcomingMatches();
            if (apiMatches.length > 0) {
                // On vide l'ancien store pour éviter les doublons ou donner la priorité au nouveau
                // Dans db.ts on pourrait avoir un clearMatches, sinon on fait avec les moyens du bord
                for (const match of apiMatches) {
                    await addMatch(match);
                }
                matches = await getAllMatches();
            }
        }

        return NextResponse.json({ matches });
    } catch (error: unknown) {
        console.error('Error in /api/matches:', error);
        const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la récupération des matchs';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
