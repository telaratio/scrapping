<script>
    import { user } from '$lib/auth';
</script>

<main class="container">
    <div class="hero-section">
        <h1 class="text-4xl font-bold mb-4">Bienvenue sur Web Scraper</h1>
        <p class="text-xl text-gray-600 mb-8">Une solution puissante pour extraire et analyser des données web</p>
        
        {#if $user}
            <a href="/dashboard" class="btn-primary">Accéder au dashboard</a>
        {:else}
            <div class="flex gap-4">
                <a href="/login" class="btn-primary">Se connecter</a>
                <a href="/register" class="btn-secondary">S'inscrire</a>
            </div>
        {/if}
    </div>

    <div class="features-section">
        <h2 class="section-title">Fonctionnalités principales</h2>
        <div class="features-grid">
            <div class="feature-card">
                <h3 class="feature-title">Scraping Google</h3>
                <p class="feature-description">Extrayez les résultats de recherche Google de manière structurée et efficace.</p>
            </div>
            <div class="feature-card">
                <h3 class="feature-title">Scraping de Pages Web</h3>
                <p class="feature-description">Analysez le contenu de n'importe quelle page web avec précision.</p>
            </div>
            <div class="feature-card">
                <h3 class="feature-title">API REST</h3>
                <p class="feature-description">Intégrez facilement nos fonctionnalités dans vos applications via notre API.</p>
            </div>
            <div class="feature-card">
                <h3 class="feature-title">Gestion des Clés API</h3>
                <p class="feature-description">Gérez vos clés API et suivez leur utilisation en temps réel.</p>
            </div>
        </div>
    </div>

    <div class="cta-section">
        <h2 class="section-title">Prêt à commencer ?</h2>
        <p class="text-xl text-gray-600 mb-8">Créez un compte gratuit et commencez à extraire des données dès aujourd'hui.</p>
        {#if !$user}
            <a href="/register" class="btn-primary">Créer un compte gratuit</a>
        {/if}
    </div>
</main>

<style>
    .hero-section {
        text-align: center;
        padding: 4rem 0;
        background: linear-gradient(to bottom, var(--background-color), white);
        border-radius: 1rem;
        margin-bottom: 4rem;
    }

    .features-section {
        margin-bottom: 4rem;
    }

    .section-title {
        font-size: 2rem;
        font-weight: 700;
        color: var(--text-color);
        margin-bottom: 2rem;
        text-align: center;
    }

    .features-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 2rem;
        padding: 1rem;
    }

    .feature-card {
        background: white;
        padding: 2rem;
        border-radius: 0.5rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        transition: transform 0.2s ease;
    }

    .feature-card:hover {
        transform: translateY(-5px);
    }

    .feature-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--primary-color);
        margin-bottom: 1rem;
    }

    .feature-description {
        color: var(--text-color);
        line-height: 1.6;
    }

    .cta-section {
        text-align: center;
        padding: 4rem 0;
        background: linear-gradient(to top, var(--background-color), white);
        border-radius: 1rem;
    }

    .btn-primary {
        display: inline-block;
        padding: 0.75rem 1.5rem;
        background-color: var(--primary-color);
        color: white;
        border-radius: 0.5rem;
        font-weight: 600;
        text-decoration: none;
        transition: background-color 0.2s ease;
    }

    .btn-primary:hover {
        background-color: var(--secondary-color);
    }

    .btn-secondary {
        display: inline-block;
        padding: 0.75rem 1.5rem;
        background-color: white;
        color: var(--primary-color);
        border: 2px solid var(--primary-color);
        border-radius: 0.5rem;
        font-weight: 600;
        text-decoration: none;
        transition: all 0.2s ease;
    }

    .btn-secondary:hover {
        background-color: var(--primary-color);
        color: white;
    }

    @media (max-width: 768px) {
        .hero-section {
            padding: 2rem 0;
        }

        .features-grid {
            grid-template-columns: 1fr;
        }

        .section-title {
            font-size: 1.5rem;
        }
    }
</style>