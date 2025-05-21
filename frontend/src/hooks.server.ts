// src/hooks.server.ts
import PocketBase from 'pocketbase';
import { PUBLIC_POCKETBASE_URL } from '$env/static/public';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  // Initialize a new PocketBase instance for each request
  const pb = new PocketBase(PUBLIC_POCKETBASE_URL);

  // Load the authentication store from cookies
  pb.authStore.loadFromCookie(event.request.headers.get('cookie') || '');

  try {
    // Attempt to refresh the authentication to verify the token
    if (pb.authStore.isValid) {
      await pb.collection('users').authRefresh();
      event.locals.user = pb.authStore.model;
    }
  } catch {
    // Clear the authentication store if refresh fails
    pb.authStore.clear();
    event.locals.user = null;
  }

  // Assign the PocketBase instance to locals
  event.locals.pb = pb;

  // Proceed with the request
  const response = await resolve(event);

  // Set the updated authentication cookie in the response
  response.headers.set('set-cookie', pb.authStore.exportToCookie({ httpOnly: true }));

  return response;
};
