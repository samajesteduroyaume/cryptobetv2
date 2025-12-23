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

    // Récupérer les 3 prochains jours (pour économiser le quota API de 100 req/jour)
    for (let i = 0; i < 3; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        dates.push(d.toISOString().split('T')[0]);
    }

    // 1. FOOTBALL
    for (const date of dates) {
        try {
            const [fixturesRes, oddsRes] = await Promise.all([
                axios.get(`${FOOTBALL_URL}/fixtures`, {
                    headers: { 'x-apisports-key': API_KEY },
                    params: { date },
                    timeout: 5000,
                }),
                axios.get(`${FOOTBALL_URL}/odds`, {
                    headers: { 'x-apisports-key': API_KEY },
                    params: { date },
                    timeout: 5000,
                })
            ]);

            if (fixturesRes.data?.response && oddsRes.data?.response) {
                const oddsMap = new Map();
                oddsRes.data.response.forEach((item: any) => {
                    const bookmaker = item.bookmakers.find((b: any) => b.id === 6) || item.bookmakers[0];
                    if (bookmaker) {
                        const market = bookmaker.bets.find((bet: any) => bet.id === 1);
                        if (market) oddsMap.set(item.fixture.id, market.values);
                    }
                });

                const fixtures = fixturesRes.data.response
                    .filter((f: any) => oddsMap.has(f.fixture.id))
                    .map((fixture: any) => {
                        const odds = oddsMap.get(fixture.fixture.id);
                        return {
                            external_id: fixture.fixture.id,
                            name: fixture.league.name,
                            team1_name: fixture.teams.home.name,
                            team2_name: fixture.teams.away.name,
                            team1_logo: fixture.teams.home.logo,
                            team2_logo: fixture.teams.away.logo,
                            odds_team1: Number(odds.find((v: any) => v.value === 'Home')?.odd || 0),
                            odds_team2: Number(odds.find((v: any) => v.value === 'Away')?.odd || 0),
                            odds_draw: Number(odds.find((v: any) => v.value === 'Draw')?.odd || 0),
                            start_time: fixture.fixture.date,
                            status: 'active' as const,
                            sport_type: 'football',
                        };
                    });
                allMatches.push(...fixtures);
            }
        } catch (err) {
            console.error(`Erreur Football ${date}:`, err instanceof Error ? err.message : 'Unknown');
        }
    }

    // 2. BASKETBALL
    for (const date of dates) {
        try {
            const [gamesRes, oddsRes] = await Promise.all([
                axios.get(`${BASKETBALL_URL}/games`, {
                    headers: { 'x-apisports-key': API_KEY },
                    params: { date },
                    timeout: 5000,
                }),
                axios.get(`${BASKETBALL_URL}/odds`, {
                    headers: { 'x-apisports-key': API_KEY },
                    params: { date },
                    timeout: 5000,
                })
            ]);

            if (gamesRes.data?.response && oddsRes.data?.response) {
                const oddsMap = new Map();
                oddsRes.data.response.forEach((item: any) => {
                    const bookmaker = item.bookmakers[0];
                    if (bookmaker) {
                        const market = bookmaker.bets.find((bet: any) => bet.id === 1); // Home/Away
                        if (market) oddsMap.set(item.game.id, market.values);
                    }
                });

                const games = gamesRes.data.response
                    .filter((g: any) => oddsMap.has(g.id))
                    .map((game: any) => {
                        const odds = oddsMap.get(game.id);
                        return {
                            external_id: game.id,
                            name: game.league.name,
                            team1_name: game.teams.home.name,
                            team2_name: game.teams.away.name,
                            team1_logo: game.teams.home.logo,
                            team2_logo: game.teams.away.logo,
                            odds_team1: Number(odds.find((v: any) => v.value === 'Home')?.odd || 0),
                            odds_team2: Number(odds.find((v: any) => v.value === 'Away')?.odd || 0),
                            odds_draw: 0,
                            start_time: game.date,
                            status: 'active' as const,
                            sport_type: 'basketball',
                        };
                    });
                allMatches.push(...games);
            }
        } catch (err) {
            console.error(`Erreur Basketball ${date}:`, err instanceof Error ? err.message : 'Unknown');
        }
    }

    // 3. BASEBALL
    for (const date of dates) {
        try {
            const [gamesRes, oddsRes] = await Promise.all([
                axios.get(`${BASEBALL_URL}/games`, {
                    headers: { 'x-apisports-key': API_KEY },
                    params: { date },
                    timeout: 5000,
                }),
                axios.get(`${BASEBALL_URL}/odds`, {
                    headers: { 'x-apisports-key': API_KEY },
                    params: { date },
                    timeout: 5000,
                })
            ]);

            if (gamesRes.data?.response && oddsRes.data?.response) {
                const oddsMap = new Map();
                oddsRes.data.response.forEach((item: any) => {
                    const bookmaker = item.bookmakers[0];
                    if (bookmaker) {
                        const market = bookmaker.bets.find((bet: any) => bet.id === 1);
                        if (market) oddsMap.set(item.game.id, market.values);
                    }
                });

                const games = gamesRes.data.response
                    .filter((g: any) => oddsMap.has(g.id))
                    .map((game: any) => {
                        const odds = oddsMap.get(game.id);
                        return {
                            external_id: game.id,
                            name: game.league.name,
                            team1_name: game.teams.home.name,
                            team2_name: game.teams.away.name,
                            team1_logo: game.teams.home.logo,
                            team2_logo: game.teams.away.logo,
                            odds_team1: Number(odds.find((v: any) => v.value === 'Home')?.odd || 0),
                            odds_team2: Number(odds.find((v: any) => v.value === 'Away')?.odd || 0),
                            odds_draw: 0,
                            start_time: game.date,
                            status: 'active' as const,
                            sport_type: 'baseball',
                        };
                    });
                allMatches.push(...games);
            }
        } catch (err) {
            console.error(`Erreur Baseball ${date}:`, err instanceof Error ? err.message : 'Unknown');
        }
    }

    console.log(`✅ ${allMatches.length} matchs réels chargés (Foot, Basket, Base avec cotes)`);

    return allMatches;
}
