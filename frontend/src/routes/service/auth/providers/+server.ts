import { pb } from '$lib/pocketbase'; // Adjust the import path for PocketBase
import { json, error } from '@sveltejs/kit';

export const GET = async () => {
    try {
        // Fetch the available OAuth2 providers from PocketBase
        const authMethods = await pb.collection('users').listAuthMethods();
        const providers = authMethods.oauth2?.providers || [];

        // Return the providers as a JSON response
        return json(providers);
    } catch (err) {
        console.error('Error fetching OAuth2 providers:', err);
        // Return a 500 error if something goes wrong
        throw error(500, 'Failed to fetch OAuth2 providers');
    }
};