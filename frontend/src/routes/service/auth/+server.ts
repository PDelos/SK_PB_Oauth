import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Handles logout requests
export const POST: RequestHandler = async ({ locals }) => {
    try {
        // Clear the auth store on the server
        locals.pb.authStore.clear();
        
        // Return a response that includes cookie clearing instructions
        return new Response(JSON.stringify({ success: true }), {
            headers: {
                'content-type': 'application/json',
                // Clear the auth cookie by setting max-age to 0
                'set-cookie': 'pb_auth=; path=/; max-age=0; HttpOnly;'
            }
        });
    } catch (err) {
        console.error('Error during logout:', err);
        throw error(500, 'Failed to log out');
    }
};

// Handles account deletion requests
export const DELETE: RequestHandler = async ({ locals }) => {
    try {
        // Check if user is authenticated
        const userId = locals.user?.id;
        
        if (!userId) {
            throw error(401, 'No authenticated user found');
        }
        
        // Delete the user's account
        await locals.pb.collection('users').delete(userId);
        
        // Clear the auth store on the server
        locals.pb.authStore.clear();
        
        // Return response with cookie clearing
        return new Response(JSON.stringify({ success: true }), {
            headers: {
                'content-type': 'application/json',
                // Clear the auth cookie by setting max-age to 0
                'set-cookie': 'pb_auth=; path=/; max-age=0; HttpOnly;'
            }
        });
    } catch (err) {
        console.error('Error during account deletion:', err);
        throw error(500, 'Failed to delete account');
    }
};