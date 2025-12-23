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
    const today = new Date().toISOString().split('T')[0];

    console.log(`[SPORTS_API] 🚨 MULTI-SPORT FETCH START`);

    // 1. FOOTBALL (Live + today + tomorrow)
    try {
        console.log(`[SPORTS_API] Fetching Football...`);
        // Live
        const liveRes = await axios.get(`${FOOTBALL_URL}/fixtures`, {
            headers: { 'x-apisports-key': API_KEY },
            params: { live: 'all' },
            timeout: 5000,
        });
        if (liveRes.data?.response) {
            liveRes.data.response.forEach((f: any) => {
                allMatches.push({
                    external_id: f.fixture.id,
                    name: f.league.name,
                    team1_name: f.teams.home.name,
                    team2_name: f.teams.away.name,
                    team1_logo: f.teams.home.logo || '',
                    team2_logo: f.teams.away.logo || '',
                    odds_team1: 1.85, odds_team2: 2.15, odds_draw: 3.20,
                    start_time: f.fixture.date, status: 'active', sport_type: 'football',
                });
            });
        }

        // Today's fixtures with odds
        const [fRes, oRes] = await Promise.allSettled([
            axios.get(`${FOOTBALL_URL}/fixtures`, { headers: { 'x-apisports-key': API_KEY }, params: { date: today }, timeout: 5000 }),
            axios.get(`${FOOTBALL_URL}/odds`, { headers: { 'x-apisports-key': API_KEY }, params: { date: today }, timeout: 5000 })
        ]);

        const fData = fRes.status === 'fulfilled' ? fRes.value.data?.response : [];
        const oData = oRes.status === 'fulfilled' ? oRes.value.data?.response : [];
        const oMap = new Map();
        if (oData) {
            oData.forEach((item: any) => {
                const market = item.bookmakers?.[0]?.bets?.find((b: any) => b.id === 1);
                if (market) oMap.set(item.fixture.id, market.values);
            });
        }

        (fData || []).forEach((f: any) => {
            const odds = oMap.get(f.fixture.id);
            allMatches.push({
                external_id: f.fixture.id,
                name: f.league.name,
                team1_name: f.teams.home.name,
                team2_name: f.teams.away.name,
                team1_logo: f.teams.home.logo || '',
                team2_logo: f.teams.away.logo || '',
                odds_team1: Number(odds?.find((v: any) => v.value === 'Home')?.odd || 0),
                odds_team2: Number(odds?.find((v: any) => v.value === 'Away')?.odd || 0),
                odds_draw: Number(odds?.find((v: any) => v.value === 'Draw')?.odd || 0),
                start_time: f.fixture.date,
                status: 'active',
                sport_type: 'football',
            });
        });
    } catch (e) { console.error("Football error", e); }

    // 2. BASKETBALL (Today)
    try {
        const bRes = await axios.get(`${BASKETBALL_URL}/games`, {
            headers: { 'x-apisports-key': API_KEY },
            params: { date: today },
            timeout: 5000,
        });
        if (bRes.data?.response) {
            bRes.data.response.forEach((g: any) => {
                allMatches.push({
                    external_id: g.id,
                    name: g.league.name,
                    team1_name: g.teams.home.name,
                    team2_name: g.teams.away.name,
                    team1_logo: g.teams.home.logo || '',
                    team2_logo: g.teams.away.logo || '',
                    odds_team1: 1.90,
                    odds_team2: 1.90,
                    odds_draw: 0,
                    start_time: g.date,
                    status: 'active',
                    sport_type: 'basketball',
                });
            });
        }
    } catch (e) {
        console.error("[SPORTS_API] Basketball error:", e instanceof Error ? e.message : e);
    }

    // 3. BASEBALL (Today)
    try {
        const bbRes = await axios.get(`${BASEBALL_URL}/games`, {
            headers: { 'x-apisports-key': API_KEY },
            params: { date: today },
            timeout: 5000,
        });
        if (bbRes.data?.response) {
            bbRes.data.response.forEach((g: any) => {
                allMatches.push({
                    external_id: g.id,
                    name: g.league.name,
                    team1_name: g.teams.home.name,
                    team2_name: g.teams.away.name,
                    team1_logo: g.teams.home.logo || '',
                    team2_logo: g.teams.away.logo || '',
                    odds_team1: 1.80,
                    odds_team2: 2.05,
                    odds_draw: 0,
                    start_time: g.date,
                    status: 'active',
                    sport_type: 'baseball',
                });
            });
        }
    } catch (e) {
        console.error("[SPORTS_API] Baseball error:", e instanceof Error ? e.message : e);
    }

    console.log(`[SPORTS_API] 🚀 MULTI-SPORT END: ${allMatches.length} total real events`);
    return allMatches;
}
