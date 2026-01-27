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
	import Avatar from '$lib/components/Avatar.svelte';
	import { Query } from 'appwrite';
	import { userStore } from '$lib/stores/userStore';

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
			userStore.set(user); // Update the global user store
			newName = user.name || '';
			const prefs = await account.getPrefs();
			if (prefs.avatarId) {
				const fetchedAvatarUrl = await getAvatarUrl(user.$id);
				avatarUrl = fetchedAvatarUrl; // Update the global store
			}
		} catch {
			userStore.set(null);
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

<div class="min-h-screen font-sans">
	<div class="container mx-auto px-4 py-12">
		<div class="mx-auto max-w-2xl">
			<div class="glass-card w-full p-8 backdrop-blur-xl">
				<div class="mb-8 flex items-center justify-between">
					<h2 class="text-3xl font-black text-base-content">Seu Perfil</h2>
					<button class="btn text-error btn-ghost btn-sm hover:bg-error/10" onclick={logout}>
						<LogOut class="mr-2 h-4 w-4" />
						Sair
					</button>
				</div>

				{#if message}
					<div
						role="alert"
						class={`mb-6 flex items-center gap-2 rounded-xl border p-4 text-sm font-bold ${
							messageType === 'success'
								? 'border-success/30 bg-success/10 text-success'
								: 'border-error/30 bg-error/10 text-error'
						}`}
					>
						<span>{message}</span>
					</div>
				{/if}

				<!-- Avatar Section -->
				<div class="mb-8 flex flex-col items-center gap-6">
					<div class="group relative">
						<div
							class="rounded-full ring-4 ring-white/30 transition-all group-hover:ring-primary/50"
						>
							<Avatar name={user?.name} src={avatarUrl} size="w-32 h-32" textSize="text-4xl" />
						</div>
						<button
							class="btn absolute -right-2 -bottom-2 btn-circle border-4 border-white shadow-lg transition-transform btn-primary hover:scale-110"
							onclick={openModal}
							aria-label="Editar foto de perfil"
						>
							<Pencil class="h-4 w-4" />
						</button>
					</div>
					<div class="text-center">
						<h3 class="text-xl font-bold">{user?.name}</h3>
						<p class="text-sm opacity-60">{user?.email}</p>
					</div>
				</div>

				<div class="divider opacity-20"></div>

				<!-- Name Section -->
				<div class="form-control mb-6">
					<label class="label pl-0" for="name">
						<span class="label-text font-bold text-base-content/70">Nome de Exibição</span>
					</label>
					<div class="flex gap-3">
						<input
							id="name"
							type="text"
							class="glass-input input flex-1 bg-white/20 focus:bg-white/40"
							placeholder="Como você quer ser chamado"
							bind:value={newName}
						/>
						<button class="btn px-8 btn-primary" onclick={updateName} disabled={loading}>
							{#if loading}
								<span class="loading loading-sm loading-spinner"></span>
							{:else}
								Salvar
							{/if}
						</button>
					</div>
					<div class="label pl-0">
						<span class="label-text-alt opacity-50">Este nome aparecerá em suas avaliações</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<!-- Avatar Edit Modal -->
{#if showModal}
	<dialog class="modal modal-bottom backdrop-blur-sm sm:modal-middle" open>
		<div class="glass-card modal-box border border-white/20 p-8 shadow-2xl">
			<h3 class="mb-6 text-center text-xl font-bold">Alterar Foto de Perfil</h3>

			<div class="flex flex-col items-center gap-6">
				<div class="placeholder avatar">
					<div
						class="w-32 rounded-full bg-base-300 ring ring-primary ring-offset-2 ring-offset-base-100"
					>
						{#if imageElement && imageElement.src}
							<img src={imageElement.src} alt="Preview" class="object-cover" />
						{:else}
							<span class="text-4xl opacity-20"><Pencil /></span>
						{/if}
					</div>
				</div>

				<div class="form-control w-full">
					<input
						type="file"
						accept="image/*"
						class="glass-input file-input w-full file-input-primary"
						onchange={handleFileSelect}
					/>
					<div class="label">
						<span class="label-text-alt opacity-50">Formatos aceitos: JPG, PNG, WEBP</span>
					</div>
				</div>

				<div class="flex w-full gap-3">
					<button
						class="glass-btn btn flex-1 border-0 hover:bg-white/40"
						onclick={closeModal}
						disabled={loading}
					>
						Cancelar
					</button>
					<button
						class="btn flex-1 shadow-lg shadow-primary/20 btn-primary"
						onclick={uploadAvatar}
						disabled={loading || !avatarFile}
					>
						{#if loading}
							<span class="loading loading-spinner"></span>
						{:else}
							Atualizar Foto
						{/if}
					</button>
				</div>
			</div>
		</div>
		<form method="dialog" class="modal-backdrop">
			<button onclick={closeModal}>close</button>
		</form>
	</dialog>
{/if}

<!-- Hidden image element for preview logic -->
<img bind:this={imageElement} class="hidden" alt="hidden preview" />
