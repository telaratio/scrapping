import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_jwt_super_secret';
const JWT_EXPIRES_IN = '24h';

/**
 * Crée un token JWT pour un utilisateur
 * @param {Object} user - L'utilisateur pour lequel créer le token
 * @returns {string} Le token JWT généré
 */
export function createJWT(user) {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            name: user.nom
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
}

/**
 * Vérifie la validité d'un token JWT
 * @param {string} token - Le token à vérifier
 * @returns {Object|null} Les données décodées du token ou null si invalide
 */
export function verifyJWT(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
}

/**
 * Extrait le token JWT de l'en-tête d'autorisation d'une requête
 * @param {Request} request - La requête HTTP
 * @returns {string|null} Le token JWT ou null si non trouvé
 */
export function getJWTFromRequest(request) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.substring(7);
} 