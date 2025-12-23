import { Match, Bet } from '@/src/types';

// Stockage en mémoire simple pour développement local
let matchesStore: Match[] = [];
let betsStore: Bet[] = [];

export async function addMatch(match: Match): Promise<number> {
  const exists = matchesStore.find(m => m.external_id === match.external_id);
  if (exists) return Number(match.external_id);

  matchesStore.push(match);
  return Number(match.external_id);
}

export async function getAllMatches(): Promise<Match[]> {
  return matchesStore;
}

export async function getMatch(id: number): Promise<Match | undefined> {
  return matchesStore.find((m) => Number(m.external_id) === id);
}

export async function addBet(bet: Bet): Promise<Bet> {
  const betWithTimestamp = {
    ...bet,
    created_at: new Date().toISOString(),
  };
  betsStore.push(betWithTimestamp);
  return betWithTimestamp;
}

export async function getBet(id: string): Promise<Bet | undefined> {
  return betsStore.find((b) => b.id === id);
}

export async function updateBet(id: string, updates: Partial<Bet>): Promise<Bet | null> {
  const index = betsStore.findIndex((b) => b.id === id);
  if (index === -1) return null;

  betsStore[index] = { ...betsStore[index], ...updates };
  return betsStore[index];
}

export async function getUserBets(userAddress: string): Promise<Bet[]> {
  return betsStore.filter((b) => b.user_address === userAddress);
}

export async function initDatabase(): Promise<boolean> {
  return true;
}
