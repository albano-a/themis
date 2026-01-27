<script lang="ts">
	import { getInitials } from '$lib/utils';

	// Accept optional src to support per-user avatars (not just the global store)
	let { name, size = 'h-10 w-10', textSize = 'text-md', src = null } = $props();
</script>

{#if src}
	<div class={size + ' overflow-hidden rounded-full'}>
		<img {src} alt="Avatar" class="h-full w-full rounded-full object-cover" />
	</div>
{:else}
	<div class="avatar avatar-placeholder">
		<div
			class={size +
				' flex items-center justify-center rounded-full bg-primary text-primary-content'}
		>
			<span class={textSize + ' font-bold'}>{getInitials(name)}</span>
		</div>
	</div>
{/if}
