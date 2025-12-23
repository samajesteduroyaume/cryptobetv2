import axios from 'axios';
import { Match } from '@/src/types';

const API_KEY = process.env.API_SPORTS_KEY || '';
const FOOTBALL_URL = 'https://v3.football.api-sports.io';
const BASKETBALL_URL = 'https://v1.basketball.api-sports.io';
const BASEBALL_URL = 'https://v1.baseball.api-sports.io';
const F1_URL = 'https://v1.formula-1.api-sports.io';

export async function getUpcomingMatches(): Promise<Match[]> {
    const allMatches: Match[] = [];
    const dates: string[] = [];

    console.log(`[SPORTS_API] Initialisation de la recherche (Key: ${API_KEY ? 'Présente' : 'MANQUANTE'})`);

    // 1. MATCHS EN DIRECT
    try {
        const liveRes = await axios.get(`${FOOTBALL_URL}/fixtures`, {
            headers: { 'x-apisports-key': API_KEY },
            params: { live: 'all' },
            timeout: 7000,
        });

        if (liveRes.data?.response?.length > 0) {
            console.log(`[SPORTS_API] 📡 ${liveRes.data.response.length} matchs LIVE trouvés`);
            liveRes.data.response.forEach((fixture: any) => {
                if (fixture.teams?.home && fixture.teams?.away) {
                    allMatches.push({
                        external_id: fixture.fixture.id,
                        name: fixture.league.name || 'En Direct',
                        team1_name: fixture.teams.home.name,
                        team2_name: fixture.teams.away.name,
                        team1_logo: fixture.teams.home.logo || '',
                        team2_logo: fixture.teams.away.logo || '',
                        odds_team1: 1.50,
                        odds_team2: 2.50,
                        odds_draw: 3.00,
                        start_time: fixture.fixture.date,
                        status: 'active' as const,
                        sport_type: 'football',
                    });
                }
            });
        }
    } catch (err) {
        console.error("[SPORTS_API] Erreur Live:", err instanceof Error ? err.message : err);
    }

    // 2. MATCHS FUTURS (7 JOURS)
    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        dates.push(d.toISOString().split('T')[0]);
    }

    for (const date of dates) {
        try {
            console.log(`[SPORTS_API] 🔍 Date: ${date}...`);
            const results = await Promise.allSettled([
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

            const fixturesRes = results[0].status === 'fulfilled' ? results[0].value.data : null;
            const oddsRes = results[1].status === 'fulfilled' ? results[1].value.data : null;

            if (!fixturesRes) {
                console.warn(`[SPORTS_API] ⚠️ Fixtures indisponibles pour le ${date}`);
                continue;
            }

            const oddsMap = new Map();
            if (oddsRes?.response) {
                oddsRes.response.forEach((item: any) => {
                    let bestValues = null;
                    if (item.bookmakers) {
                        for (const bookie of item.bookmakers) {
                            const market = bookie.bets?.find((b: any) => b.id === 1);
                            if (market) {
                                bestValues = market.values;
                                break;
                            }
                        }
                    }
                    if (bestValues) {
                        oddsMap.set(item.fixture.id, bestValues);
                    }
                });
            }

            const fixtures = fixturesRes.response.map((fixture: any) => {
                if (!fixture.teams?.home || !fixture.teams?.away) return null;

                const odds = oddsMap.get(fixture.fixture.id);
                // On n'affiche que ceux qui ont des cotes (sauf aujourd'hui pour voir quelque chose)
                if (!odds && date !== dates[0]) return null;

                return {
                    external_id: fixture.fixture.id,
                    name: fixture.league?.name || 'Football',
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
            console.log(`[SPORTS_API] ✅ ${fixtures.length} matchs ajoutés pour le ${date}`);
        } catch (err) {
            console.error(`[SPORTS_API] Erreur critique le ${date}:`, err);
        }
    }

    if (allMatches.length === 0) {
        console.warn("[SPORTS_API] ❌ AUCUN MATCH TROUVÉ. Vérifiez votre clé API ou la date.");
    }

    return allMatches;
}
