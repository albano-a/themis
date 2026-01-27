import { Client, Storage, Databases, TablesDB, Account } from 'appwrite';
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
