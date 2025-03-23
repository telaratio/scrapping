// Import des dépendances nécessaires
import nodemailer from 'nodemailer';
import crypto from 'crypto';

/**
 * Configuration du transporteur d'emails avec Mailtrap
 */
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

/**
 * Vérifie la connexion au serveur SMTP
 */
async function verifyEmailConfig() {
    try {
        await transporter.verify();
        console.log('Configuration email vérifiée avec succès');
        return true;
    } catch (error) {
        console.error('Erreur de configuration email:', error);
        return false;
    }
}

// Vérification immédiate de la configuration
verifyEmailConfig();

/**
 * Génère un token aléatoire pour la vérification d'email ou la réinitialisation de mot de passe
 * @param {number} bytes - Nombre d'octets pour le token
 * @returns {string} Token généré en hexadécimal
 */
export function generateToken(bytes = 32) {
    return crypto.randomBytes(bytes).toString('hex');
}

/**
 * Envoie un email de vérification
 * @param {string} to - Adresse email du destinataire
 * @param {string} token - Token de vérification
 * @returns {Promise<void>}
 */
export async function sendVerificationEmail(to, token) {
    console.log('Tentative d\'envoi d\'email à:', to);
    const verificationUrl = `${process.env.APP_URL}/verify-email?token=${token}`;
    
    try {
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to,
            subject: 'Vérifiez votre adresse email',
            html: `
                <h1>Bienvenue sur SEO Generator !</h1>
                <p>Pour activer votre compte, veuillez cliquer sur le lien ci-dessous :</p>
                <p><a href="${verificationUrl}">${verificationUrl}</a></p>
                <p>Ce lien expire dans 24 heures.</p>
                <p>Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.</p>
            `
        });
        console.log('Email envoyé avec succès:', info.messageId);
        return info;
    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email:', error);
        throw error;
    }
}

/**
 * Envoie un email de réinitialisation de mot de passe
 * @param {string} to - Adresse email du destinataire
 * @param {string} token - Token de réinitialisation
 * @returns {Promise<void>}
 */
export async function sendPasswordResetEmail(to, token) {
    console.log('Tentative d\'envoi d\'email de réinitialisation à:', to);
    const resetUrl = `${process.env.APP_URL}/reset-password?token=${token}`;
    
    try {
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to,
            subject: 'Réinitialisation de votre mot de passe',
            html: `
                <h1>Réinitialisation de mot de passe</h1>
                <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le lien ci-dessous :</p>
                <p><a href="${resetUrl}">${resetUrl}</a></p>
                <p>Ce lien expire dans 1 heure.</p>
                <p>Si vous n'avez pas demandé de réinitialisation, vous pouvez ignorer cet email.</p>
            `
        });
        console.log('Email de réinitialisation envoyé avec succès:', info.messageId);
        return info;
    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email de réinitialisation:', error);
        throw error;
    }
} 