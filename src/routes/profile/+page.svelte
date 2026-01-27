<script lang="ts">
	import {
		account,
		storage,
		BUCKET_ID,
		USERS_TABLE_ID,
		DATABASE_ID,
		tablesDB
	} from '$lib/appwrite';
	import { getUserById, getAvatarUrl } from '$lib/appwrite';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { LogOut, Pencil } from 'lucide-svelte';
	import type { Models } from 'appwrite';
	import { updateAvatarUrl } from '$lib/stores/avatarStore';
	import Avatar from '$lib/components/Avatar.svelte';
	import { Query } from 'appwrite';

	let user: Models.User | null = $state(null);
	let newName: string = $state('');
	let loading: boolean = $state(false);
	let avatarFile: File | null = $state(null);
	let message: string = $state('');
	let messageType: 'success' | 'error' | '' = $state('');
	let showModal: boolean = $state(false);
	let imageElement: HTMLImageElement | null = $state(null);
	let avatarUrl = $state<string | null>(null);

	onMount(async () => {
		try {
			user = await account.get();
			newName = user.name || '';
			const prefs = await account.getPrefs();
			if (prefs.avatarId) {
				const fetchedAvatarUrl = await getAvatarUrl(user.$id);
				avatarUrl = fetchedAvatarUrl; // Update the global store
			}
		} catch {
			await goto('/login');
		}
	});

	/**
	 * Updates the user's name.
	 */
	async function updateName() {
		if (!newName.trim()) return;
		loading = true;
		message = '';
		try {
			await account.updateName(newName);
			if (user) user.name = newName;
			message = 'Nome atualizado com sucesso!';
			messageType = 'success';
		} catch (err) {
			console.error(err);
			message = 'Erro ao atualizar nome.';
			messageType = 'error';
		} finally {
			loading = false;
		}
	}

	/**
	 * Opens the avatar edit modal.
	 */
	function openModal() {
		showModal = true;
	}

	/**
	 * Closes the avatar edit modal.
	 */
	function closeModal() {
		showModal = false;
		avatarFile = null;
		if (imageElement) imageElement.src = '';
	}

	/**
	 * Handles file selection and sets the preview.
	 */
	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file && imageElement) {
			avatarFile = file;
			const reader = new FileReader();
			reader.onload = (e) => {
				if (imageElement) imageElement.src = e.target?.result as string;
			};
			reader.readAsDataURL(file);
		}
	}

	/**
	 * Uploads the selected avatar image.
	 */
	async function uploadAvatar() {
		if (!avatarFile) return;
		loading = true;
		message = '';
		try {
			const uploadedFile = await storage.createFile(BUCKET_ID, 'unique()', avatarFile);
			const newAvatarUrl = storage.getFileView({ bucketId: BUCKET_ID, fileId: uploadedFile.$id });
			await account.updatePrefs({ avatarId: uploadedFile.$id });
			// Match the user.$id with the col userId before updating the table
			if (user?.$id) {
				try {
					const userDocument = await getUserById(user.$id);

					// Update the users table document to include the avatarId
					if (!userDocument) {
						throw new Error('User document not found');
					}
					await tablesDB.updateRow({
						databaseId: DATABASE_ID,
						tableId: USERS_TABLE_ID,
						rowId: userDocument.$id,
						data: {
							avatarId: uploadedFile.$id
						}
					});
				} catch (err) {
					console.error('Failed to update users table with avatarId', err);
				}
			}
			if (newAvatarUrl) avatarUrl = newAvatarUrl; // only call when defined
			message = 'Avatar atualizado com sucesso!';
			messageType = 'success';
			closeModal();
		} catch (err) {
			console.error(err);
			message = 'Erro ao atualizar avatar.';
			messageType = 'error';
		} finally {
			loading = false;
		}
	}

	/**
	 * Logs out the user and redirects to login.
	 */
	async function logout() {
		try {
			await account.deleteSession('current');
			await goto('/login');
		} catch (err) {
			console.error(err);
		}
	}
</script>

<div class="min-h-screen bg-base-200 font-sans">
	<div class="container mx-auto px-4 py-8">
		<div class="mx-auto max-w-2xl">
			<div class="card bg-base-100 shadow-xl">
				<div class="card-body">
					<h2 class="card-title text-3xl font-black">Perfil</h2>

					{#if message}
						<div role="alert" class="alert alert-{messageType} rounded-lg py-2 text-sm">
							<span>{message}</span>
						</div>
					{/if}

					<!-- Avatar Section -->
					<div class="flex flex-col items-center gap-4 py-6">
						<div class="relative">
							<Avatar name={user?.name} src={avatarUrl} size="w-24 h-24" textSize="text-3xl" />
							<button
								class="0 btn absolute -right-2 -bottom-2 btn-circle bg-base-100 text-primary shadow-xl ring-2 ring-base-100 transition-transform btn-sm hover:scale-105 hover:bg-base-200"
								onclick={openModal}
								aria-label="Editar foto de perfil"
							>
								<Pencil class="h-4 w-4" />
							</button>
						</div>
					</div>

					<!-- Name Section -->
					<div class="form-control">
						<div class="label">
							<span class="label-text font-bold">Nome</span>
						</div>
						<div class="flex gap-2">
							<input
								type="text"
								class="input-bordered input flex-1"
								placeholder="Seu nome"
								bind:value={newName}
							/>
							<button class="btn btn-primary" onclick={updateName} disabled={loading}>
								{#if loading}
									<span class="loading loading-sm loading-spinner"></span>
								{:else}
									Salvar
								{/if}
							</button>
						</div>
					</div>

					<!-- Logout Section -->
					<div class="divider"></div>
					<div class="card-actions justify-end">
						<button class="btn btn-error" onclick={logout}>
							<LogOut class="mr-2 h-4 w-4" />
							Sair
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Avatar Edit Modal -->
	<div class="modal {showModal ? 'modal-open' : ''}">
		<div class="modal-box max-w-lg">
			<h3 class="mb-4 text-lg font-bold">Editar Avatar</h3>
			<div class="form-control mb-4">
				<div class="label">
					<span class="label-text">Selecione uma imagem</span>
				</div>
				<input
					type="file"
					accept="image/*"
					class="file-input-bordered file-input file-input-sm"
					onchange={handleFileSelect}
				/>
			</div>
			<div class="mb-4">
				<img bind:this={imageElement} alt="Preview" class="h-auto max-w-full" />
			</div>
			<div class="modal-action">
				<button class="btn" onclick={closeModal}>Cancelar</button>
				<button class="btn btn-primary" onclick={uploadAvatar} disabled={loading || !avatarFile}>
					{#if loading}
						<span class="loading loading-sm loading-spinner"></span>
					{:else}
						Salvar
					{/if}
				</button>
			</div>
		</div>
	</div>
</div>
