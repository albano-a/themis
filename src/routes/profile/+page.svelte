<script lang="ts">
	import { account, storage, BUCKET_ID } from '$lib/appwrite';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { User, LogOut, Edit, Upload } from 'lucide-svelte';
	import type { Models } from 'appwrite';

	let user: Models.User | null = $state(null);
	let newName: string = $state('');
	let loading: boolean = $state(false);
	let avatarFile: File | null = $state(null);
	let avatarUrl: string = $state('');
	let message: string = $state('');
	let messageType: 'success' | 'error' | '' = $state('');
	let showModal: boolean = $state(false);
	let imageElement: HTMLImageElement | null = $state(null);

	onMount(async () => {
		try {
			user = await account.get();
			newName = user.name || '';
			const prefs = await account.getPrefs();
			if (prefs.avatarId) {
				avatarUrl = storage.getFileView(BUCKET_ID, prefs.avatarId);
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
			await account.updatePrefs({ avatarId: uploadedFile.$id });
			avatarUrl = storage.getFileView(BUCKET_ID, uploadedFile.$id);
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

	function getInitials(name: string | undefined): string {
		if (!name) return 'AA';
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
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
							{#if avatarUrl}
								<img src={avatarUrl} alt="Avatar" class="h-24 w-24 rounded-full object-cover" />
							{:else}
								<div class="avatar-placeholder avatar">
									<div class="w-24 rounded-full bg-primary text-primary-content">
										<span class="text-3xl font-bold">{getInitials(user?.name)}</span>
									</div>
								</div>
							{/if}
							<button
								class="hover:bg-primary-focus btn absolute -right-2 -bottom-2 btn-circle border-primary bg-primary btn-sm"
								onclick={openModal}
							>
								<Edit class="h-4 w-4" />
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
