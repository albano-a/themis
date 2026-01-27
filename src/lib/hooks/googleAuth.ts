import { OAuthProvider } from 'appwrite';
import { account } from '$lib/appwrite';

async function loginWithGoogle() {
	try {
		// Initiate OAuth2 flow - this redirects the user to Google
		await account.createOAuth2Token(
			OAuthProvider.Google,
			'http://localhost:5173/profile', // Success URL
			'http://localhost:5173/login?failure=true' // Failure URL
		);
		// User is redirected - no code runs after this
	} catch (err) {
		console.error('Failed to initiate Google OAuth:', err);
		throw err;
	}
}

export { loginWithGoogle };
