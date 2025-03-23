<script>
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    
    let password = '';
    let confirmPassword = '';
    let error = '';
    let success = '';
    let loading = false;

    async function handleSubmit() {
        loading = true;
        error = '';
        success = '';

        if (password !== confirmPassword) {
            error = 'Les mots de passe ne correspondent pas';
            loading = false;
            return;
        }
        
        try {
            const token = $page.url.searchParams.get('token');
            if (!token) {
                throw new Error('Token de réinitialisation manquant');
            }

            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ token, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erreur lors de la réinitialisation');
            }

            success = data.message;
            
            // Redirect to login after 3 seconds
            setTimeout(() => goto('/login'), 3000);
        } catch (err) {
            error = err.message;
        } finally {
            loading = false;
        }
    }
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
        <div>
            <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Réinitialisation du mot de passe
            </h2>
            <p class="mt-2 text-center text-sm text-gray-600">
                Entrez votre nouveau mot de passe
            </p>
        </div>
        <form class="mt-8 space-y-6" on:submit|preventDefault={handleSubmit}>
            {#if error}
                <div class="rounded-md bg-red-50 p-4">
                    <div class="text-sm text-red-700">
                        {error}
                    </div>
                </div>
            {/if}

            {#if success}
                <div class="rounded-md bg-green-50 p-4">
                    <div class="text-sm text-green-700">
                        {success}
                    </div>
                </div>
            {/if}
            
            <div class="rounded-md shadow-sm -space-y-px">
                <div>
                    <label for="password" class="sr-only">Nouveau mot de passe</label>
                    <input
                        bind:value={password}
                        id="password"
                        name="password"
                        type="password"
                        required
                        class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                        placeholder="Nouveau mot de passe"
                    />
                </div>
                <div>
                    <label for="confirmPassword" class="sr-only">Confirmer le mot de passe</label>
                    <input
                        bind:value={confirmPassword}
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        required
                        class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                        placeholder="Confirmer le mot de passe"
                    />
                </div>
            </div>

            <div class="text-sm text-gray-600">
                <p>Le mot de passe doit contenir :</p>
                <ul class="list-disc list-inside mt-1">
                    <li>Au moins 8 caractères</li>
                    <li>Au moins une majuscule</li>
                    <li>Au moins une minuscule</li>
                    <li>Au moins un chiffre</li>
                    <li>Au moins un caractère spécial (&#33;&#64;&#35;&#36;&#37;&#94;&#38;&#42;&#40;&#41;&#44;&#46;&#63;&#34;&#58;&#123;&#125;&#124;&#60;&#62;)</li>
                </ul>
            </div>

            <div>
                <button
                    type="submit"
                    disabled={loading}
                    class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    {#if loading}
                        <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                            <!-- Spinner -->
                            <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </span>
                        Réinitialisation en cours...
                    {:else}
                        Réinitialiser le mot de passe
                    {/if}
                </button>
            </div>

            <div class="text-sm text-center">
                <a href="/login" class="font-medium text-indigo-600 hover:text-indigo-500">
                    Retour à la page de connexion
                </a>
            </div>
        </form>
    </div>
</div> 