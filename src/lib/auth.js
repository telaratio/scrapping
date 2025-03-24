// Import des dépendances Svelte
import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { goto } from '$app/navigation';

// Création du store pour l'utilisateur
export const user = writable(browser ? JSON.parse(localStorage.getItem('user')) : null);
export const isAuthenticated = writable(false);

// Mise à jour du store quand l'utilisateur change
user.subscribe((value) => {
    if (browser) {
        if (value) {
            localStorage.setItem('user', JSON.stringify(value));
            isAuthenticated.set(true);
        } else {
            localStorage.removeItem('user');
            isAuthenticated.set(false);
        }
    }
});

/**
 * Vérifie si l'utilisateur est connecté
 * @returns {boolean} True si l'utilisateur est connecté
 */
export function checkAuth() {
    const userData = browser ? localStorage.getItem('user') : null;
    
    if (!userData) {
        user.set(null);
        return false;
    }
    
    try {
        const parsedUser = JSON.parse(userData);
        user.set(parsedUser);
        return true;
    } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
        user.set(null);
        return false;
    }
}

/**
 * Déconnecte l'utilisateur
 */
export async function logout() {
    try {
        // Appel de l'API de déconnexion
        await fetch('/api/auth/logout', {
            method: 'POST'
        });
    } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
    }

    // Nettoyage des données locales
    localStorage.removeItem('user');
    user.set(null);
    
    // Redirection vers la page de connexion
    goto('/login');
}

/**
 * Récupère le token JWT depuis les cookies
 * @returns {string|null} Le token JWT ou null si non connecté
 */
export async function getToken() {
    if (!browser) return null;
    
    try {
        // Faire une requête à un endpoint qui retourne le token
        const response = await fetch('/api/auth/token');
        if (!response.ok) return null;
        
        const data = await response.json();
        return data.token;
    } catch (error) {
        console.error('Erreur lors de la récupération du token:', error);
        return null;
    }
} 