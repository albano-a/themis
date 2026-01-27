<script lang="ts">
	import { Mail, Lock, User, ArrowRight, Loader2, AlertCircle } from 'lucide-svelte';
	import { account, tablesDB, DATABASE_ID, USERS_TABLE_ID } from '$lib/appwrite';
	import { ID } from 'appwrite';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let loading = $state(false);
	let error = $state('');

	onMount(async () => {
		try {
			await account.get();
			await goto('/profile');
		} catch {
			// User not logged in, stay on register page
		}
	});

	/**
	 * Handles the registration form submission.
	 * @param {Event} e - The form submit event.
	 */
	async function register(e: Event) {
		e.preventDefault();
		loading = true;
		error = '';

		// Basic validation
		if (password !== confirmPassword) {
			error = 'As senhas não coincidem.';
			loading = false;
			return;
		}

		if (password.length < 8) {
			error = 'A senha deve ter pelo menos 8 caracteres.';
			loading = false;
			return;
		}

		try {
			// Create account in Auth
			const user = await account.create({
				userId: ID.unique(),
				email: email,
				password: password,
				name: name
			});

			// Create user entry in users table
			await tablesDB.createRow({
				databaseId: DATABASE_ID,
				tableId: USERS_TABLE_ID,
				rowId: ID.unique(),
				data: {
					userId: user.$id,
					name: name,
					email: email,
					avatarId: null
				}
			});

			// Auto-login after registration
			await account.createEmailPasswordSession({ email: email, password: password });
			await goto('/profile');
		} catch (err: any) {
			console.error(err);
			error = err.message || 'Erro ao criar conta.';
		} finally {
			loading = false;
		}
	}
</script>

<div class="flex min-h-screen w-full items-center justify-center p-4 font-sans">
	<div class="glass-card w-full max-w-md p-8 backdrop-blur-xl">
		<div class="mb-8 text-center">
			<a href="/" class="mb-4 block text-4xl font-black tracking-tighter text-primary">Classefy</a>
			<h1 class="text-2xl font-bold text-base-content">Criar conta</h1>
			<p class="mt-2 text-sm text-base-content/60">
				Junte-se a nós para uma comunidade acadêmica mais transparente.
			</p>
		</div>

		{#if error}
			<div
				role="alert"
				class="mb-6 flex items-center gap-3 rounded-xl border border-error/20 bg-error/10 p-4 text-sm text-error"
			>
				<AlertCircle class="h-5 w-5 shrink-0" />
				<span>{error}</span>
			</div>
		{/if}

		<form onsubmit={register} class="space-y-4">
			<!-- Name -->
			<div class="form-control">
				<label class="label pl-1" for="name">
					<span class="label-text font-bold text-base-content/70">Nome Completo</span>
				</label>
				<div class="relative">
					<input
						id="name"
						type="text"
						placeholder="Seu nome"
						class="glass-input input input-lg w-full pl-11 text-sm transition-all focus:bg-white/60 focus:ring-4 focus:ring-primary/10"
						required
						bind:value={name}
					/>
					<User
						class="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-base-content/40"
					/>
				</div>
			</div>

			<!-- Email -->
			<div class="form-control">
				<label class="label pl-1" for="email">
					<span class="label-text font-bold text-base-content/70">Email</span>
				</label>
				<div class="relative">
					<input
						id="email"
						type="email"
						placeholder="seu@email.com"
						class="glass-input input input-lg w-full pl-11 text-sm transition-all focus:bg-white/60 focus:ring-4 focus:ring-primary/10"
						required
						bind:value={email}
					/>
					<Mail
						class="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-base-content/40"
					/>
				</div>
			</div>

			<!-- Password -->
			<div class="form-control">
				<label class="label pl-1" for="password">
					<span class="label-text font-bold text-base-content/70">Senha</span>
				</label>
				<div class="relative">
					<input
						id="password"
						type="password"
						placeholder="••••••••"
						class="glass-input input input-lg w-full pl-11 text-sm transition-all focus:bg-white/60 focus:ring-4 focus:ring-primary/10"
						required
						bind:value={password}
					/>
					<Lock
						class="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-base-content/40"
					/>
				</div>
			</div>

			<!-- Confirm Password -->
			<div class="form-control">
				<label class="label pl-1" for="confirmPassword">
					<span class="label-text font-bold text-base-content/70">Confirmar Senha</span>
				</label>
				<div class="relative">
					<input
						id="confirmPassword"
						type="password"
						placeholder="••••••••"
						class="glass-input input input-lg w-full pl-11 text-sm transition-all focus:bg-white/60 focus:ring-4 focus:ring-primary/10"
						required
						bind:value={confirmPassword}
					/>
					<Lock
						class="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-base-content/40"
					/>
				</div>
			</div>

			<button
				class="btn mt-4 w-full rounded-xl text-base font-bold shadow-lg transition-all btn-lg btn-primary hover:scale-[1.02] hover:shadow-primary/25"
				disabled={loading}
			>
				{#if loading}
					<span class="loading loading-md loading-dots"></span>
				{:else}
					Criar Conta
					<ArrowRight class="h-5 w-5" />
				{/if}
			</button>
		</form>

		<div class="mt-8 text-center text-sm text-base-content/60">
			Já tem uma conta?
			<a href="/login" class="link font-bold link-primary hover:underline"> Fazer login </a>
		</div>
	</div>
</div>
