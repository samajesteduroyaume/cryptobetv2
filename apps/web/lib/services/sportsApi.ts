import axios from 'axios';
import { Match } from '@/src/types';

const API_KEY = process.env.API_SPORTS_KEY || '';
const FOOTBALL_URL = 'https://v3.football.api-sports.io';
const BASKETBALL_URL = 'https://v1.basketball.api-sports.io';
const BASEBALL_URL = 'https://v1.baseball.api-sports.io';
const F1_URL = 'https://v1.formula-1.api-sports.io';

const PRIORITY_LEAGUES = [
    39, // Premier League
    61, // Ligue 1
    140, // La Liga
    135, // Serie A
    78, // Bundesliga
    2, // Champions League
    3, // Europa League
    48, // League Cup (Carabao)
    94, // Primeira Liga (Portugal)
];

export async function getUpcomingMatches(): Promise<Match[]> {
    const allMatches: Match[] = [];
    const dates: string[] = [];

    console.log(`[SPORTS_API] 🚨 EMERGENCY FETCH START`);

    // 1. MATCHS EN DIRECT (Priorité)
    try {
        const liveRes = await axios.get(`${FOOTBALL_URL}/fixtures`, {
            headers: { 'x-apisports-key': API_KEY },
            params: { live: 'all' },
            timeout: 5000,
        });

        if (liveRes.data?.response) {
            console.log(`[SPORTS_API] 📡 ${liveRes.data.response.length} LIVE matches found`);
            liveRes.data.response.forEach((fixture: any) => {
                allMatches.push({
                    external_id: fixture.fixture.id,
                    name: fixture.league.name,
                    team1_name: fixture.teams.home.name,
                    team2_name: fixture.teams.away.name,
                    team1_logo: fixture.teams.home.logo || '',
                    team2_logo: fixture.teams.away.logo || '',
                    odds_team1: 1.85,
                    odds_team2: 2.15,
                    odds_draw: 3.20,
                    start_time: fixture.fixture.date,
                    status: 'active' as const,
                    sport_type: 'football',
                });
            });
        }
    } catch (err) {
        console.error("[SPORTS_API] Live Error:", err instanceof Error ? err.message : err);
    }

    // 2. TOUS LES MATCHS D'AUJOURD'HUI ET DEMAIN (Sans filtre de ligue)
    for (let i = 0; i < 3; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        dates.push(d.toISOString().split('T')[0]);
    }

    // Bulk /odds for dates (Best way to get many odds in few requests)
    for (const date of dates) {
        try {
            console.log(`[SPORTS_API] Fetching date ${date}...`);
            const [fixturesRes, oddsRes] = await Promise.allSettled([
                axios.get(`${FOOTBALL_URL}/fixtures`, {
                    headers: { 'x-apisports-key': API_KEY },
                    params: { date },
                    timeout: 8000,
                }),
                axios.get(`${FOOTBALL_URL}/odds`, {
                    headers: { 'x-apisports-key': API_KEY },
                    params: { date },
                    timeout: 8000,
                })
            ]);

            const fixturesData = fixturesRes.status === 'fulfilled' ? fixturesRes.value.data?.response : [];
            const oddsData = oddsRes.status === 'fulfilled' ? oddsRes.value.data?.response : [];

            const oddsMap = new Map();
            if (oddsData) {
                oddsData.forEach((item: any) => {
                    let bestValues = null;
                    // On cherche dans tous les bookmakers pour maximiser les chances
                    for (const bookie of (item.bookmakers || [])) {
                        const market = bookie.bets?.find((b: any) => b.id === 1);
                        if (market) {
                            bestValues = market.values;
                            break;
                        }
                    }
                    if (bestValues) oddsMap.set(item.fixture.id, bestValues);
                });
            }

            const fixtures = (fixturesData || []).map((fixture: any) => {
                if (!fixture.teams?.home || !fixture.teams?.away) return null;

                const odds = oddsMap.get(fixture.fixture.id);

                // Pour aujourd'hui (dates[0]), on montre TOUT, même sans cotes.
                // Pour les jours suivants, on ne montre que ceux avec cotes pour ne pas polluer.
                if (date !== dates[0] && !odds) return null;

                return {
                    external_id: fixture.fixture.id,
                    name: fixture.league.name,
                    team1_name: fixture.teams.home.name,
                    team2_name: fixture.teams.away.name,
                    team1_logo: fixture.teams.home.logo || '',
                    team2_logo: fixture.teams.away.logo || '',
                    odds_team1: Number(odds?.find((v: any) => v.value === 'Home')?.odd || 0),
                    odds_team2: Number(odds?.find((v: any) => v.value === 'Away')?.odd || 0),
                    odds_draw: Number(odds?.find((v: any) => v.value === 'Draw')?.odd || 0),
                    start_time: fixture.fixture.date,
                    status: 'active' as const,
                    sport_type: 'football',
                };
            }).filter(Boolean);

            allMatches.push(...fixtures);
            console.log(`[SPORTS_API] Added ${fixtures.length} matches for ${date}`);
        } catch (err) {
            console.error(`[SPORTS_API] Error processing ${date}:`, err);
        }
    }

    console.log(`[SPORTS_API] 🚀 EMERGENCY FETCH END: ${allMatches.length} total matches`);
    return allMatches;
}
