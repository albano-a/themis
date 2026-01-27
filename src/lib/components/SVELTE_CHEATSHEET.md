
`$state()` - replaces `let` for reactive variables

```js
let cnt = $state(0);
let usr = $state({ nm: 'Bob', age: 45 });
```

`$derived()` - replaces `$:` reactive declarations

```js
let dbl = $derived(cnt * 2);
let full = $derived(`${usr.nm} is ${usr.age} years old`);
```

`$effect()` - replaces `$:` for side effects, runs after DOM updates

```js
$effect(() => {
  console.log(cnt);
  document.title = `Count: ${cnt}`;
});
```

`$props()` - replaces `export let`

```js
let { title, val = 0 } = $props();
```

`$bindable()` - for two-way binding

```js
let { val = $bindable(0) } = $props();
```

Use regular `onclick` instead of `on:click`

```html
<button onclick={() => cnt++}>Increment</button>
```

Replace slots with snippets
```html
{#snippet hdr()}
  <h1>Title</h1>
{/snippet}

{@render hdr()}
```