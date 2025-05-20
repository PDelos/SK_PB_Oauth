<script lang="ts">
	import { onMount } from "svelte";
    import { pb } from '$lib/pocketbase';
    import { goto } from '$app/navigation';
    import { error } from '@sveltejs/kit';


    let loading: boolean = $state(true);
    let providers: string[] = $state([]);

    // Before component mounts, we get all providers in pocketbase
    onMount(async () => {
        try {
            console.log('Fetching OAuth2 providers...');
            const authMethods = await pb.collection('users').listAuthMethods();
            providers = authMethods.oauth2?.providers.map(provider => provider.name) || [];
            loading = false;
        } catch (err) {
            console.error('Error fetching OAuth2 providers:', err);
            error(500, 'Failed to fetch OAuth2 providers');
        }
    });

    async function loginWithOAuth(provider: string): Promise<void> {
        try {
            if (!provider || !providers.includes(provider)) {
                error(400, `Invalid provider: ${provider}`);
            }

            const response = await pb.collection('users').authWithOAuth2({ provider });

            if (pb.authStore.isValid) {
                if (response.meta?.isNew) {
                    await pb.collection('users').update(response.record.id, {
                        name: response.meta.name
                    });
                    console.log('New user registered with', provider);
                } else {
                    console.log('User logged in with', provider);
                }

                goto('/home');
            } else {
                error(401, 'Authentication failed');
            }
        } catch (e) {
            console.error('Error during OAuth registration:', e);
            error(500, 'An unexpected error occurred during authentication');
        }
    }
</script>

<div class="max-w-md mx-auto mt-24 p-8 bg-white rounded-lg shadow-md">
    <h1 class="text-2xl font-bold mb-8 text-gray-800 text-center">Login</h1>
    
    {#if loading}
        <div class="p-4 text-gray-600 italic text-center">Loading providers...</div>
    {:else if providers.length === 0}
        <div class="p-4 text-gray-600 italic text-center">No login providers available</div>
    {:else}
        <div class="flex flex-col space-y-3">
            {#each providers as provider}
                <button 
                    class="w-full py-3 px-4 rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-400"
                    onclick={() => loginWithOAuth(provider)}
                >
                    Continue with {provider}
                </button>
            {/each}
        </div>
    {/if}
</div>