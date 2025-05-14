// src/routes/login/[provider]/+server.ts
import type { RequestHandler } from './$types';
import { pb } from '$lib/pocketbase';


export const GET: RequestHandler = async ({ params, url }) => {
	const provider: string = params.provider;
    const authData = await pb.collection('users').authWithOAuth2({ provider: provider });
    console.log('authData', authData);
};
