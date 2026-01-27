import { Client, Storage, Databases, TablesDB, Account, Query } from 'appwrite';
import {
	PUBLIC_APPWRITE_ENDPOINT,
	PUBLIC_APPWRITE_PROJECT_ID,
	PUBLIC_APPWRITE_DATABASE_ID,
	PUBLIC_APPWRITE_BUCKET_ID,
	PUBLIC_APPWRITE_PROFESSORS_TABLE_ID,
	PUBLIC_APPWRITE_USERS_TABLE_ID,
	PUBLIC_APPWRITE_REVIEWS_TABLE_ID
} from '$env/static/public';

// AppWrite configuration
const client = new Client()
	.setEndpoint(PUBLIC_APPWRITE_ENDPOINT)
	.setProject(PUBLIC_APPWRITE_PROJECT_ID);

export const storage = new Storage(client);
export const tableDB = new Databases(client);
export const tablesDB = new TablesDB(client);
export const account = new Account(client);

// IDs
export const DATABASE_ID = PUBLIC_APPWRITE_DATABASE_ID;
export const BUCKET_ID = PUBLIC_APPWRITE_BUCKET_ID;
export const PROFESSORS_TABLE_ID = PUBLIC_APPWRITE_PROFESSORS_TABLE_ID;
export const USERS_TABLE_ID = PUBLIC_APPWRITE_USERS_TABLE_ID;
export const REVIEWS_TABLE_ID = PUBLIC_APPWRITE_REVIEWS_TABLE_ID;

/**
 *
 * @param {string} userId
 * @returns
 */
export async function getUserById(userId) {
	try {
		const userRows = await tablesDB.listRows({
			databaseId: DATABASE_ID,
			tableId: USERS_TABLE_ID,
			queries: [Query.equal('userId', userId)] // Match userId with user.$id
		});

		if (userRows.total > 0) {
			return userRows.rows[0]; // Return the first matching user
		} else {
			return null; // No user found
		}
	} catch (error) {
		console.error('Error fetching user by ID:', error);
		return null;
	}
}

/**
 *
 * @param {string} userId
 * @returns
 */
export async function getAvatarUrl(userId) {
	try {
		const userRows = await tablesDB.listRows({
			databaseId: DATABASE_ID,
			tableId: USERS_TABLE_ID,
			queries: [Query.equal('userId', userId)] // Match userId with user.$id
		});
		if (userRows.total === 0) {
			return null; // No user found
		}
		const avatarUrl = storage.getFileView({
			bucketId: BUCKET_ID,
			fileId: userRows.rows[0].avatarId
		});
		return avatarUrl;
	} catch (error) {
		console.error('Error fetching avatar URL:', error);
		return null;
	}
}
