<script>
    import { goto } from '$app/navigation';
    
    let email = '';
    let password = '';
    let confirmPassword = '';
    let name = '';
    let error = '';
    let loading = false;

    async function handleSubmit() {
        loading = true;
        error = '';

        if (password !== confirmPassword) {
            error = 'Les mots de passe ne correspondent pas';
            loading = false;
            return;
        }
        
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, name })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erreur lors de l\'inscription');
            }

            // Stockage du token JWT si retourné par l'API
            if (data.token) {
                localStorage.setItem('jwt', data.token);
            }
            
            // Redirection vers la page de connexion ou le dashboard
            goto('/login');
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
                Créer un compte
            </h2>
        </div>
        <form class="mt-8 space-y-6" on:submit|preventDefault={handleSubmit}>
            {#if error}
                <div class="rounded-md bg-red-50 p-4">
                    <div class="text-sm text-red-700">
                        {error}
                    </div>
                </div>
            {/if}
            
            <div class="rounded-md shadow-sm -space-y-px">
                <div>
                    <label for="name" class="sr-only">Nom</label>
                    <input
                        bind:value={name}
                        id="name"
                        name="name"
                        type="text"
                        required
                        class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                        placeholder="Nom complet"
                    />
                </div>
                <div>
                    <label for="email" class="sr-only">Adresse email</label>
                    <input
                        bind:value={email}
                        id="email"
                        name="email"
                        type="email"
                        required
                        class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                        placeholder="Adresse email"
                    />
                </div>
                <div>
                    <label for="password" class="sr-only">Mot de passe</label>
                    <input
                        bind:value={password}
                        id="password"
                        name="password"
                        type="password"
                        required
                        class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                        placeholder="Mot de passe"
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
                        Inscription en cours...
                    {:else}
                        S'inscrire
                    {/if}
                </button>
            </div>

            <div class="text-sm text-center">
                <a href="/login" class="font-medium text-indigo-600 hover:text-indigo-500">
                    Déjà un compte ? Se connecter
                </a>
            </div>
        </form>
    </div>
</div> 