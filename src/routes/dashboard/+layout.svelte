<script>
    import { page } from '$app/stores';
</script>

<div class="min-h-screen bg-gray-100">
    <!-- Navigation latérale -->
    <nav class="fixed top-0 left-0 h-full w-64 bg-white shadow-lg">
        <div class="p-4">
            <h1 class="text-xl font-bold text-gray-800">Dashboard</h1>
        </div>
        <ul class="mt-4">
            <li>
                <a
                    href="/dashboard"
                    class="block px-4 py-2 text-gray-600 hover:bg-gray-100 {$page.url.pathname === '/dashboard' ? 'bg-gray-100 font-medium' : ''}"
                >
                    Accueil
                </a>
            </li>
            <li>
                <a
                    href="/dashboard/api-keys"
                    class="block px-4 py-2 text-gray-600 hover:bg-gray-100 {$page.url.pathname === '/dashboard/api-keys' ? 'bg-gray-100 font-medium' : ''}"
                >
                    Clés API
                </a>
            </li>
            <li>
                <a
                    href="/dashboard/profile"
                    class="block px-4 py-2 text-gray-600 hover:bg-gray-100 {$page.url.pathname === '/dashboard/profile' ? 'bg-gray-100 font-medium' : ''}"
                >
                    Profil
                </a>
            </li>
        </ul>
    </nav>

    <!-- Contenu principal -->
    <main class="ml-64 p-8">
        <slot />
    </main>
</div>

<style>
    /* Styles spécifiques si nécessaire */
</style> 