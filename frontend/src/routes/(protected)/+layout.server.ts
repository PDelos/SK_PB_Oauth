import { pb } from '$lib/pocketbase';
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies }) => {
    try {
        // Load the auth store from cookies
        pb.authStore.loadFromCookie(cookies.get('pb_auth') || '');

        // Optionally refresh the auth store if the user is authenticated
        if (pb.authStore.isValid) {
            try {
                await pb.collection('users').authRefresh();
            } catch (_) {
                pb.authStore.clear();
            }
        }

        // Check if the user is authenticated
        if (!pb.authStore.isValid || !pb.authStore.record) {
            console.warn('User is not authenticated. Redirecting to login.');
            throw redirect(303, '/');
        }

        console.log('User is authenticated:', pb.authStore.record);

        // Return the authenticated user's data
        return {
            user: pb.authStore.record
        };
    } catch (err) {
        console.error('Error during authentication check:', err);
        throw redirect(303, '/');
    }
};