import { NextResponse } from 'next/server';
import { getUpcomingMatches } from '@/lib/services/sportsApi';
import { addMatch, getAllMatches } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        console.log(`[API_ROUTE] Appel /api/matches (Client: ${request.headers.get('user-agent')?.slice(0, 20)}...)`);

        let matches = await getAllMatches();
        console.log(`[API_ROUTE] Matchs en mémoire: ${matches.length}`);

        if (matches.length < 5) {
            console.log(`[API_ROUTE] 🔄 Trop peu de matchs, tentative de rafraîchissement API...`);
            const apiMatches = await getUpcomingMatches();
            console.log(`[API_ROUTE] 📥 Reçu de l'API: ${apiMatches.length} matchs`);

            if (apiMatches.length > 0) {
                for (const match of apiMatches) {
                    await addMatch(match);
                }
                matches = await getAllMatches();
            }
        }

        return NextResponse.json({
            matches,
            _debug: {
                timestamp: new Date().toISOString(),
                count: matches.length,
                env_key_present: !!process.env.API_SPORTS_KEY
            }
        });
    } catch (error: any) {
        console.error('Error in /api/matches:', error);
        const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la récupération des matchs';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
