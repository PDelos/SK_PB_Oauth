import { pb } from '$lib/pocketbase';
import { goto } from '$app/navigation';
import { error } from '@sveltejs/kit';

/**
 * Fetches the list of available OAuth2 providers from PocketBase.
 * 
 * @returns An array of provider names as strings
 * @throws Error if fetching providers fails
 */
export async function getOAuthProviders(): Promise<string[]> {
    try {
        const authMethods = await pb.collection('users').listAuthMethods();
        return authMethods.oauth2?.providers.map(provider => provider.name) || [];
    } catch (err) {
        console.error('Error fetching OAuth2 providers:', err);
        throw error(500, 'Failed to fetch OAuth2 providers');
    }
}

/**
 * Attempts to authenticate a user via an OAuth2 provider in PocketBase.
 * Redirects to /home if successful.
 * 
 * @param provider - The name of the OAuth provider (e.g., "google", "github")
 * @throws Error if the provider is invalid or authentication fails
 */
export async function loginWithOAuth(provider: string) {
    try {
        const providers = await getOAuthProviders();

        if (!provider || !providers.includes(provider)) {
            throw error(400, `Invalid provider: ${provider}`);
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
    } catch (err) {
        console.error('Error during OAuth registration:', err);
        error(500, 'An unexpected error occurred during authentication');
    }
}


/**
 * Logs out the currently authenticated user.
 */
export async function logout(): Promise<void> {
    try {
        pb.authStore.clear(); // Clear the authentication store
        console.log('User logged out successfully');
        goto('/'); // Redirect to the homepage or login page
    } catch (err) {
        console.error('Error during logout:', err);
        throw error(500, 'Failed to log out');
    }
}

/**
 * Deletes the currently authenticated user's account.
 * 
 * @throws Error if the account deletion fails
 */
export async function deleteAccount(): Promise<void> {
    try {
        const userId = pb.authStore.record?.id; // Get the current user's ID
        if (!userId) {
            throw error(400, 'No authenticated user found');
        }

        await pb.collection('users').delete(userId); // Delete the user account
        pb.authStore.clear(); // Clear the authentication store
        console.log('User account deleted successfully');
        goto('/'); // Redirect to the homepage or login page
    } catch (err) {
        console.error('Error during account deletion:', err);
        throw error(500, 'Failed to delete account');
    }
}