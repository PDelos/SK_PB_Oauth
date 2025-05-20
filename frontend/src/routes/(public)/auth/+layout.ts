import { pb } from '$lib/pocketbase';
import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async () => {
    // Check if user is already authenticated
    if (pb.authStore.isValid) {
        // Redirect authenticated users away from auth pages
        console.log('User is authenticated, redirecting to /home');
        throw redirect(302, '/home');
    }

    // Return empty props object for the layout
    return {};
};