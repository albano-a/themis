<script>
	import './layout.css';
	import favicon from '$lib/assets/correct.png';
	import Navbar from '$lib/components/Navbar.svelte';
	import { page } from '$app/stores';
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="mx-auto">
	{#if $page.url.pathname !== '/register' && $page.url.pathname !== '/login' && $page.url.pathname !== '/forgot-password' && !$page.url.pathname.startsWith('/reset-password')}
		<Navbar />
	{/if}
	{@render children()}
</div>
