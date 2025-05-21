import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import type { RequestEvent } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ locals }) => {
	// Check if user is authenticated
	if (!locals.user || !locals.pb.authStore.isValid) {
		throw redirect(303, '/auth');
	}
  
	return {
		user: locals.user,
	};
};