import { writable } from 'svelte/store';

// Create a writable store for the avatar URL
export const avatarUrl = writable<string | null>(null);

// Function to update the avatar URL globally
export function updateAvatarUrl(newUrl: string | null) {
    avatarUrl.set(newUrl);
}