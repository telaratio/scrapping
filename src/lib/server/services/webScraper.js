import puppeteer from 'puppeteer';
import { parse as parseUrl } from 'url';
import { promises as fs } from 'fs';
import path from 'path';
import { htmlStructureExtractor } from './utils/htmlStructureExtractor.js';

/**
 * Configuration par défaut pour le scraper
 */
const DEFAULT_CONFIG = {
    timeout: 30000, // 30 secondes
    waitUntil: 'networkidle0',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    respectRobotsTxt: true,
    screenshotPath: 'screenshots', // Dossier pour sauvegarder les captures d'écran en cas d'erreur
    minRequestInterval: 2000, // Intervalle minimum entre les requêtes (2 secondes)
};

/**
 * Vérifie si l'URL est autorisée selon le robots.txt
 * @param {string} url - L'URL à vérifier
 * @returns {Promise<boolean>}
 */
async function isUrlAllowed(url) {
    try {
        const parsedUrl = parseUrl(url);
        const robotsTxtUrl = `${parsedUrl.protocol}//${parsedUrl.host}/robots.txt`;
        
        const response = await fetch(robotsTxtUrl);
        if (!response.ok) {
            return true; // Si pas de robots.txt, on suppose que c'est autorisé
        }

        const robotsTxt = await response.text();
        
        // Analyse simple du robots.txt
        const userAgentSection = robotsTxt
            .split('\n')
            .map(line => line.toLowerCase().trim())
            .reduce((acc, line) => {
                if (line.startsWith('user-agent:')) {
                    acc.currentSection = line.split(':')[1].trim();
                    acc.sections[acc.currentSection] = [];
                } else if (acc.currentSection && line.startsWith('disallow:')) {
                    acc.sections[acc.currentSection].push(
                        line.split(':')[1].trim()
                    );
                }
                return acc;
            }, { currentSection: null, sections: {} });

        // Vérifie les règles pour notre user-agent ou *
        const relevantRules = userAgentSection.sections['*'] || [];
        const urlPath = parsedUrl.pathname || '/';

        return !relevantRules.some(rule => 
            urlPath.startsWith(rule) && rule.length > 0
        );
    } catch (error) {
        console.warn(`Impossible de vérifier robots.txt pour ${url}:`, error.message);
        return true; // En cas d'erreur, on suppose que c'est autorisé
    }
}

/**
 * Service de scraping de pages web
 */
export class WebScraper {
    constructor(config = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.lastRequestTime = 0;
    }

    /**
     * Attend le délai minimum entre les requêtes
     */
    async respectRateLimit() {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        if (timeSinceLastRequest < this.config.minRequestInterval) {
            await new Promise(resolve => 
                setTimeout(resolve, this.config.minRequestInterval - timeSinceLastRequest)
            );
        }
        this.lastRequestTime = Date.now();
    }

    /**
     * Extrait le contenu d'une page web
     * @param {string} url - L'URL à scraper
     * @returns {Promise<Object>} Le contenu structuré
     */
    async scrapeUrl(url) {
        let browser = null;
        try {
            // Vérification du robots.txt
            if (this.config.respectRobotsTxt) {
                const allowed = await isUrlAllowed(url);
                if (!allowed) {
                    throw new Error('URL non autorisée par robots.txt');
                }
            }

            // Respect du rate limiting
            await this.respectRateLimit();

            // Lancement du navigateur
            browser = await puppeteer.launch({
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });

            const page = await browser.newPage();
            await page.setUserAgent(this.config.userAgent);

            // Configuration des timeouts
            await page.setDefaultNavigationTimeout(this.config.timeout);
            await page.setDefaultTimeout(this.config.timeout);

            // Navigation vers l'URL
            await page.goto(url, {
                waitUntil: this.config.waitUntil,
                timeout: this.config.timeout
            });

            // Attente supplémentaire pour le contenu dynamique
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Extraction du contenu
            const pageContent = await page.content();
            const title = await page.title();
            
            // Transformation du HTML en format structuré
            const structuredContent = await htmlStructureExtractor.extract(pageContent);

            return {
                url,
                timestamp: new Date().toISOString(),
                title,
                content: structuredContent,
                status: 'success'
            };

        } catch (error) {
            console.error('Erreur lors du scraping:', error);
            throw new Error(`Échec du scraping: ${error.message}`);
        } finally {
            if (browser) {
                await browser.close();
            }
        }
    }
}

// Export d'une instance unique
export const webScraper = new WebScraper(); 