import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {	
	if (locals.user && locals.pb.authStore.isValid) {
        console.log('User is authenticated:', locals.user);
	    throw redirect(303, '/home');
	}
  
	return {};
};