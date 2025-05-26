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
            // Create user-info record for the new user
            try {
                const userInfo = await createUserInfo(response.record.id);
                // Link the user_info record to the user (now they have the same ID)
                await pb.collection('users').update(response.record.id, {
                    info: userInfo.id
                });
            } catch (infoError) {
                console.warn('Failed to create user-info record:', infoError);
                // Don't fail the authentication, just log the warning
            }

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




/**
 * Creates a user-info record for a new user
 * 
 * @param userId - The ID of the user to create info for
 * @returns The created user_info record
 * @throws Error if creation fails
 */
export async function createUserInfo(userId: string): Promise<any> {
    try {
        const userInfo = await pb.collection('user_info').create({
            id: userId, // Set the same ID as the user
            user: userId, // Link to the user
            name: '',
            avatar: null,
            cv: null,
            github: '',
            linkedin: '',
            website: '',
            preferences: []
        });
        console.log('User info record created successfully');
        return userInfo;
    } catch (err) {
        console.error('Error creating user info:', err);
        throw err;
    }
}

/**
 * Updates the user-info record for the current user
 * 
 * @param data - An object containing the fields to update
 * @throws Error if the update fails or no user is authenticated
 */
export async function updateUserInfo(data: Record<string, any>): Promise<void> {
    try {
        const user = pb.authStore.record;
        if (!user || !user.info) {
            throw error(401, 'No authenticated user or user info found');
        }

        // Update the user-info record directly using the relation
        await pb.collection('user_info').update(user.info, data);
        console.log('User info updated successfully');
    } catch (err) {
        console.error('Error updating user info:', err);
        throw error(400, 'Failed to update user info');
    }
}