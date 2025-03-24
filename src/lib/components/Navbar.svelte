<script>
    import { page } from '$app/stores';
</script>

<nav class="navbar">
    <div class="navbar-container">
        <a href="/" class="navbar-brand">Web Scraper</a>
        <div class="navbar-links">
            <a href="/" class="navbar-link" class:active={$page.url.pathname === '/'}>Accueil</a>
            <a href="/dashboard" class="navbar-link" class:active={$page.url.pathname === '/dashboard'}>Tableau de bord</a>
            <a href="/google-scraping" class="navbar-link" class:active={$page.url.pathname === '/google-scraping'}>Scraping Google</a>
            <a href="/webpage-scraping" class="navbar-link" class:active={$page.url.pathname === '/webpage-scraping'}>Scraping Page Web</a>
            <a href="/keys" class="navbar-link" class:active={$page.url.pathname === '/keys'}>Clés API</a>
        </div>
    </div>
</nav>

<style>
    /* Les styles sont déjà définis dans le fichier styles.css */
</style> 