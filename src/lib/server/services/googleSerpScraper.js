import puppeteer from 'puppeteer';
import { randomUserAgent } from './utils/userAgents.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { htmlStructureExtractor } from './utils/htmlStructureExtractor.js';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Service de scraping des résultats de recherche Google (SERP)
 */
export class GoogleSerpScraper {
    constructor() {
        this.baseUrl = 'https://www.google.com';
        this.timeout = 60000; // 60 secondes
    }

    /**
     * Effectue une recherche Google et extrait les résultats
     * @param {string} keyword - Le mot-clé à rechercher
     * @returns {Promise<Object>} Les résultats structurés
     */
    async scrape(keyword) {
        let browser = null;
        try {
            browser = await this.launchBrowser();
            const page = await browser.newPage();
            
            // Configuration anti-bot
            await this.setupAntiBot(page);
            
            // Navigation vers Google
            await this.navigateToGoogle(page, keyword);
            
            // Vérification et gestion du CAPTCHA
            if (await this.checkForCaptcha(page)) {
                const captchaSolved = await this.handleCaptcha(page);
                if (!captchaSolved) {
                    throw new Error('CAPTCHA non résolu');
                }
            }

            // Attente du chargement des résultats
            await this.waitForResults(page);
            
            // Simulation de comportement humain
            await this.simulateHumanBehavior(page);
            
            // Extraction des données
            const results = await this.extractResults(page, keyword);
            
            return results;

        } catch (error) {
            console.error('Erreur lors du scraping:', error);
            throw new Error(`Échec du scraping: ${error.message}`);
        } finally {
            if (browser) {
                await browser.close();
            }
        }
    }

    /**
     * Lance le navigateur avec des options optimisées
     */
    async launchBrowser() {
        return await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu',
                '--disable-web-security',
                '--disable-features=IsolateOrigins,site-per-process',
                '--disable-site-isolation-trials',
                '--disable-blink-features=AutomationControlled',
                '--disable-notifications',
                '--disable-popup-blocking',
                '--disable-save-password-bubble',
                '--disable-translate',
                '--disable-default-apps',
                '--disable-extensions',
                '--disable-sync',
                '--disable-background-networking',
                '--disable-background-timer-throttling',
                '--disable-backgrounding-occluded-windows',
                '--disable-breakpad',
                '--disable-component-extensions-with-background-pages',
                '--disable-features=TranslateUI,BlinkGenPropertyTrees',
                '--disable-ipc-flooding-protection',
                '--enable-features=NetworkService,NetworkServiceInProcess'
            ]
        });
    }

    /**
     * Configure les mesures anti-bot sur la page
     */
    async setupAntiBot(page) {
        // User-Agent aléatoire
        await page.setUserAgent(randomUserAgent());
        
        // Configuration de la vue avec des dimensions aléatoires
        const viewportWidth = Math.floor(Math.random() * (1920 - 1366) + 1366);
        const viewportHeight = Math.floor(Math.random() * (1080 - 768) + 768);
        await page.setViewport({
            width: viewportWidth,
            height: viewportHeight
        });

        // Headers supplémentaires plus réalistes
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Cache-Control': 'max-age=0',
            'DNT': '1',
            'Sec-Ch-Ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"Windows"',
            'sec-ch-ua-full-version-list': '"Chromium";v="122.0.6261.95", "Not(A:Brand";v="24", "Google Chrome";v="122.0.6261.95"',
            'sec-ch-ua-arch': '"x86"',
            'sec-ch-ua-bitness': '"64"',
            'sec-ch-ua-model': '""',
            'sec-ch-ua-platform-version': '"10.0.0"'
        });

        // Désactivation des propriétés qui peuvent révéler l'automatisation
        await page.evaluateOnNewDocument(() => {
            // Override navigator properties
            Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
            Object.defineProperty(navigator, 'plugins', { 
                get: () => [
                    { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer' },
                    { name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai' },
                    { name: 'Native Client', filename: 'internal-nacl-plugin' }
                ]
            });
            Object.defineProperty(navigator, 'languages', { get: () => ['fr-FR', 'fr', 'en-US', 'en'] });
            Object.defineProperty(navigator, 'platform', { get: () => 'Win32' });
            Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 });
            Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });
            Object.defineProperty(navigator, 'maxTouchPoints', { get: () => 0 });
            Object.defineProperty(navigator, 'vendor', { get: () => 'Google Inc.' });
            Object.defineProperty(navigator, 'connection', { 
                get: () => ({
                    effectiveType: '4g',
                    rtt: 50,
                    downlink: 10,
                    saveData: false
                })
            });
            Object.defineProperty(navigator, 'getBattery', { get: () => undefined });
            Object.defineProperty(navigator, 'getGamepads', { get: () => undefined });
            Object.defineProperty(navigator, 'getVRDisplays', { get: () => undefined });
            Object.defineProperty(navigator, 'mediaDevices', { get: () => undefined });
            Object.defineProperty(navigator, 'permissions', { get: () => undefined });
            Object.defineProperty(navigator, 'serviceWorker', { get: () => undefined });
            Object.defineProperty(navigator, 'storage', { get: () => undefined });
            Object.defineProperty(navigator, 'usb', { get: () => undefined });
            Object.defineProperty(navigator, 'xr', { get: () => undefined });
        });

        // Ajout de cookies de base
        await page.setCookie(
            { name: 'CONSENT', value: 'YES+cb.20240220-08-p0.fr+FX+410', domain: '.google.com' },
            { name: 'AEC', value: 'AUEFqZf' + Math.random().toString(36).substring(2), domain: '.google.com' },
            { name: 'NID', value: '511=' + Math.random().toString(36).substring(2), domain: '.google.com' }
        );

        // Délai initial plus court
        await this.randomDelay(500, 1000);
    }

    /**
     * Navigue vers Google et effectue la recherche
     */
    async navigateToGoogle(page, keyword) {
        // Délai initial plus court
        await this.randomDelay(1000, 2000);
        
        // First visit Google homepage with random timeout
        await page.goto(this.baseUrl, {
            waitUntil: 'networkidle0',
            timeout: this.timeout + Math.random() * 2000
        });

        // Délai plus court avant le popup de cookies
        await this.randomDelay(1000, 2000);

        // Gestion du popup de cookies
        await this.handleCookiePopup(page);
        
        // Délai plus court avant la recherche
        await this.randomDelay(1500, 3000);

        // Recherche du champ de recherche avec plusieurs sélecteurs possibles
        const searchInput = await page.evaluate(() => {
            const selectors = [
                'textarea[title="Rechercher"]',
                'input[name="q"]',
                'input[type="text"]',
                'input[aria-label="Rechercher"]',
                'input[aria-label="Search"]'
            ];

            for (const selector of selectors) {
                const element = document.querySelector(selector);
                if (element) return selector;
            }
            return null;
        });

        if (!searchInput) {
            throw new Error('Champ de recherche non trouvé');
        }

        // Saisie du mot-clé avec délai humain plus court
        await page.type(searchInput, keyword, { 
            delay: Math.random() * 50 + 25 
        });
        
        // Délai plus court avant d'appuyer sur entrée
        await this.randomDelay(800, 1500);
        
        // Press enter
        await page.keyboard.press('Enter');

        // Wait for search results with increased timeout
        await page.waitForSelector('#search', {
            timeout: this.timeout
        });

        // Additional wait for main content
        await page.waitForSelector('#main', { timeout: this.timeout });
    }

    /**
     * Gère le popup de cookies
     */
    async handleCookiePopup(page) {
        try {
            // Attendre que le popup apparaisse avec plusieurs sélecteurs possibles
            await page.waitForSelector(
                'button[id*="W0wltc"], button[id*="consent"], div[aria-label*="cookie"], div[aria-label*="Cookie"], div[role="dialog"]',
                { timeout: 10000 }
            );

            // Attendre un peu pour s'assurer que le popup est complètement chargé
            await this.randomDelay(1000, 2000);

            // Essayer plusieurs méthodes pour trouver et cliquer sur le bouton de refus
            const cookieHandled = await page.evaluate(() => {
                // Méthode 1: Chercher par texte du bouton
                const buttons = Array.from(document.querySelectorAll('button'));
                const rejectButton = buttons.find(button => {
                    const text = button.textContent.toLowerCase();
                    return text.includes('tout refuser') || 
                           text.includes('refuser tout') || 
                           text.includes('reject all') ||
                           text.includes('refuse all');
                });

                if (rejectButton) {
                    rejectButton.click();
                    return true;
                }

                // Méthode 2: Chercher par aria-label
                const rejectByAria = document.querySelector('button[aria-label*="refuser"], button[aria-label*="reject"]');
                if (rejectByAria) {
                    rejectByAria.click();
                    return true;
                }

                // Méthode 3: Chercher par classe spécifique
                const rejectByClass = document.querySelector('button.W0wltc, button[class*="reject"], button[class*="refuse"]');
                if (rejectByClass) {
                    rejectByClass.click();
                    return true;
                }

                return false;
            });

            if (!cookieHandled) {
                console.log('Impossible de trouver le bouton de refus des cookies');
                return;
            }

            // Attendre que le popup disparaisse
            await page.waitForFunction(() => {
                return !document.querySelector('button[id*="W0wltc"], button[id*="consent"], div[aria-label*="cookie"], div[aria-label*="Cookie"], div[role="dialog"]');
            }, { timeout: 10000 });

            // Attendre un peu pour s'assurer que tout est bien fermé
            await this.randomDelay(1000, 2000);

        } catch (error) {
            console.log('Pas de popup de cookies ou déjà géré:', error.message);
        }
    }

    /**
     * Vérifie la présence d'un CAPTCHA
     */
    async checkForCaptcha(page) {
        try {
            const captchaFrame = await page.$('iframe[src*="recaptcha"]');
            return !!captchaFrame;
        } catch (error) {
            return false;
        }
    }

    /**
     * Gère le CAPTCHA
     */
    async handleCaptcha(page) {
        console.log('CAPTCHA détecté - Attente de résolution manuelle...');
        try {
            await page.waitForFunction(() => {
                return !document.querySelector('iframe[src*="recaptcha"]');
            }, { timeout: 300000 }); // 5 minutes timeout
            console.log('CAPTCHA résolu!');
            return true;
        } catch (error) {
            console.log('Timeout du CAPTCHA');
            return false;
        }
    }

    /**
     * Attend le chargement des résultats
     */
    async waitForResults(page) {
        // Wait for both search container and main content
        await Promise.all([
            page.waitForSelector('#search', { timeout: this.timeout }),
            page.waitForSelector('#main', { timeout: this.timeout })
        ]);
        
        // Additional delay to ensure content is fully loaded
        await this.randomDelay(2000, 4000);
    }

    /**
     * Simule un comportement humain
     */
    async simulateHumanBehavior(page) {
        // Délai aléatoire plus long
        await this.randomDelay(3000, 6000);

        // Mouvements de souris plus naturels
        const points = this.generateMousePath();
        for (const point of points) {
            await page.mouse.move(point.x, point.y, { steps: 25 });
            await this.randomDelay(100, 300);
        }

        // Scroll naturel
        await this.naturalScroll(page);
    }

    /**
     * Génère un chemin de souris naturel
     */
    generateMousePath() {
        const points = [];
        const startX = Math.random() * 800;
        const startY = Math.random() * 600;
        const numPoints = Math.floor(Math.random() * 5) + 3;

        for (let i = 0; i < numPoints; i++) {
            points.push({
                x: startX + (Math.random() * 200 - 100),
                y: startY + (Math.random() * 200 - 100)
            });
        }

        return points;
    }

    /**
     * Simule un défilement naturel
     */
    async naturalScroll(page) {
        const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
        let currentScroll = 0;
        const scrollStep = Math.floor(Math.random() * 100) + 50;

        while (currentScroll < scrollHeight) {
            await page.evaluate((step) => {
                window.scrollBy(0, step);
            }, scrollStep);

            currentScroll += scrollStep;
            await this.randomDelay(100, 300);
        }

        // Scroll aléatoire vers le haut
        for (let i = 0; i < 3; i++) {
            await page.evaluate(() => {
                window.scrollBy(0, -Math.random() * 200);
            });
            await this.randomDelay(200, 500);
        }
    }

    /**
     * Extrait les résultats de la page
     */
    async extractResults(page, keyword) {
        try {
            // Attendre que le contenu principal soit chargé
            await page.waitForSelector('#center_col', { timeout: this.timeout });
            
            // Extraire le contenu de la colonne centrale
            const serpContent = await page.evaluate(() => {
                const centerCol = document.querySelector('#center_col');
                if (!centerCol) return null;

                return {
                    centerColContent: centerCol.innerHTML,
                    title: document.title,
                    url: window.location.href,
                    stats: document.querySelector('#result-stats')?.textContent || ''
                };
            });

            if (!serpContent) {
                throw new Error('Impossible de trouver le contenu #center_col');
            }

            // Utiliser l'extracteur de structure pour transformer le HTML
            const structuredContent = await htmlStructureExtractor.extract(serpContent.centerColContent);

            return {
                keyword,
                timestamp: new Date().toISOString(),
                title: serpContent.title,
                url: serpContent.url,
                stats: serpContent.stats,
                content: structuredContent
            };

        } catch (error) {
            console.error('Erreur lors de l\'extraction du DOM:', error);
            throw new Error(`Échec de l'extraction du DOM: ${error.message}`);
        }
    }

    /**
     * Ajoute un délai aléatoire entre les actions
     */
    async randomDelay(min, max) {
        const delay = Math.floor(Math.random() * (max - min + 1) + min);
        await new Promise(resolve => setTimeout(resolve, delay));
    }
}

// Export d'une instance unique
export const googleSerpScraper = new GoogleSerpScraper(); 