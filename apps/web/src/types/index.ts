// Types pour les matchs sportifs
export interface Match {
    external_id: number | string;
    name: string;
    team1_name: string;
    team2_name: string;
    team1_logo: string;
    team2_logo: string;
    odds_team1: number;
    odds_team2: number;
    odds_draw: number;
    start_time: string;
    status: 'active' | 'finished' | 'cancelled';
    sport_type: 'football' | 'basketball' | 'baseball' | 'racing' | 'tennis';
}

// Types pour les paris
export interface Bet {
    id: string;
    match_id: number;
    user_address: string;
    prediction: 1 | 2 | 3; // 1 = team1, 2 = team2, 3 = draw
    amount: number;
    currency: string;
    odds: number;
    potential_win: number;
    status: 'pending' | 'confirmed' | 'won' | 'lost';
    payment_address: string;
    payment_status: 'waiting' | 'confirmed' | 'failed';
    created_at?: string;
    confirmed_at?: string;
}

// Réponses API standardisées
export interface ApiResponse<T> {
    data?: T;
    error?: string;
    message?: string;
}

export interface MatchesResponse {
    matches: Match[];
}

export interface BetResponse extends Bet {
    betId: string; // Alias for id
    qrCode: string;
}

// Extended bet type for UI usage
export interface BetWithQR extends Bet {
    qrCode?: string;
    betId?: string; // Alias for id
    paymentAddress?: string; // Alias for payment_address
}

// Types pour les statistiques utilisateur
export interface UserStats {
    totalStaked: number;
    totalWon: number;
    netProfit: number;
    wins: number;
    losses: number;
    pending: number;
    winRate: string;
}

// Types pour les événements blockchain
export interface BlockchainEvent {
    id: bigint;
    name: string;
    team1name: string;
    team2name: string;
    isActive: boolean;
    result: number;
}

export interface BlockchainBet {
    eventId: bigint;
    amount: bigint;
    predictedResult: number;
    odds: number;
    paid: boolean;
}
