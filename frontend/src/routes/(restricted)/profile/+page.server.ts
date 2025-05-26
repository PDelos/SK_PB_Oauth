import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// User is already validated in the layout
	const user = locals.user;

	if (!user) {
		throw new Error('User not found');
	}

	// Fetch user-info record using the relation
	let userInfo = null;
	try {
		userInfo = await locals.pb.collection('user_info').getOne(user.info);
	} catch (err) {
		console.error('Error fetching/creating user info:', err);
	}

	return {
		user,
		userInfo
	};
};
