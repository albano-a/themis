<script lang="ts">
	import { Mail, Lock, User, ArrowRight, Loader2, AlertCircle } from 'lucide-svelte';
	import { account } from '$lib/appwrite';
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
			// Generate a unique userId using Appwrite's ID.unique()
			const idUser = ID.unique();
			// Create the user account
			await account.create({ userId: idUser, email: email, password: password, name: name });
			// After creating, create a session to log the user in
			await account.createEmailPasswordSession({ email: email, password: password });
			// Redirect to home or dashboard
			await goto('/');
		} catch (err) {
			console.error(err);
			const errorObj = err as any;
			// Handle specific errors
			if (errorObj.type === 'user_already_exists') {
				error = 'Este email já está registrado.';
			} else {
				error = errorObj.message || 'Erro ao criar conta.';
			}
		} finally {
			loading = false;
		}
	}
</script>

<div class="hero min-h-screen bg-base-200 font-sans">
	<!-- Background Accents -->
	<div
		class="absolute top-0 left-0 -mt-20 -ml-20 h-96 w-96 rounded-full bg-primary/20 blur-3xl"
	></div>
	<div
		class="absolute right-0 bottom-0 -mr-20 -mb-20 h-96 w-96 rounded-full bg-secondary/20 blur-3xl"
	></div>

	<div class="hero-content w-full flex-col lg:flex-row-reverse">
		<div class="card w-full max-w-sm shrink-0 bg-base-100 shadow-2xl">
			<div class="card-body">
				<div class="text-center">
					<h1 class="text-3xl font-black">Criar Conta</h1>
					<p class="py-2 text-sm opacity-70">Junte-se à comunidade e avalie seus professores.</p>
				</div>

				<!-- Error Message -->
				{#if error}
					<div role="alert" class="alert rounded-lg py-2 text-sm alert-error">
						<AlertCircle class="h-4 w-4" />
						<span>{error}</span>
					</div>
				{/if}

				<form class="form-control gap-3" onsubmit={register}>
					<!-- Name Input -->
					<div>
						<div class="label">
							<span class="label-text font-bold">Nome</span>
						</div>
						<label class="input-bordered input flex items-center gap-2">
							<User class="h-4 w-4 opacity-70" />
							<input
								type="text"
								class="grow"
								placeholder="Seu nome completo"
								required
								bind:value={name}
							/>
						</label>
					</div>

					<!-- Email Input -->
					<div>
						<div class="label">
							<span class="label-text font-bold">Email</span>
						</div>
						<label class="input-bordered input flex items-center gap-2">
							<Mail class="h-4 w-4 opacity-70" />
							<input
								type="email"
								class="grow"
								placeholder="seu@email.com"
								required
								bind:value={email}
							/>
						</label>
					</div>

					<!-- Password Input -->
					<div>
						<div class="label">
							<span class="label-text font-bold">Senha</span>
						</div>
						<label class="input-bordered input flex items-center gap-2">
							<Lock class="h-4 w-4 opacity-70" />
							<input
								type="password"
								class="grow"
								placeholder="••••••••"
								required
								bind:value={password}
							/>
						</label>
					</div>

					<!-- Confirm Password Input -->
					<div>
						<div class="label">
							<span class="label-text font-bold">Confirmar Senha</span>
						</div>
						<label class="input-bordered input flex items-center gap-2">
							<Lock class="h-4 w-4 opacity-70" />
							<input
								type="password"
								class="grow"
								placeholder="••••••••"
								required
								bind:value={confirmPassword}
							/>
						</label>
					</div>

					<!-- Submit Button -->
					<div class="form-control mt-6">
						<button class="btn rounded-full text-lg btn-primary" disabled={loading}>
							{#if loading}
								<Loader2 class="h-5 w-5 animate-spin" />
							{:else}
								Criar Conta
								<ArrowRight class="h-5 w-5" />
							{/if}
						</button>
					</div>
				</form>

				<div class="label mt-4 justify-center">
					<span class="label-text-alt"
						>Já tem uma conta? <a href="/login" class="link font-bold link-primary">Entrar</a></span
					>
				</div>
			</div>
		</div>
	</div>
</div>
