import axios from 'axios';
import { Match } from '@/src/types';

const API_KEY = process.env.API_SPORTS_KEY || '';
const FOOTBALL_URL = 'https://v3.football.api-sports.io';
const BASKETBALL_URL = 'https://v1.basketball.api-sports.io';
const BASEBALL_URL = 'https://v1.baseball.api-sports.io';
const F1_URL = 'https://v1.formula-1.api-sports.io';

export async function getUpcomingMatches(): Promise<Match[]> {
    const allMatches: Match[] = [];
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const dates = [today, tomorrow];

    // 1. FOOTBALL (Toutes les ligues)
    for (const date of dates) {
        try {
            const response = await axios.get(`${FOOTBALL_URL}/fixtures`, {
                headers: { 'x-apisports-key': API_KEY },
                params: { date },
                timeout: 5000,
            });

            if (response.data?.response) {
                const fixtures = response.data.response.map((fixture: any) => ({
                    external_id: fixture.fixture.id,
                    name: fixture.league.name,
                    team1_name: fixture.teams.home.name,
                    team2_name: fixture.teams.away.name,
                    team1_logo: fixture.teams.home.logo,
                    team2_logo: fixture.teams.away.logo,
                    odds_team1: generateOdds(),
                    odds_team2: generateOdds(),
                    odds_draw: generateDrawOdds(),
                    start_time: fixture.fixture.date,
                    status: 'active' as const,
                    sport_type: 'football',
                }));
                allMatches.push(...fixtures);
            }
        } catch (err) {
            console.log(`Erreur Football ${date}:`, err instanceof Error ? err.message : 'Unknown');
        }
    }

    // 2. BASKETBALL (NBA & autres)
    for (const date of dates) {
        try {
            const response = await axios.get(`${BASKETBALL_URL}/games`, {
                headers: { 'x-apisports-key': API_KEY },
                params: { date },
                timeout: 5000,
            });

            if (response.data?.response) {
                const games = response.data.response.map((game: any) => ({
                    external_id: game.id,
                    name: game.league.name || 'Basketball',
                    team1_name: game.teams.home.name,
                    team2_name: game.teams.away.name,
                    team1_logo: game.teams.home.logo,
                    team2_logo: game.teams.away.logo,
                    odds_team1: generateOdds(),
                    odds_team2: generateOdds(),
                    odds_draw: 15.00,
                    start_time: game.date,
                    status: 'active' as const,
                    sport_type: 'basketball',
                }));
                allMatches.push(...games);
            }
        } catch (err) {
            console.log(`Erreur Basketball ${date}:`, err instanceof Error ? err.message : 'Unknown');
        }
    }

    // 3. BASEBALL (MLB & autres)
    for (const date of dates) {
        try {
            const response = await axios.get(`${BASEBALL_URL}/games`, {
                headers: { 'x-apisports-key': API_KEY },
                params: { date },
                timeout: 5000,
            });

            if (response.data?.response) {
                const games = response.data.response.map((game: any) => ({
                    external_id: game.id,
                    name: game.league.name || 'Baseball',
                    team1_name: game.teams.home.name,
                    team2_name: game.teams.away.name,
                    team1_logo: game.teams.home.logo,
                    team2_logo: game.teams.away.logo,
                    odds_team1: generateOdds(),
                    odds_team2: generateOdds(),
                    odds_draw: 10.00,
                    start_time: game.date,
                    status: 'active' as const,
                    sport_type: 'baseball',
                }));
                allMatches.push(...games);
            }
        } catch (err) {
            console.log(`Erreur Baseball ${date}:`, err instanceof Error ? err.message : 'Unknown');
        }
    }

    // 4. FORMULA 1 (Prochaine course)
    try {
        const response = await axios.get(`${F1_URL}/races`, {
            headers: { 'x-apisports-key': API_KEY },
            params: {
                season: new Date().getFullYear(),
                next: 1
            },
            timeout: 5000,
        });

        if (response.data?.response) {
            const races = response.data.response.map((race: any) => ({
                external_id: race.id,
                name: 'Formula 1',
                team1_name: race.competition.name || 'Grand Prix',
                team2_name: race.circuit.name || 'Circuit',
                team1_logo: 'https://media.api-sports.io/formula-1/competitions/logo.png',
                team2_logo: 'https://media.api-sports.io/formula-1/circuits/logo.png',
                odds_team1: 1.50, // Verstappen
                odds_team2: 3.00, // Others
                odds_draw: 100.00,
                start_time: race.date,
                status: 'active' as const,
                sport_type: 'racing',
            }));
            allMatches.push(...races);
        }
    } catch (err) {
        console.log(`Erreur F1:`, err instanceof Error ? err.message : 'Unknown');
    }

    console.log(`✅ ${allMatches.length} matchs chargés (Foot, Basket, Baseball, F1)`);

    if (allMatches.length === 0) {
        return getFallbackMatches();
    }

    return allMatches;
}

function generateOdds() {
    return Math.round((1.5 + Math.random() * 2.5) * 100) / 100;
}

function generateDrawOdds() {
    return Math.round((2.8 + Math.random() * 1.2) * 100) / 100;
}

function getFallbackMatches(): Match[] {
    const now = new Date();
    const today = new Date(now).toISOString();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
    const inTwoDays = new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString();

    return [
        {
            external_id: 101,
            name: 'Ligue 1',
            team1_name: 'Paris SG',
            team2_name: 'Marseille',
            team1_logo: 'https://media.api-sports.io/football/teams/85.png',
            team2_logo: 'https://media.api-sports.io/football/teams/81.png',
            odds_team1: 1.65,
            odds_team2: 4.50,
            odds_draw: 3.80,
            start_time: tomorrow,
            status: 'active' as const,
            sport_type: 'football',
        },
        {
            external_id: 102,
            name: 'Premier League',
            team1_name: 'Man City',
            team2_name: 'Liverpool',
            team1_logo: 'https://media.api-sports.io/football/teams/50.png',
            team2_logo: 'https://media.api-sports.io/football/teams/40.png',
            odds_team1: 1.85,
            odds_team2: 3.20,
            odds_draw: 3.50,
            start_time: today,
            status: 'active' as const,
            sport_type: 'football',
        },
        {
            external_id: 103,
            name: 'La Liga',
            team1_name: 'Real Madrid',
            team2_name: 'Barcelona',
            team1_logo: 'https://media.api-sports.io/football/teams/541.png',
            team2_logo: 'https://media.api-sports.io/football/teams/529.png',
            odds_team1: 2.10,
            odds_team2: 2.90,
            odds_draw: 3.40,
            start_time: inTwoDays,
            status: 'active' as const,
            sport_type: 'football',
        },
        {
            external_id: 104,
            name: 'Bundesliga',
            team1_name: 'Bayern Munich',
            team2_name: 'Dortmund',
            team1_logo: 'https://media.api-sports.io/football/teams/157.png',
            team2_logo: 'https://media.api-sports.io/football/teams/165.png',
            odds_team1: 1.55,
            odds_team2: 4.80,
            odds_draw: 4.20,
            start_time: tomorrow,
            status: 'active' as const,
            sport_type: 'football',
        },
        {
            external_id: 105,
            name: 'Serie A',
            team1_name: 'Juventus',
            team2_name: 'Inter Milan',
            team1_logo: 'https://media.api-sports.io/football/teams/496.png',
            team2_logo: 'https://media.api-sports.io/football/teams/505.png',
            odds_team1: 2.45,
            odds_team2: 2.65,
            odds_draw: 3.10,
            start_time: today,
            status: 'active' as const,
            sport_type: 'football',
        },
        {
            external_id: 201,
            name: 'NBA',
            team1_name: 'Lakers',
            team2_name: 'Celtics',
            team1_logo: 'https://media.api-sports.io/basketball/teams/145.png',
            team2_logo: 'https://media.api-sports.io/basketball/teams/133.png',
            odds_team1: 1.90,
            odds_team2: 1.90,
            odds_draw: 15.00,
            start_time: today,
            status: 'active' as const,
            sport_type: 'basketball',
        },
        {
            external_id: 202,
            name: 'NBA',
            team1_name: 'Warriors',
            team2_name: 'Suns',
            team1_logo: 'https://media.api-sports.io/basketball/teams/141.png',
            team2_logo: 'https://media.api-sports.io/basketball/teams/154.png',
            odds_team1: 1.75,
            odds_team2: 2.10,
            odds_draw: 15.00,
            start_time: tomorrow,
            status: 'active' as const,
            sport_type: 'basketball',
        },
        {
            external_id: 301,
            name: 'MLB',
            team1_name: 'Yankees',
            team2_name: 'Red Sox',
            team1_logo: 'https://media.api-sports.io/baseball/teams/12.png',
            team2_logo: 'https://media.api-sports.io/baseball/teams/3.png',
            odds_team1: 1.80,
            odds_team2: 2.05,
            odds_draw: 10.00,
            start_time: inTwoDays,
            status: 'active' as const,
            sport_type: 'baseball',
        },
        {
            external_id: 401,
            name: 'Formula 1',
            team1_name: 'Monaco GP',
            team2_name: 'Monte Carlo',
            team1_logo: 'https://media.api-sports.io/formula-1/competitions/logo.png',
            team2_logo: 'https://media.api-sports.io/formula-1/circuits/logo.png',
            odds_team1: 1.45,
            odds_team2: 3.10,
            odds_draw: 100.00,
            start_time: inTwoDays,
            status: 'active' as const,
            sport_type: 'racing',
        },
        {
            external_id: 501,
            name: 'ATP Wimbledon',
            team1_name: 'Carlos Alcaraz',
            team2_name: 'Jannik Sinner',
            team1_logo: 'https://media.api-sports.io/tennis/players/1.png',
            team2_logo: 'https://media.api-sports.io/tennis/players/2.png',
            odds_team1: 1.95,
            odds_team2: 1.85,
            odds_draw: 0,
            start_time: tomorrow,
            status: 'active' as const,
            sport_type: 'tennis',
        }
    ];
}
