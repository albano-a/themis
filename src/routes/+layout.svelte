<script>
	import './layout.css';
	import favicon from '$lib/assets/correct.png';
	import Navbar from '$lib/components/Navbar.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="mx-auto">
	<Navbar />
	{@render children()}
</div>
