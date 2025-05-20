import { pb } from '$lib/pocketbase'; // Adjust the import path for PocketBase
import { redirect, error } from '@sveltejs/kit';

export const POST = async ({ params }: { params: { provider: string } }) => {
    const { provider } = params;
    const authMethods = await pb.collection('users').listAuthMethods();
    const providers = authMethods.oauth2?.providers || [];

    if (!provider || !providers.some(p => p.name === provider)) {
        throw error(400, `Invalid provider: ${provider}`);
    }

    try {
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
            throw redirect(303, '/homes');
        } else {
            throw error(401, 'Authentication failed');
        }
    } catch (err) {
        console.error('Error during OAuth registration:', err);
        throw error(500, 'An unexpected error occurred during authentication.');
    }
};