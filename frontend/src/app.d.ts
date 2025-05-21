// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			// The user object is of type RecordModel from PocketBase
			user: import('pocketbase').RecordModel | null;
			pb: import('pocketbase').default;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
