<script lang="ts">
    import { onMount } from "svelte";
    import { loginWithOAuth, getOAuthProviders } from "$lib/auth";

    let loading: boolean = $state(true);
    let providers: string[] = $state([]);

    // Before component mounts, we get all providers in pocketbase
    onMount(async () => {
        providers = await getOAuthProviders().catch(() => []);
        loading = false;
    });
    
    function handleLogin(provider: string) {
        loading = true; // Show loading while authenticating
        loginWithOAuth(provider).finally(() => {
            loading = false;
        });
    }
</script>

<div class="max-w-md mx-auto mt-24 p-8 bg-white rounded-lg shadow-md">
    <h1 class="text-2xl font-bold mb-8 text-gray-800 text-center">Login</h1>
    
    {#if loading}
        <div class="p-4 text-gray-600 italic text-center">Loading...</div>
    {:else if providers.length === 0}
        <div class="p-4 text-gray-600 italic text-center">No login providers available</div>
    {:else}
        <div class="flex flex-col space-y-3">
            {#each providers as provider}
                <button 
                    class="w-full py-3 px-4 rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-400"
                    onclick={() => handleLogin(provider)}
                >
                    Continue with {provider}
                </button>
            {/each}
        </div>
    {/if}
</div>