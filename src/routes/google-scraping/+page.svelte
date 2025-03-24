<!-- Interface de test pour le scraping Google -->
<script>
    import { onMount } from 'svelte';
    import { user, checkAuth } from '$lib/auth';
    import { goto } from '$app/navigation';

    // Vérification de l'authentification au chargement
    onMount(() => {
        if (!checkAuth()) {
            goto('/login');
        }
    });

    let keyword = '';
    let loading = false;
    let error = null;
    let result = null;

    async function handleSubmit() {
        loading = true;
        error = null;
        result = null;

        try {
            const response = await fetch('/api/scraping/google', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('jwt')}`
                },
                body: JSON.stringify({ keyword })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erreur lors du scraping');
            }

            result = data;
        } catch (e) {
            error = e.message;
        } finally {
            loading = false;
        }
    }
</script>

<div class="container mx-auto p-4 max-w-5xl">
    <h1 class="text-2xl font-bold mb-6">Test du Scraper Google SERP</h1>

    <form on:submit|preventDefault={handleSubmit} class="mb-8">
        <div class="mb-4">
            <label for="keyword" class="block text-sm font-medium mb-2">Mot-clé à rechercher</label>
            <input
                type="text"
                id="keyword"
                bind:value={keyword}
                placeholder="Entrez votre mot-clé..."
                class="w-full p-2 border rounded"
                required
            />
        </div>

        <button
            type="submit"
            class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            disabled={loading}
        >
            {loading ? 'Recherche en cours...' : 'Lancer la recherche'}
        </button>
    </form>

    {#if error}
        <div class="bg-red-100 border-l-4 border-red-500 p-4 mb-4">
            <p class="text-red-700">{error}</p>
        </div>
    {/if}

    {#if result}
        <div class="bg-white shadow-lg rounded-lg overflow-hidden">
            <div class="p-4 bg-gray-50 border-b">
                <h2 class="text-lg font-semibold">Résultats de la recherche</h2>
                <div class="text-sm text-gray-600">
                    <p>Mot-clé: {result.keyword}</p>
                    <p>Recherché le: {new Date(result.timestamp).toLocaleString()}</p>
                    {#if result.stats}
                        <p>Statistiques: {result.stats}</p>
                    {/if}
                </div>
            </div>

            <div class="p-4">
                <div class="relative">
                    <!-- Bouton de copie -->
                    <button
                        class="absolute top-2 right-2 bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-sm"
                        on:click={() => {
                            navigator.clipboard.writeText(result.content);
                        }}
                    >
                        Copier
                    </button>
                    <!-- Affichage du contenu structuré -->
                    <pre class="bg-gray-100 p-4 rounded overflow-auto max-h-[600px] text-sm whitespace-pre-wrap font-mono">{result.content}</pre>
                </div>
            </div>
        </div>
    {/if}
</div>

<style>
    /* Styles spécifiques pour le rendu de la SERP */
    :global(.g) {
        margin-bottom: 1rem;
        padding: 0.5rem;
        border-bottom: 1px solid #eee;
    }
    :global(.r) {
        color: #1a0dab;
        font-size: 1.1rem;
        margin-bottom: 0.25rem;
    }
    :global(.st) {
        color: #4d5156;
        line-height: 1.4;
    }
</style> 