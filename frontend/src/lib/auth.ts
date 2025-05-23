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

        const response = await pb.collection('users').authWithOAuth2({ provider,
            createData: {
                name: '',
                avatar: '',
                verified: false
            } 
        });

        if (pb.authStore.isValid) {
            const cookieString = pb.authStore.exportToCookie({ httpOnly: false });
            document.cookie = cookieString;

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
 * Logs out the currently authenticated user by calling the server logout endpoint.
 */
export async function logout(): Promise<void> {
    try {
        const response = await fetch('/service/auth', {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Logout failed');
        }
        
        // Also clear client-side authentication
        pb.authStore.clear();
        
        console.log('User logged out successfully');
        await goto('/auth');
    } catch (err) {
        console.error('Error during logout:', err);
        throw error(404, 'Failed to log out');
    }
}

/**
 * Deletes the currently authenticated user's account.
 */
export async function deleteAccount(): Promise<void> {
    try {
        const response = await fetch('/service/auth', {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw error(404, 'Account deletion failed');
        }
        
        // Also clear client-side authentication
        pb.authStore.clear();
        
        console.log('User account deleted successfully');
        await goto('/auth');
    } catch (err) {
        console.error('Error during account deletion:', err);
        throw error(404, 'Failed to delete account');
    }
}