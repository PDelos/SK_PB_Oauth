// src/routes/+layout.ts
import { pb } from '$lib/pocketbase';
import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';
import type { RecordModel } from 'pocketbase';

export const load: LayoutLoad = async () => {
	if (!pb.authStore.isValid || !pb.authStore.record) {
		console.log('User is not authenticated, redirecting to /auth');
		throw redirect(302, '/auth');
	}

	// Explicitly typing user as RecordModel or custom user type
	const user: RecordModel = pb.authStore.record;

	return {
		user: user,
	};
};
