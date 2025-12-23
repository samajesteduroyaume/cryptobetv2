// Validation utilities for user inputs

/**
 * Validates an Ethereum address
 */
export function isValidEthereumAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validates a bet amount
 */
export function isValidBetAmount(amount: number): { valid: boolean; error?: string } {
    const MIN_BET = 0.001; // 0.001 ETH minimum
    const MAX_BET = 10; // 10 ETH maximum

    if (isNaN(amount) || amount <= 0) {
        return { valid: false, error: 'Le montant doit être supérieur à 0' };
    }

    if (amount < MIN_BET) {
        return { valid: false, error: `Le montant minimum est de ${MIN_BET} ETH` };
    }

    if (amount > MAX_BET) {
        return { valid: false, error: `Le montant maximum est de ${MAX_BET} ETH` };
    }

    return { valid: true };
}

/**
 * Validates a prediction value (1, 2, or 3)
 */
export function isValidPrediction(prediction: number): boolean {
    return [1, 2, 3].includes(prediction);
}

/**
 * Sanitizes user input to prevent injection attacks
 */
export function sanitizeInput(input: string): string {
    return input.trim().replace(/[<>]/g, '');
}

/**
 * Validates match ID
 */
export function isValidMatchId(id: string | number): boolean {
    const numId = typeof id === 'string' ? parseInt(id, 10) : id;
    return !isNaN(numId) && numId > 0;
}
