import { writable } from 'svelte/store';

export const userStore = writable<import('appwrite').Models.User | null>(null);
