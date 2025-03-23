import crypto from 'crypto';

/**
 * Génère une clé API sécurisée
 * Format: prefix_timestamp_random
 * @returns {string} La clé API générée
 */
export function generateApiKey() {
    const prefix = 'sk';
    const timestamp = Date.now().toString(36);
    const randomBytes = crypto.randomBytes(16).toString('hex');
    return `${prefix}_${timestamp}_${randomBytes}`;
}

/**
 * Valide le format d'une clé API
 * @param {string} key - La clé API à valider
 * @returns {boolean} True si la clé est valide
 */
export function isValidApiKey(key) {
    const pattern = /^sk_[a-z0-9]+_[a-f0-9]{32}$/;
    return pattern.test(key);
} 